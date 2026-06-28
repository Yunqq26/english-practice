// ========================================
// analyzer.js — Translation Analysis Engine
// ========================================

const Analyzer = {

  // ---- 1. Build synonym map from question keywords ----
  _buildSynonymMap(keywords) {
    const map = {}; // lowercased word -> set of synonyms
    if (!keywords) return map;
    keywords.forEach(kw => {
      const word = kw.word.toLowerCase();
      if (!map[word]) map[word] = new Set();
      kw.synonyms.forEach(s => {
        const sLower = s.toLowerCase();
        map[word].add(sLower);
        if (!map[sLower]) map[sLower] = new Set();
        map[sLower].add(word);
      });
    });
    return map;
  },

  // ---- 2. Synonym-aware word diff ----
  wordDiff(userAnswer, reference, keywords) {
    const synonymMap = this._buildSynonymMap(keywords);
    const tokenize = s => s.toLowerCase()
      .replace(/[.,!?;:""''()'‘’“”\-–—]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
    const user = tokenize(userAnswer);
    const ref = tokenize(reference);

    // Build LCS table
    const m = user.length, n = ref.length;
    const dp = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (user[i-1] === ref[j-1] || this._isSynonym(user[i-1], ref[j-1], synonymMap)) {
          dp[i][j] = dp[i-1][j-1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        }
      }
    }

    // Backtrack
    const result = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0) {
        if (user[i-1] === ref[j-1]) {
          result.unshift({ type: 'same', word: ref[j-1] });
          i--; j--;
        } else if (this._isSynonym(user[i-1], ref[j-1], synonymMap)) {
          result.unshift({ type: 'synonym', word: `${user[i-1]} → ${ref[j-1]}`, userWord: user[i-1], refWord: ref[j-1] });
          i--; j--;
        } else if (dp[i][j-1] >= dp[i-1][j]) {
          result.unshift({ type: 'missing', word: ref[j-1] });
          j--;
        } else {
          result.unshift({ type: 'extra', word: user[i-1] });
          i--;
        }
      } else if (j > 0) {
        result.unshift({ type: 'missing', word: ref[j-1] });
        j--;
      } else {
        result.unshift({ type: 'extra', word: user[i-1] });
        i--;
      }
    }

    // Merge adjacent extra+missing into substituted
    for (let k = 0; k < result.length - 1; k++) {
      if (result[k].type === 'extra' && result[k+1].type === 'missing') {
        result[k].type = 'substituted';
        result[k].word = `${result[k].word} → ${result[k+1].word}`;
        result[k+1].type = 'skip';
      }
    }

    return result.filter(w => w.type !== 'skip');
  },

  _isSynonym(word, refWord, synonymMap) {
    if (!synonymMap || !Object.keys(synonymMap).length) return false;
    const syns = synonymMap[refWord];
    if (syns && syns.has(word)) return true;
    // Also check if refWord is a synonym of word
    const revSyns = synonymMap[word];
    if (revSyns && revSyns.has(refWord)) return true;
    return false;
  },

  renderDiff(diff) {
    return diff.map(w => {
      if (w.type === 'synonym') {
        return `<span class="diff-word synonym" title="Synonym of '${this._escapeHtml(w.refWord)}'">${this._escapeHtml(w.userWord)}</span>`;
      }
      return `<span class="diff-word ${w.type}">${this._escapeHtml(w.word)}</span>`;
    }).join(' ');
  },

  /**
   * 把用户答案逐词与参考答案对照，标红划掉错误词+在旁边给出正确表达
   * @param {string} userAnswer - 用户原始答案（保留大小写）
   * @param {string} reference - 参考答案
   * @param {Array} keywords - 踩分词 [{ word, synonyms }]
   * @returns {string} HTML
   */
  renderInlineCorrection(userAnswer, reference, keywords) {
    const diff = this.wordDiff(userAnswer, reference, keywords);
    const userTokens = userAnswer.replace(/[.,!?;:""''()'‘’“”\-–—]/g, ' ')
      .split(/\s+/).filter(Boolean);
    const refTokens = reference.replace(/[.,!?;:""''()'‘’“”\-–—]/g, ' ')
      .split(/\s+/).filter(Boolean);

    // 从 diff 重建带标注的 HTML
    let parts = [];
    let ui = 0, ri = 0; // user index, ref index

    for (let d of diff) {
      if (d.type === 'same') {
        parts.push(`<span class="ic-word ic-correct">${this._escapeHtml(userTokens[ui] || d.word)}</span>`);
        ui++; ri++;
      } else if (d.type === 'synonym') {
        parts.push(`<span class="ic-word ic-synonym" title="同义词替换 '${this._escapeHtml(d.refWord)}'">${this._escapeHtml(userTokens[ui] || d.userWord)}</span>`);
        ui++; ri++;
      } else if (d.type === 'extra') {
        // 用户多写的词 → 红标
        parts.push(`<span class="ic-word ic-extra">${this._escapeHtml(userTokens[ui] || d.word)}</span>`);
        ui++;
      } else if (d.type === 'missing') {
        // 用户漏了的词 → 绿底插入
        parts.push(`<span class="ic-word ic-missing">${this._escapeHtml(refTokens[ri] || d.word)}</span>`);
        ri++;
      } else if (d.type === 'substituted') {
        // 用户写错 → 红划线 + 绿色正确词
        const wrong = userTokens[ui] || '';
        const correct = refTokens[ri] || '';
        parts.push(`<span class="ic-sub"><span class="ic-wrong">${this._escapeHtml(wrong)}</span><span class="ic-arrow">→</span><span class="ic-fix">${this._escapeHtml(correct)}</span></span>`);
        ui++; ri++;
      }
    }
    return parts.join(' ');
  },


  /**
   * 分析用户答案中的错误，生成逐词错误解释
   */
  explainErrors(diff, userAnswer, reference) {
    const tokenize = s => s.toLowerCase().replace(/[.,!?;:""''()''-]/g, ' ').split(/\s+/).filter(Boolean);
    const userTokens = tokenize(userAnswer);
    const refTokens = tokenize(reference);
    const errors = [];
    for (const d of diff) {
      if (d.type === 'same') { /* ok */ }
      else if (d.type === 'synonym') {
        errors.push({type:'synonym',userWord:d.userWord,refWord:d.refWord,reason:'同义词替换，可以接受',fix:'继续使用即可'});
      } else if (d.type === 'extra') {
        errors.push({type:'extra',userWord:d.word,refWord:'',reason:'多余的词，标准答案中不需要这个词',fix:'删除 "'+this._escapeHtml(d.word)+'"'});
      } else if (d.type === 'missing') {
        errors.push({type:'missing',userWord:'',refWord:d.word,reason:'遗漏了必要的词',fix:'补充 "'+this._escapeHtml(d.word)+'"'});
      } else if (d.type === 'substituted') {
        const parts = d.word.split(' \u2192 ');
        const uw = parts[0] || '';
        const rw = parts[1] || '';
        const explanation = this._explainError(uw, rw, userAnswer, reference, userTokens, refTokens);
        errors.push({type:'substituted',userWord:uw,refWord:rw,reason:explanation.reason,fix:explanation.fix});
      }
    }
    if (!errors.length) return '';
    let html = '<div style="margin-top:10px;padding:12px 16px;background:#fff8f8;border-radius:10px;border:1px solid #fecaca">';
    html += '<div style="font-size:0.85rem;font-weight:600;color:#e74c3c;margin-bottom:8px">❌ 逐词纠错</div>';
    for (let i = 0; i < errors.length; i++) {
      const e = errors[i];
      const bg = e.type === 'synonym' ? '#f0f8ff' : '#fff5f5';
      const color = e.type === 'synonym' ? '#4361ee' : '#e74c3c';
      html += '<div style="background:'+bg+';border-radius:8px;padding:10px 14px;margin-bottom:6px;border-left:3px solid '+color+'">';
      if (e.userWord) {
        html += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">' +
          '<span style="color:#e74c3c;text-decoration:line-through;font-weight:600">'+this._escapeHtml(e.userWord)+'</span>';
        if (e.refWord) html += '<span style="color:#999">\u2192</span><span style="color:#27ae60;font-weight:600">'+this._escapeHtml(e.refWord)+'</span>';
        html += '</div>';
      } else {
        html += '<div style="margin-bottom:2px"><span style="color:#27ae60;font-weight:600">\u7f3a少: '+this._escapeHtml(e.refWord)+'</span></div>';
      }
      html += '<div style="font-size:0.82rem;color:#555;line-height:1.5">\ud83d\udccc '+e.reason+'</div>';
      html += '<div style="font-size:0.82rem;color:#27ae60;line-height:1.5">\ud83d\udca1 '+e.fix+'</div></div>';
    }
    html += '</div>';
    return html;
  },

  /** 根据具体句子上下文解释错误原因 */
  _explainError(userWord, refWord, userAnswer, reference, userTokens, refTokens) {
    const uw = userWord.toLowerCase();
    const rw = refWord.toLowerCase();

    // 找到错误词在句子中的位置，分析上下文
    const userIdx = userTokens.findIndex(t => t === uw);
    const refIdx = refTokens.findIndex(t => t === rw);

    // 获取前一个词（可能是主语）
    const prevUserWord = userIdx > 0 ? userTokens[userIdx - 1] : '';
    const prevRefWord = refIdx > 0 ? refTokens[refIdx - 1] : '';

    // 查找句中的时间标志词
    const pastMarkers = ['yesterday', 'last', 'ago', 'in 2020', 'in 2021', 'in 2022', 'in 2023', 'just now', 'the day before', 'previously', 'once', 'used to'];
    const presentMarkers = ['every day', 'every week', 'every year', 'always', 'usually', 'often', 'sometimes', 'never', 'generally'];
    const futureMarkers = ['tomorrow', 'next', 'soon', 'later', 'in the future', 'will', 'shall'];
    const hasPast = pastMarkers.some(m => userTokens.join(' ').includes(m));
    const hasPresent = presentMarkers.some(m => userTokens.join(' ').includes(m));

    // 判断主语是否是第三人称单数
    const thirdPersonSubjects = ['he','she','it','this','that','everyone','everybody','someone','somebody','no one','nobody','each','either','neither'];
    const firstPersonSubjects = ['i','we'];
    const pluralSubjects = ['they','you','we','these','those'];
    const isThirdPerson = thirdPersonSubjects.includes(prevUserWord);
    const isPlural = pluralSubjects.includes(prevUserWord);

    // 构建不规则动词表
    const tenseMap = {"go":["went","gone","goes","going"],"come":["came","comes","coming"],"take":["took","taken","takes","taking"],"make":["made","makes","making"],"have":["had","has","having"],"do":["did","done","does","doing"],"get":["got","gotten","gets","getting"],"see":["saw","seen","sees","seeing"],"know":["knew","known","knows"],"think":["thought","thinks","thinking"],"say":["said","says","saying"],"tell":["told","tells","telling"],"give":["gave","given","gives","giving"],"find":["found","finds","finding"],"keep":["kept","keeps","keeping"],"leave":["left","leaves","leaving"],"meet":["met","meets","meeting"],"write":["wrote","written","writes","writing"],"speak":["spoke","spoken","speaks","speaking"],"build":["built","builds","building"],"buy":["bought","buys","buying"],"bring":["brought","brings","bringing"],"catch":["caught","catches","catching"],"choose":["chose","chosen","chooses","choosing"],"begin":["began","begun","begins","beginning"],"break":["broke","broken","breaks","breaking"],"drink":["drank","drunk","drinks","drinking"],"eat":["ate","eaten","eats","eating"],"fall":["fell","fallen","falls","falling"],"feel":["felt","feels","feeling"],"grow":["grew","grown","grows","growing"],"hold":["held","holds","holding"],"lead":["led","leads","leading"],"lose":["lost","loses","losing"],"pay":["paid","pays","paying"],"send":["sent","sends","sending"],"spend":["spent","spends","spending"],"stand":["stood","stands","standing"],"teach":["taught","teaches","teaching"],"understand":["understood","understands","understanding"],"wear":["wore","worn","wears","wearing"],"win":["won","wins","winning"]};

    // 查找动词属于哪个不规则动词
    let verbBase = null;
    for (const [base, forms] of Object.entries(tenseMap)) {
      if ([base,...forms].includes(uw) && [base,...forms].includes(rw) && uw !== rw) {
        verbBase = { base, forms };
        break;
      }
    }

    if (verbBase) {
      // 判断是原形→三单还是三单→原形
      if (rw.endsWith('s') && !uw.endsWith('s') && (rw === verbBase.base + 's' || rw === verbBase.base + 'es')) {
        const subject = prevUserWord ? '「' + prevUserWord + '」' : '主语';
        return {reason:'主谓不一致：' + subject + ' 是第三人称单数，动词应用 ' + rw + '（加 s/es）',fix:'将 "' + uw + '" 改为第三人称单数形式 "' + rw + '"'};
      }
      if (uw.endsWith('s') && !rw.endsWith('s') && (uw === verbBase.base + 's' || uw === verbBase.base + 'es')) {
        return {reason:'主谓不一致：主语不是第三人称单数时，动词不用加 s',fix:'将 "' + uw + '" 改为动词原形 "' + rw + '"'};
      }

      // 判断时态
      if (hasPast) {
        return {reason:'时态错误：句中包含过去时间词，表示过去发生的动作',fix:'将 "' + uw + '" 改为过去式 "' + rw + '"'};
      }
      // 过去式
      if (rw === verbBase.base + 'ed' || (rw.endsWith('ed') && !uw.endsWith('ed')) || (verbBase.forms.includes(rw) && rw !== verbBase.base && !rw.endsWith('s') && !rw.endsWith('ing'))) {
        if (uw === verbBase.base) {
          return {reason:'时态错误：这句话描述的是过去发生的事情，动词应该用过去式',fix:'将 "' + uw + '" 改为过去式 "' + rw + '"'};
        }
      }
      if (uw.endsWith('ed') && rw === verbBase.base) {
        return {reason:'时态错误：这句话描述的是客观事实或习惯性动作，应该用一般现在时',fix:'将 "' + uw + '" 改为动词原形 "' + rw + '"'};
      }

      // 现在分词
      if (rw.endsWith('ing') && !uw.endsWith('ing')) {
        return {reason:'时态错误：进行时中动词要用现在分词形式（-ing）',fix:'将 "' + uw + '" 改为现在分词 "' + rw + '"'};
      }

      // 过去分词
      if ((rw.endsWith('en') || rw === 'gone' || rw === 'been') && !uw.endsWith('en') && uw !== 'been') {
        return {reason:'时态错误：完成时或被动语态中动词要用过去分词形式',fix:'将 "' + uw + '" 改为过去分词 "' + rw + '"'};
      }

      // 默认时态说明
      const reason = hasPast ? '过去时间' : (hasPresent ? '一般现在时' : '');
      return {reason:'动词形式不正确' + (reason ? '（' + reason + '）' : ''),fix:'此处应用 "' + rw + '"'};
    }

    // be 动词
    const beVerbs = ['am','is','are','was','were','be','been','being'];
    if (beVerbs.includes(uw) && beVerbs.includes(rw) && uw !== rw) {
      if ((rw === 'is' || rw === 'was') && isThirdPerson) {
        return {reason:'主谓一致：' + prevUserWord + ' 是第三人称单数，be 动词应用 ' + rw,fix:'将 "' + uw + '" 改为 "' + rw + '"'};
      }
      if ((rw === 'are' || rw === 'were') && isPlural) {
        return {reason:'主谓一致：' + prevUserWord + ' 是复数，be 动词应用 ' + rw,fix:'将 "' + uw + '" 改为 "' + rw + '"'};
      }
      if (rw === 'am' && prevUserWord === 'i') {
        return {reason:'主语是 I 时，be 动词必须用 am',fix:'将 "' + uw + '" 改为 "am"'};
      }
      return {reason:'be 动词使用不当',fix:'此处应用 "' + rw + '"'};
    }

    // do/does/don't/doesn't
    if ((uw === 'do' && rw === 'does') || (uw === 'don\'t' && rw === 'doesn\'t')) {
      return {reason:'主语是第三人称单数时，助动词用 does/doesn\'t',fix:'将 "' + uw + '" 改为 "' + rw + '"'};
    }
    if ((uw === 'does' && rw === 'do') || (uw === 'doesn\'t' && rw === 'don\'t')) {
      return {reason:'主语不是第三人称单数时，助动词用 do/don\'t',fix:'将 "' + uw + '" 改为 "' + rw + '"'};
    }

    // 介词
    const preps = ['in','on','at','to','for','of','with','by','from','about','into','through','during','without','against','between','under','over','after','before'];
    if (preps.includes(uw) && preps.includes(rw)) {
      return {reason:'介词 "' + uw + '" 和 "' + rw + '" 混淆',fix:'此处应用 "' + rw + '"，请根据后面搭配的名词选择合适的介词'};
    }

    // 冠词
    const articles = ['a','an','the'];
    if (articles.includes(uw) && articles.includes(rw)) {
      return {reason:'冠词 "' + uw + '" 使用不当',fix:'此处应使用 "' + rw + '"'};
    }

    // 名词单复数
    if (uw + 's' === rw || uw === rw + 's') {
      return {reason:'名词单复数错误',fix:'此处应使用 ' + (rw.length > uw.length ? '复数形式 "' + rw + '"' : '单数形式 "' + rw + '"')};
    }

    return {reason:'此处推荐使用 "' + rw + '"',fix:'将 "' + uw + '" 改为 "' + rw + '"'};
  },  // ---- 3. Teacher-mode scoring ----
  scoreTranslation(userAnswer, reference, keywords, alternatives) {
    const user = userAnswer.toLowerCase().trim();
    const ref = reference.toLowerCase().trim();
    const synonymMap = this._buildSynonymMap(keywords);
    const allRefs = [ref, ...(alternatives || []).map(a => a.toLowerCase())];

    // ----- Meaning Score (0-5) -----
    // Check against reference + all alternatives, pick the best match
    let bestMeaningScore = 0;
    allRefs.forEach(alt => {
      const altWords = alt.replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
      const altContent = this._contentWords(altWords);
      const userWords = user.replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
      const userSet = new Set(userWords);

      let matched = 0;
      altContent.forEach(({ word }) => {
        if (userSet.has(word) || this._hasSynonymInSet(word, userSet, synonymMap)) {
          matched++;
        }
      });
      const score = altContent.length ? Math.round((matched / altContent.length) * 5) : 3;
      bestMeaningScore = Math.max(bestMeaningScore, Math.max(1, Math.min(5, score)));
    });

    // Also check key semantic units (phrases from reference)
    const semanticUnits = this._extractSemanticUnits(reference, keywords);
    let semanticMatched = 0;
    semanticUnits.forEach(unit => {
      const unitLower = unit.toLowerCase();
      if (user.includes(unitLower) || this._checkPhraseInAnswer(unit, user, synonymMap)) {
        semanticMatched++;
      }
    });
    const semanticScore = semanticUnits.length
      ? Math.round((semanticMatched / semanticUnits.length) * 5)
      : 3;
    const meaningScore = Math.max(1, Math.min(5, Math.round((bestMeaningScore + semanticScore) / 2)));

    // ----- Vocabulary Score (0-5) -----
    let vocabScore = 3;
    if (keywords && keywords.length) {
      let totalChecks = 0, passedChecks = 0;
      keywords.forEach(kw => {
        const kwWords = kw.word.toLowerCase().split(/\s+/);
        const userWords = user.replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
        totalChecks++;
        // Check if at least one word from keyword or its synonyms is used
        const allForms = [...kwWords];
        kw.synonyms.forEach(s => allForms.push(...s.toLowerCase().split(/\s+/)));
        const used = allForms.some(f => userWords.includes(f));
        if (used) passedChecks++;
      });
      const ratio = totalChecks ? passedChecks / totalChecks : 0;
      if (ratio >= 0.8) vocabScore = 5;
      else if (ratio >= 0.6) vocabScore = 4;
      else if (ratio >= 0.3) vocabScore = 3;
      else vocabScore = 2;
    }

    // ----- Grammar Score (0-5) -----
    const issues = this.checkGrammar(userAnswer);
    const issueCount = issues.length;
    let gramScore;
    if (issueCount === 0) gramScore = 5;
    else if (issueCount <= 1) gramScore = 4;
    else if (issueCount <= 3) gramScore = 3;
    else if (issueCount <= 5) gramScore = 2;
    else gramScore = 1;

    return {
      meaning: { score: meaningScore, max: 5 },
      vocabulary: { score: vocabScore, max: 5 },
      grammar: { score: gramScore, max: 5 },
      overall: Math.round((meaningScore * 0.4 + vocabScore * 0.3 + gramScore * 0.3) * 10) / 10,
      issues: issues,
      semanticUnits: { total: semanticUnits.length, matched: semanticMatched }
    };
  },

  _contentWords(words) {
    const stopWords = new Set(['the','a','an','in','on','at','to','for','of','with','by','and','or','but','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','can','could','may','might','shall','should','it','its','this','that','these','those','i','you','he','she','we','they','my','your','his','her','our','their','not','no','nor','so','as','from','about','than','then','if','because','while','when','where','how','what','which','who','whom']);
    return words.filter(w => !stopWords.has(w)).map(w => ({ word: w }));
  },

  _hasSynonymInSet(word, wordSet, synonymMap) {
    if (!synonymMap) return false;
    const syns = synonymMap[word];
    if (!syns) return false;
    for (const s of syns) {
      if (wordSet.has(s)) return true;
    }
    return false;
  },

  _extractSemanticUnits(reference, keywords) {
    const units = [];
    // Key phrases from keywords
    if (keywords) {
      keywords.forEach(kw => {
        units.push(kw.word);
      });
    }
    // Extract longer phrases from reference (up to 4 words)
    const words = reference.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
    for (let len = 3; len <= 4; len++) {
      for (let i = 0; i <= words.length - len; i++) {
        const phrase = words.slice(i, i + len).join(' ');
        units.push(phrase);
      }
    }
    // Deduplicate
    return [...new Set(units)];
  },

  _checkPhraseInAnswer(phrase, userLower, synonymMap) {
    const pWords = phrase.split(/\s+/);
    const uWords = userLower.replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
    // Check if all words in phrase (or synonyms) exist in answer
    let allFound = true;
    for (const pw of pWords) {
      if (!uWords.includes(pw) && !this._hasSynonymInSet(pw, new Set(uWords), synonymMap)) {
        allFound = false;
        break;
      }
    }
    return allFound;
  },

  // ---- 4. Teacher Feedback (Chinese, problem-focused) ----
  generateFeedback(scores, keywords, userAnswer, reference) {
    const parts = [];

    // Opening - brief, straight to the point
    if (scores.overall >= 4.5) {
      parts.push("整体翻译质量不错。以下是需要注意的地方：");
    } else if (scores.overall >= 3.5) {
      parts.push("基本意思表达出来了，但还有一些地方可以改进：");
    } else if (scores.overall >= 2.5) {
      parts.push("有些关键点没有翻译到位，需要加强：");
    } else {
      parts.push("翻译中有较多问题，建议重点学习以下踩分点：");
    }

    // Meaning
    if (scores.meaning.score < 3) {
      parts.push("• 意思表达不够准确，核心信息遗漏较多。建议先理解整句含义再动笔翻译。");
    } else if (scores.meaning.score < 4) {
      parts.push("• 主要意思有了，但部分细节需要更精确。注意原文中的修饰成分不能漏译。");
    } else {
      parts.push("• 意思表达清楚了。");
    }

    // Vocabulary
    if (scores.vocabulary.score < 3) {
      parts.push("• 词汇使用偏简单/不准确，建议用更地道的表达。参考下方「踩分点」中的推荐词汇。");
    } else if (scores.vocabulary.score < 4) {
      parts.push("• 词汇基本正确，可以尝试用同义词替换来丰富表达。");
    }

    // Grammar
    if (scores.grammar.score < 3) {
      parts.push("• 语法错误较多，注意检查：时态是否一致、主谓是否搭配、冠词和介词的使用。");
    } else if (scores.grammar.score < 4) {
      parts.push("• 有个别语法小问题，参考下方「语法检查」部分修改。");
    }

    // Specific keyword suggestions
    if (keywords && keywords.length > 0) {
      const userWords = userAnswer.toLowerCase().replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
      const missed = keywords.filter(kw => {
        const kwWords = kw.word.toLowerCase().split(/\s+/);
        return !kwWords.every(w => userWords.includes(w)) &&
               !kw.synonyms.some(s => s.toLowerCase().split(/\s+/).every(w => userWords.includes(w)));
      });
      if (missed.length > 0) {
        const tips = missed.map(kw => `「${kw.word}」→ ${kw.synonyms.slice(0, 2).join('、')}`).join('；');
        parts.push(`• 建议重点掌握以下词汇：${tips}。可以点击单词旁的🔊听发音。`);
      }
    }

    // Call to action
    if (scores.overall < 4) {
      parts.push("📌 建议把踩分点中没掌握的单词加入「生词夹」，后续通过复习功能巩固记忆。");
    } else {
      parts.push("📌 可以把不熟悉的同义表达加入「生词夹」来拓展词汇量。");
    }

    return parts.join('\n\n');
  },

  renderScores(scores) {
    const barColor = s => {
      if (s >= 4) return '#27ae60';
      if (s >= 3) return '#f39c12';
      return '#e74c3c';
    };
    const star = (score, max) => '★'.repeat(score) + '☆'.repeat(max - score);

    return `
      <div class="score-item overall">
        <div class="score-label">Overall</div>
        <div class="score-value" style="color:${barColor(scores.overall)}">${scores.overall}/5.0</div>
        <div class="score-bar"><div class="score-bar-fill" style="width:${(scores.overall/5)*100}%;background:${barColor(scores.overall)}"></div></div>
      </div>
      <div class="score-item">
        <div class="score-label">Meaning</div>
        <div class="score-stars">${star(scores.meaning.score, scores.meaning.max)}</div>
        <div class="score-bar"><div class="score-bar-fill" style="width:${(scores.meaning.score/scores.meaning.max)*100}%;background:${barColor(scores.meaning.score)}"></div></div>
      </div>
      <div class="score-item">
        <div class="score-label">Vocabulary</div>
        <div class="score-stars">${star(scores.vocabulary.score, scores.vocabulary.max)}</div>
        <div class="score-bar"><div class="score-bar-fill" style="width:${(scores.vocabulary.score/scores.vocabulary.max)*100}%;background:${barColor(scores.vocabulary.score)}"></div></div>
      </div>
      <div class="score-item">
        <div class="score-label">Grammar</div>
        <div class="score-stars">${star(scores.grammar.score, scores.grammar.max)}</div>
        <div class="score-bar"><div class="score-bar-fill" style="width:${(scores.grammar.score/scores.grammar.max)*100}%;background:${barColor(scores.grammar.score)}"></div></div>
      </div>`;
  },

  // ---- 5. Grammar Checker ----
  checkGrammar(text) {
    const issues = [];

    // a) Subject-verb agreement
    const svaPatterns = [
      { re: /\b(he|she|it)\s+(go|come|run|take|make|have|do|get|say|know|think|see|want|give|find|tell|ask|work|seem|feel|try|leave|call)\b/gi, fix: m => `${m[1]} ${m[2]}s`, desc: '3rd person singular - add -s to verb' },
      { re: /\b(he|she|it)\s+don't\b/gi, fix: m => m[0].replace("don't", "doesn't"), desc: 'Use "doesn\'t" with he/she/it' },
    ];
    svaPatterns.forEach(({ re, fix, desc }) => {
      const match = text.match(re);
      if (match) {
        issues.push({ type: 'Subject-Verb Agreement', severity: 'major', desc: `"${match[0]}" — ${desc}`, fix: `Suggested: "${fix(match)}"` });
      }
    });

    // b) Article: "a" before vowel
    const aAnPattern = /\ba\s+([aeiou][a-z]*)\b/gi;
    let aanMatch;
    while ((aanMatch = aAnPattern.exec(text)) !== null) {
      if (/^[aeiou]/i.test(aanMatch[1])) {
        issues.push({ type: 'Article Usage', severity: 'minor', desc: `"a ${aanMatch[1]}" — use "an" before vowel sounds`, fix: `Suggested: "an ${aanMatch[1]}"` });
      }
    }

    // c) Double negatives
    const doubleNeg = /\b(no|not|never|none|nobody|nothing|nowhere)\b.*\b(no|not|never|none|nobody|nothing|nowhere)\b/i;
    if (doubleNeg.test(text)) {
      issues.push({ type: 'Double Negative', severity: 'major', desc: 'Using two negatives in one clause', fix: 'Remove one negative word' });
    }

    // d) Tense issues
    const tensePat = /\b(is|are|was|were)\s+(\w+ed)\b(?!\s+by)/gi;
    let tMatch;
    while ((tMatch = tensePat.exec(text)) !== null) {
      issues.push({ type: 'Tense / Verb Form', severity: 'major', desc: `"${tMatch[1]} ${tMatch[2]}" — after "be" use present participle (-ing) or past participle`, fix: `Check if you mean "${tMatch[1]} ${tMatch[2]}ing"` });
    }

    // e) Common Chinese-English preposition errors
    const prepPatterns = [
      { re: /\bdiscuss\s+about\b/i, desc: '"discuss about" is redundant', fix: 'Use "discuss" (no preposition needed)' },
      { re: /\bemphasize\s+on\b/i, desc: '"emphasize on" is redundant', fix: 'Use "emphasize" (no preposition)' },
      { re: /\bmention\s+about\b/i, desc: '"mention about" is redundant', fix: 'Use "mention" (no preposition)' },
      { re: /\bcomprise\s+of\b/i, desc: '"comprise of" is incorrect', fix: 'Use "comprise" or "consist of"' },
      { re: /\bpay\s+attention\s+on\b/i, desc: '"pay attention on" is incorrect', fix: 'Use "pay attention to"' },
      { re: /\bimpact\s+(to|on\s+the)\b/i, desc: 'Preposition with "impact"', fix: 'Use "impact on" (e.g. "impact on society")' },
    ];
    prepPatterns.forEach(({ re, desc, fix }) => {
      if (re.test(text)) {
        const m = text.match(re)[0];
        issues.push({ type: 'Preposition', severity: 'minor', desc: `"${m}" — ${desc}`, fix });
      }
    });

    // f) Uncountable nouns
    const uncountable = /\b(many|fewer)\s+(information|knowledge|advice|research|furniture|equipment|progress|traffic|weather|work|homework|evidence)\b/i;
    if (uncountable.test(text)) {
      const m = text.match(uncountable);
      const fixWord = m[1].toLowerCase() === 'many' ? 'much' : 'less';
      issues.push({ type: 'Countable/Uncountable', severity: 'minor', desc: `"${m[1]} ${m[2]}" — "${m[2]}" is uncountable`, fix: `Use "${fixWord} ${m[2]}"` });
    }

    // g) Missing articles before singular countable nouns
    const articlePat = /\b(has|have|is|are|was|were|become|becomes|became)\s+(a[n]?|the)\s+(\w+)\s+(\w+)\b/i;
    // This is complex to check reliably, skip for now

    return issues;
  },

  renderGrammarIssues(issues) {
    if (!issues || issues.length === 0) {
      return '<div class="grammar-clean">✓ No grammar issues found. Well done!</div>';
    }
    return issues.map(iss => `
      <div class="grammar-issue">
        <div class="issue-type">${iss.type}</div>
        <div class="issue-desc">${iss.desc}</div>
        <div class="issue-fix">${iss.fix}</div>
      </div>
    `).join('');
  },

  // ---- 6. Vocabulary Analysis ----
  analyzeVocabulary(userAnswer, keywords) {
    if (!keywords || !keywords.length) return [];
    const userLower = userAnswer.toLowerCase();
    return keywords.map(kw => {
      const kwWords = kw.word.toLowerCase().split(/\s+/);
      // Check exact match
      const exactUsed = kwWords.every(w => {
        const userWords = userLower.replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
        return userWords.includes(w);
      });
      // Check synonym match
      const synonymUsed = !exactUsed && kw.synonyms.some(s => {
        const synWords = s.toLowerCase().split(/\s+/);
        const userWords = userLower.replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
        return synWords.every(w => userWords.includes(w));
      });
      return {
        word: kw.word,
        status: exactUsed ? '✅ Used' : (synonymUsed ? '🔄 Synonym' : '❌ Not used'),
        statusClass: exactUsed ? 'used' : (synonymUsed ? 'synonym' : 'missed'),
        synonyms: kw.synonyms,
        note: kw.note
      };
    });
  },

  renderFeedback(feedbackText) {
    return feedbackText.split('\n\n').map(p => `<p style="margin-bottom:10px;line-height:1.6">${p}</p>`).join('');
  },

  // ---- 7. Key Scoring Points ----
  // Chinese lookup for common keywords
  _cnMap: {
    // === A ===
    'abandon': '放弃', 'ability': '能力', 'able': '能够', 'absence': '缺席',
    'absorb': '吸收', 'abstract': '抽象的', 'abundant': '丰富的', 'abuse': '滥用',
    'academic': '学术的', 'accelerate': '加速', 'accept': '接受', 'access': '获取',
    'accompany': '陪伴', 'accomplish': '完成', 'accurate': '准确的', 'achieve': '实现',
    'acknowledge': '承认', 'acquire': '获得', 'adapt': '适应', 'adequate': '充足的',
    'adjust': '调整', 'administration': '管理', 'admire': '欣赏', 'admit': '承认',
    'adopt': '采纳', 'advance': '进步', 'advantage': '优势', 'advertise': '做广告',
    'advocate': '倡导', 'affect': '影响', 'afford': '负担得起', 'agriculture': '农业',
    'alleviate': '缓解', 'allocate': '分配', 'allow': '允许', 'alternative': '替代的',
    'amaze': '使惊奇', 'ambition': '雄心', 'analyze': '分析', 'ancestor': '祖先',
    'ancient': '古老的', 'announce': '宣布', 'annual': '每年的', 'anxiety': '焦虑',
    'apparent': '明显的', 'appeal': '呼吁', 'apply': '应用', 'appoint': '任命',
    'appreciate': '欣赏', 'approach': '方法', 'appropriate': '适当的', 'approve': '批准',
    'arise': '出现', 'arrange': '安排', 'artificial intelligence': '人工智能',
    'aspect': '方面', 'assemble': '集合', 'assess': '评估', 'assign': '分配',
    'assist': '协助', 'assume': '假设', 'atmosphere': '氛围', 'attach': '附上',
    'attempt': '尝试', 'attend': '参加', 'attitude': '态度', 'attract': '吸引',
    'authority': '权威', 'automatic': '自动的', 'autonomous': '自主的',
    'available': '可用的', 'average': '平均', 'avoid': '避免', 'aware': '意识到',
    'awesome': '极好的', 'awful': '糟糕的',
    // === B ===
    'background': '背景', 'backward': '落后的', 'balanced diet': '均衡饮食',
    'bargain': '讨价还价', 'barrier': '障碍', 'behalf': '代表', 'behave': '表现',
    'belief': '信念', 'belong': '属于', 'beneficial': '有益的', 'benefit': '好处',
    'besides': '此外', 'betray': '背叛', 'biodiversity': '生物多样性',
    'blame': '责备', 'boost': '促进', 'boundary': '边界', 'brainstorm': '头脑风暴',
    'brand': '品牌', 'breed': '繁殖', 'brief': '简短的', 'brighten': '照亮',
    'broaden': '开阔', 'budget': '预算', 'burden': '负担',
    // === C ===
    'calculate': '计算', 'campaign': '运动', 'capable': '有能力的',
    'capacity': '能力', 'capture': '捕捉', 'carbon footprint': '碳足迹',
    'career': '职业', 'carry out': '执行', 'category': '类别', 'cause': '导致',
    'cease': '停止', 'celebrate': '庆祝', 'challenge': '挑战', 'characteristic': '特征',
    'charity': '慈善', 'circumstance': '环境', 'citizen': '公民', 'civilization': '文明',
    'claim': '声称', 'clarify': '澄清', 'classic': '经典的', 'climate': '气候',
    'coincidence': '巧合', 'collaborate': '合作', 'collapse': '崩溃',
    'combination': '结合', 'commit': '承诺', 'communicate': '沟通',
    'communication skills': '沟通能力', 'community': '社区', 'companion': '伴侣',
    'compare': '比较', 'compel': '强迫', 'compensate': '补偿', 'compete': '竞争',
    'competitive advantage': '竞争优势', 'complain': '抱怨', 'complete': '完成',
    'complicated': '复杂的', 'component': '组成部分', 'compose': '组成',
    'comprehensive': '全面的', 'compulsory': '强制性的', 'concentrate': '集中',
    'concept': '理念', 'concern': '关注', 'conclude': '总结', 'concrete': '具体的',
    'condition': '条件', 'conduct': '进行', 'confidence': '信心', 'confirm': '确认',
    'conflict': '冲突', 'confuse': '困惑', 'congestion': '拥堵',
    'connection': '联系', 'consciousness': '意识', 'consequence': '后果',
    'conservation': '保护', 'consider': '考虑', 'consistent': '一致的',
    'constant': '持续的', 'constitute': '构成', 'construct': '建造',
    'consume': '消费', 'consumerism': '消费主义', 'contact': '接触',
    'contain': '包含', 'contemporary': '当代的', 'contribute': '贡献',
    'controversial': '有争议的', 'convenient': '方便的', 'convention': '惯例',
    'convince': '说服', 'cooperate': '合作', 'cope with': '应对',
    'core driving force': '核心动力', 'corporate': '企业的',
    'cost of living': '生活成本', 'counsel': '建议', 'count on': '依靠',
    'create': '创造', 'creative': '有创意的', 'credit': '信用', 'crisis': '危机',
    'criteria': '标准', 'critical thinking': '批判性思维', 'criticism': '批评',
    'crucial': '至关重要', 'cultivate': '培养', 'cultivated': '培养的',
    'curiosity': '好奇心', 'current': '当前的', 'custom': '习俗',
    // === D ===
    'damage': '损害', 'deal with': '处理', 'debate': '辩论', 'debt': '债务',
    'decade': '十年', 'decline': '下降', 'decorate': '装饰', 'decrease': '减少',
    'dedicate': '致力于', 'defeat': '击败', 'defend': '辩护', 'define': '定义',
    'definitely': '肯定', 'definition': '定义', 'deliberate': '故意的',
    'delicate': '精致的', 'deliver': '传递', 'demand': '需求', 'democracy': '民主',
    'demonstrate': '展示', 'departure': '出发', 'depend': '依赖', 'depict': '描绘',
    'depression': '抑郁', 'derive': '源于', 'desalination': '海水淡化',
    'describe': '描述', 'deserve': '值得', 'desire': '渴望', 'desperate': '绝望的',
    'despite': '尽管', 'destination': '目的地', 'destroy': '破坏', 'detect': '检测',
    'determine': '决定', 'develop': '发展', 'device': '设备', 'devote': '奉献',
    'dignity': '尊严', 'dilemma': '困境', 'dimension': '维度',
    'disability': '残疾', 'disadvantage': '劣势', 'disagree': '不同意',
    'disappear': '消失', 'disappointed': '失望', 'disaster relief': '灾难救援',
    'discipline': '纪律', 'disclose': '披露', 'discourage': '阻止',
    'discrimination': '歧视', 'discuss': '讨论', 'dismiss': '解雇',
    'display': '展示', 'dispute': '争议', 'distinct': '独特的',
    'distinguish': '区分', 'distribute': '分配', 'disturb': '打扰',
    'diverse': '多样的', 'document': '文件', 'domestic': '国内的',
    'dominate': '主导', 'donate': '捐赠', 'dramatically': '极大地',
    'drawback': '缺点', 'drive': '驱动', 'dropout': '辍学',
    // === E ===
    'e-commerce': '电子商务', 'ecological balance': '生态平衡',
    'economic development': '经济发展', 'economy': '经济', 'educate': '教育',
    'effective': '有效的', 'efficiency': '效率', 'efficient': '高效的',
    'effort': '努力', 'elderly': '老年人', 'elect': '选举', 'eliminate': '消除',
    'embrace': '拥抱', 'embraced': '接受', 'emerge': '出现', 'emergency': '紧急',
    'emission': '排放', 'emotion': '情感', 'emphasize': '强调', 'employ': '雇佣',
    'enable': '使能够', 'encounter': '遇到', 'encourage': '鼓励', 'endanger': '危及',
    'endeavor': '努力', 'energy': '能量', 'enforce': '执行', 'engage': '参与',
    'enhance': '增进', 'enjoy': '享受', 'enormous': '巨大的', 'enrich': '丰富',
    'ensure': '确保', 'enterprise': '企业', 'enthusiasm': '热情',
    'entire': '整个的', 'environmental pollution': '环境污染',
    'environmental protection': '环境保护', 'equal': '平等的',
    'equipment': '设备', 'equivalent': '等同的', 'error': '错误',
    'essential': '必要的', 'establish': '建立', 'estimate': '估计',
    'ethical': '道德的', 'evaluate': '评价', 'evidence': '证据',
    'evolution': '进化', 'exact': '精确的', 'examine': '检查', 'exceed': '超过',
    'excellent': '优秀的', 'exception': '例外', 'excessive': '过度的',
    'exchange': '交流', 'exclude': '排除', 'execute': '执行', 'exercise': '锻炼',
    'exhaust': '耗尽', 'exhibit': '展示', 'expand': '扩展', 'expect': '期待',
    'expense': '费用', 'experiment': '实验', 'expert': '专家',
    'explain': '解释', 'explicit': '明确的', 'exploit': '开发',
    'explore': '探索', 'expose to': '体验', 'exposure': '接触',
    'express delivery': '快递', 'extend': '延伸', 'extensive': '广泛的',
    'external': '外部的', 'extraordinary': '非凡的', 'extreme': '极端的',
    // === F ===
    'facilitate': '促进', 'factor': '因素', 'failure': '失败', 'fair': '公平的',
    'faith': '信仰', 'fascinating': '迷人的', 'fashion': '时尚', 'fatal': '致命的',
    'feasible': '可行的', 'feature': '特征', 'fierce': '激烈的', 'figure out': '弄清楚',
    'finance': '金融', 'flexible': '灵活的', 'flourish': '繁荣',
    'focus': '集中', 'forcing': '强迫', 'forecast': '预测', 'foresee': '预见',
    'formal': '正式的', 'former': '前者', 'formula': '公式', 'foster': '培养',
    'foundation': '基础', 'fragile': '脆弱的', 'framework': '框架',
    'frequent': '频繁的', 'fulfill': '实现', 'function': '功能', 'fund': '资金',
    'fundamental': '基本的', 'furthermore': '此外',
    // === G ===
    'gap': '差距', 'gender equality': '性别平等', 'generate': '产生',
    'generation': '一代人', 'generous': '慷慨的', 'genetic': '基因的',
    'genius': '天才', 'genuine': '真正的', 'global': '全球的',
    'global cooperation': '全球合作', 'globalization': '全球化',
    'goal': '目标', 'govern': '治理', 'government': '政府', 'grab': '抓住',
    'gradually': '逐渐地', 'grant': '授予', 'grasp': '掌握', 'grateful': '感激的',
    'greenhouse': '温室', 'gross': '总的', 'guarantee': '保证', 'guideline': '指南',
    'guilty': '内疚的',
    // === H ===
    'habit': '习惯', 'harmonious': '和谐的', 'harsh': '严酷的', 'harvest': '收获',
    'hazard': '危险', 'hesitate': '犹豫', 'highlight': '强调', 'hinder': '阻碍',
    'hobby': '爱好', 'honest': '诚实的', 'honor': '荣誉', 'horizons': '视野',
    'horrible': '可怕的', 'host': '主办', 'huge': '巨大的', 'humanity': '人性',
    'humor': '幽默', 'hunt': '寻找', 'hustle': '忙碌',
    // === I ===
    'ideal': '理想的', 'identify': '识别', 'identity': '身份', 'ignore': '忽视',
    'illegal': '非法的', 'illustrate': '说明', 'imagination': '想象力',
    'immediate': '立即的', 'immense': '巨大的', 'immigrant': '移民',
    'impact': '影响', 'imparts': '传授', 'implement': '实施',
    'implication': '含义', 'imply': '暗示', 'importance': '重要性',
    'impose': '强加', 'impress': '留下印象', 'improve': '提高',
    'incentive': '激励', 'incident': '事件', 'include': '包括',
    'income': '收入', 'incorporate': '纳入', 'increasingly': '越来越',
    'incredible': '难以置信的', 'independent': '独立的', 'indicate': '表明',
    'indispensable': '不可或缺', 'individual': '个人', 'industrial': '工业的',
    'inevitable': '不可避免的', 'influence': '影响', 'inform': '通知',
    'infrastructure': '基础设施', 'ingredient': '成分', 'inhabit': '居住',
    'inherent': '固有的', 'initial': '最初的', 'initiate': '发起',
    'injected': '注入', 'innovation': '创新', 'innovative': '创新的',
    'inspiring': '鼓舞人心的', 'install': '安装', 'instant': '立即',
    'institute': '机构', 'institution': '制度', 'instrument': '工具',
    'insufficient': '不足的', 'integrate': '整合', 'intellectual': '智力的',
    'intelligence': '智力', 'intend': '打算', 'intense': '强烈的',
    'intention': '意图', 'interact': '互动', 'interests and hobbies': '兴趣爱好',
    'interfere': '干涉', 'internal': '内部的', 'interpret': '解释',
    'interrupt': '打断', 'intervene': '干预', 'intimate': '亲密的',
    'introduce': '介绍', 'invade': '入侵', 'invent': '发明',
    'invest': '投资', 'investment': '投入', 'investigate': '调查',
    'involve': '涉及', 'irreplaceable': '不可替代', 'irrigation': '灌溉',
    'isolate': '孤立', 'issue': '问题',
    // === J-K ===
    'joint': '联合的', 'journal': '期刊', 'judge': '判断',
    'justify': '证明合理', 'keen': '热衷的', 'key factors': '关键因素',
    'kindness': '善良', 'knowledge': '知识',
    // === L ===
    'label': '标签', 'labor': '劳动', 'launch': '发起', 'law': '法律',
    'lay off': '解雇', 'lead to': '导致', 'leadership': '领导力',
    'leading': '领先的', 'leap': '飞跃', 'learn from': '吸取教训',
    'legacy': '遗产', 'legal': '合法的', 'leisure': '休闲', 'lifelong learning': '终身学习',
    'lifestyle': '生活方式', 'likely': '可能的', 'limit': '限制',
    'literacy': '素养', 'literally': '字面上', 'literature': '文学',
    'living standard': '生活水平', 'load': '负荷', 'loan': '贷款',
    'local': '当地的', 'locate': '位于', 'logical': '逻辑的', 'long-term': '长期的',
    'loyal': '忠诚的', 'luxury': '奢侈的',
    // === M ===
    'magnificent': '壮丽的', 'maintain': '维持', 'major': '主要的',
    'majority': '大多数', 'manage': '管理', 'manifest': '表明',
    'manipulate': '操纵', 'manner': '方式', 'manufacture': '制造',
    'margin': '边缘', 'massive': '大规模的', 'master': '掌握',
    'material': '材料', 'mature': '成熟的', 'maximum': '最大值',
    'meaningful': '有意义的', 'measures': '措施', 'mechanism': '机制',
    'media': '媒体', 'medical': '医学的', 'mental health': '心理健康',
    'mention': '提及', 'merely': '仅仅', 'method': '方法',
    'migration': '迁移', 'mild': '温和的', 'minimize': '最小化',
    'minimum': '最小值', 'minor': '较小的', 'minority': '少数',
    'miracle': '奇迹', 'misunderstandings': '误解', 'mobile': '移动的',
    'moderate': '适度的', 'modern people': '现代人', 'modify': '修改',
    'monitor': '监控', 'moral': '道德的', 'moreover': '此外',
    'motivate': '激励', 'multiple': '多个的', 'mutual understanding': '相互理解',
    'mystery': '神秘',
    // === N ===
    'narrow the gap': '缩小差距', 'national': '国家的',
    'necessity': '必要性', 'negative': '消极的', 'neglect': '忽略',
    'negotiate': '谈判', 'nervous': '紧张的', 'network': '网络',
    'neutral': '中立的', 'nevertheless': '然而', 'noble': '高尚的',
    'normal': '正常的', 'notable': '值得注意的', 'notice': '注意',
    'notion': '概念', 'novel': '新颖的', 'nowadays': '如今',
    'numerous': '众多的', 'nurture': '培养', 'nutrition': '营养',
    // === O ===
    'obey': '遵守', 'objective': '客观的', 'obligation': '义务',
    'observe': '观察', 'obstacle': '障碍', 'obtain': '获得',
    'obvious': '明显的', 'occasion': '场合', 'occupy': '占据',
    'offend': '冒犯', 'offer': '提供', 'office': '办公室',
    'online education': '在线教育', 'operate': '操作', 'opinion': '观点',
    'opportunity': '机会', 'oppose': '反对', 'optimistic': '乐观的',
    'option': '选项', 'organize': '组织', 'original': '原始的',
    'outcome': '结果', 'outstanding': '卓越的',
    'overcome': '克服', 'overlook': '忽视', 'overseas': '海外的',
    'overwhelming': '压倒性的',
    // === P ===
    'participate': '参与', 'particular': '特定的', 'partly': '部分地',
    'partner': '伙伴', 'passion': '热情', 'passive': '被动的',
    'patience': '耐心', 'pay attention': '注意', 'peak': '高峰',
    'penetrated': '深入', 'perceive': '感知', 'perform': '执行',
    'period': '时期', 'permanent': '永久的', 'permit': '允许',
    'persevere': '坚持', 'persist': '坚持', 'persisting in': '坚持',
    'personal growth': '个人成长', 'personality': '个性',
    'perspective': '视角', 'persuade': '说服', 'phenomenon': '现象',
    'philosophy': '哲学', 'physical': '身体的', 'plays a role': '发挥作用',
    'pleasure': '快乐', 'plentiful': '丰富的', 'policy': '政策',
    'polish': '打磨', 'pollution': '污染', 'pool': '汇集',
    'popularization': '普及', 'population': '人口', 'portion': '部分',
    'portrait': '描绘', 'pose': '造成', 'position': '位置',
    'positive': '积极的', 'possess': '拥有', 'potential': '潜力',
    'poverty': '贫穷', 'practical': '实际的', 'precious': '珍贵的',
    'precise': '精确的', 'predict': '预测', 'prefer': '偏好',
    'prejudice': '偏见', 'premium': '优质的', 'prepare': '准备',
    'prescription': '处方', 'preserve': '保存', 'pressure': '压力',
    'presumably': '大概', 'prevail': '盛行', 'prevalent': '普及',
    'prevent': '防止', 'previous': '之前的', 'pride': '骄傲',
    'primary': '主要的', 'principle': '原则', 'priority': '优先',
    'privilege': '特权', 'probe': '探索', 'procedure': '程序',
    'proceed': '进行', 'process': '过程', 'produce': '生产',
    'professional knowledge': '专业知识', 'profit': '利润',
    'profound': '深远的', 'progress': '进步', 'prohibit': '禁止',
    'project': '项目', 'prominent': '突出的', 'promise': '承诺',
    'promote': '促进', 'prompt': '促使', 'proper': '适当的',
    'property': '财产', 'proportion': '比例', 'proposal': '提案',
    'prospect': '前景', 'prosperity': '繁荣', 'protect': '保护',
    'protest': '抗议', 'prove': '证明', 'provide': '提供',
    'provoke': '引发', 'psychology': '心理学', 'public': '公共的',
    'publish': '出版', 'purchase': '购买', 'purpose': '目的',
    'pursue': '追求', 'put forward': '提出',
    // === Q-R ===
    'qualification': '资格', 'quality': '质量', 'quantity': '数量',
    'quote': '引用', 'radical': '激进的', 'raise': '提高', 'random': '随机的',
    'range': '范围', 'rapid': '快速的', 'rare': '罕见的', 'rate': '比率',
    'rational': '理性的', 'raw': '原始的', 'react': '反应', 'realistic': '现实的',
    'realize': '意识到', 'reasonable': '合理的', 'rebuild': '重建',
    'receive': '接收', 'recent': '最近的', 'recognition': '认可',
    'recognize': '认出', 'recommend': '推荐', 'recover': '恢复',
    'recreation': '娱乐', 'recruit': '招募', 'reduce': '减少',
    'reflect': '反映', 'reform': '改革', 'refuse': '拒绝', 'regard': '认为',
    'regardless': '不管', 'region': '地区', 'register': '注册',
    'regulate': '监管', 'reinforce': '加强', 'reject': '拒绝',
    'relate': '关联', 'relationship': '关系', 'relax': '放松',
    'release': '发布', 'relevant': '相关的', 'reliable': '可靠的',
    'relieve': '缓解', 'religious': '宗教的', 'reluctant': '不情愿的',
    'rely': '依赖', 'remain': '保持', 'remarkable': '显著的',
    'remedy': '补救', 'remote': '偏远', 'remove': '移除', 'render': '致使',
    'renewable': '可再生的', 'replace': '取代', 'represent': '代表',
    'reputation': '声誉', 'request': '请求', 'require': '要求',
    'research': '研究', 'reserve': '保留', 'reside': '居住',
    'resign': '辞职', 'resist': '抵抗', 'resolve': '解决',
    'resource': '资源', 'respect': '尊重', 'respond': '回应',
    'responsibility': '责任', 'restore': '恢复', 'restrict': '限制',
    'result': '结果', 'retain': '保留', 'retire': '退休', 'reveals': '揭示',
    'revenue': '收入', 'reverse': '逆转', 'review': '复习', 'revise': '修订',
    'revolution': '革命', 'reward': '奖励', 'risk': '风险', 'rival': '对手',
    'robust': '稳健的', 'role': '角色', 'routine': '常规', 'ruin': '毁灭',
    'rural': '农村的',
    // === S ===
    'sacrifice': '牺牲', 'safety': '安全', 'salary': '薪水', 'sample': '样本',
    'satisfaction': '满意', 'satisfy': '满足', 'scale': '规模',
    'scarcity': '短缺', 'scenarios': '场景', 'schedule': '安排',
    'scheme': '方案', 'scholarship': '奖学金', 'security': '安全',
    'seek': '寻求', 'segment': '部分', 'select': '选择',
    'self-identity': '自我认同', 'senior': '年长的', 'sense': '感觉',
    'sensitive': '敏感的', 'separate': '分开', 'sequence': '顺序',
    'series': '系列', 'serious': '严重的', 'serve': '服务',
    'settlement': '定居', 'severe': '严峻的', 'shadow': '阴影',
    'shelter': '庇护', 'shift': '转变', 'shortage': '短缺',
    'shortcut': '捷径', 'significant': '重要的', 'silence': '沉默',
    'similar': '相似的', 'simplify': '简化', 'sincere': '真诚的',
    'situation': '情况', 'skilled': '熟练的', 'slavery': '奴隶制',
    'smart': '聪明的', 'smooth': '顺利的', 'social equity': '社会公平',
    'social progress': '社会进步', 'society': '社会',
    'software': '软件', 'solution': '解决方案', 'solve': '解决',
    'somehow': '以某种方式', 'sophisticated': '复杂的',
    'sorrow': '悲伤', 'source': '来源', 'spare': '空闲的',
    'spark': '引发', 'sparked': '引发', 'speak up': '大声说',
    'specialize': '专攻', 'species': '物种', 'specific': '具体的',
    'spectacular': '壮观的', 'spirit': '精神', 'spite': '恶意',
    'split': '分裂', 'sponsor': '赞助', 'spot': '地点',
    'spread': '传播', 'stable': '稳定的', 'stakeholder': '利益相关者',
    'standard': '标准', 'status': '地位', 'steady': '稳定的',
    'stimulate': '刺激', 'strategy': '策略', 'strength': '优势',
    'strengthen': '加强', 'stress': '压力', 'stretch': '延伸',
    'strict': '严格的', 'structure': '结构', 'struggle': '挣扎',
    'subsidy': '补贴', 'substance': '物质', 'substantial': '大量的',
    'substitute': '替代', 'succeed': '成功', 'sufficient': '充足的',
    'suggest': '建议', 'suitable': '合适的', 'summarize': '总结',
    'superior': '优越的', 'supervision': '监管', 'supply': '供应',
    'support': '支持', 'suppose': '假设', 'suppress': '压制',
    'surgery': '手术', 'surplus': '过剩', 'surround': '围绕',
    'survey': '调查', 'survive': '生存', 'suspect': '怀疑',
    'suspend': '暂停', 'sustain': '维持', 'sustainable': '可持续的',
    'symbolizing': '象征', 'sympathy': '同情', 'symptom': '症状',
    'system': '系统',
    // === T ===
    'tackle': '应对', 'talent': '人才', 'target': '目标', 'task': '任务',
    'technique': '技巧', 'technology': '技术', 'temporary': '临时的',
    'tend': '倾向', 'tendency': '趋势', 'tension': '紧张',
    'terminal': '终端', 'territory': '领土', 'terror': '恐怖',
    'therefore': '因此', 'thorough': '彻底的', 'threaten': '威胁',
    'threshold': '门槛', 'thrill': '兴奋', 'thrive': '蓬勃发展',
    'time management': '时间管理', 'tolerance': '宽容', 'topic': '话题',
    'total': '总计', 'tough': '艰难的', 'track': '追踪',
    'tradition': '传统', 'traditional culture': '传统文化',
    'tragedy': '悲剧', 'transfer': '转移', 'transform': '转变',
    'transit': '运输', 'transparent': '透明的', 'transport': '运输',
    'travel by bicycle': '骑自行车', 'tremendous': '巨大的',
    'trend': '趋势', 'trial': '试验', 'trigger': '触发',
    'triumph': '胜利', 'trust': '信任', 'tutor': '辅导',
    'typical': '典型的',
    // === U ===
    'ultimate': '最终的', 'unanimous': '一致的', 'unaware': '未意识到',
    'uncertain': '不确定的', 'unconscious': '无意识的', 'undergo': '经历',
    'undermine': '破坏', 'understand': '理解', 'undertake': '承担',
    'unemployment': '失业', 'unexpected': '意外的', 'unfair': '不公平的',
    'unfold': '展开', 'unfortunate': '不幸的', 'uniform': '统一的',
    'unique': '独特的', 'universal': '普遍的', 'urbanization': '城市化',
    'urgent': '亟待解决', 'utilize': '利用',
    // === V ===
    'vacant': '空缺的', 'vague': '模糊的', 'valid': '有效的',
    'valuable': '有价值的', 'valuable quality': '宝贵品质', 'value': '价值',
    'variety': '多样性', 'various': '各种各样的', 'vast': '广阔的',
    'venture': '冒险', 'verify': '验证', 'version': '版本',
    'victim': '受害者', 'view': '观点', 'violate': '违反',
    'violence': '暴力', 'virtue': '美德', 'visible': '可见的',
    'vision': '愿景', 'vital': '至关重要的', 'vitality': '活力',
    'vivid': '生动的', 'voluntary': '自愿的', 'vulnerable': '脆弱的',
    // === W-Z ===
    'welfare': '福利', 'widespread': '广泛的', 'wisdom': '智慧',
    'with': '随着', 'withdraw': '撤回', 'witness': '见证',
    'workforce': '劳动力', 'workplace': '工作场所', 'world-famous': '闻名于世',
    'world-renowned': '闻名世界的', 'worsen': '恶化', 'worthwhile': '值得的',
    'yield': '产生', 'youth': '青年', 'is becoming': '变得越来越',
    'led to': '导致', 'painstaking': '艰辛的', 'expose to': '体验',
  },

  _detectPOS(word) {
    const lower = word.toLowerCase().trim();
    // Multi-word → phrase
    if (/\s/.test(lower)) return 'phrase';
    // Known POS by suffix
    if (lower.endsWith('ly')) return 'adv.';
    if (lower.endsWith('tion') || lower.endsWith('sion') || lower.endsWith('ment') || lower.endsWith('ness') || lower.endsWith('ity') || lower.endsWith('ism')) return 'n.';
    if (lower.endsWith('ous') || lower.endsWith('ive') || lower.endsWith('ful') || lower.endsWith('less') || lower.endsWith('able') || lower.endsWith('al') || lower.endsWith('ic')) return 'adj.';
    if (lower.endsWith('ing') || lower.endsWith('ed') || lower.endsWith('en')) return 'v.';
    // Known nouns
    const nouns = ['development','environment','pollution','internet','people','lifestyle','student','skill','knowledge','government','measure','carbon','emission','discussion','market','culture','society','role','literature','work','life','experience','success','effort','urbanization','problem','habit','growth','research','field','engineering','diet','routine','health','factor','volunteer','disaster','relief','awareness','policy','gap','equity','workplace','communication','documentary','consumerism','impact','concept','learning','media','identity','influence','misunderstanding','horizon','teamwork','solution','investment','quality','honesty','tourism','vitality','equality','attitude','challenge','biodiversity','balance','failure','footprint','education','management','efficiency','innovation','force','progress','living','protection','cooperation','popularization','urbanization','全球化','prevalence','proliferation','emergence','conservation','preservation','desalination','supervision','reuse','scarcity','congestion','gridlock'];
    if (nouns.includes(lower)) return 'n.';
    const verbs = ['spark','trigger','ignite','prompt','enhance','foster','nurture','cultivate','persist','insist','relieve','alleviate','ease','broaden','enrich','pool','combine','consolidate','inject','infuse','reveal','expose','embrace','adopt','narrow','bridge','cope','deal','handle','tackle','impart','transmit','convey','symbolize','signify','embody','penetrate','permeate'];
    if (verbs.includes(lower)) return 'v.';
    return '';
  },

  _speakEnglish(text) {
    // Returns HTML for audio button
    const escaped = this._escapeHtml(text);
    return `<button class="audio-btn" onclick="Analyzer._playAudio('${escaped.replace(/'/g, "\\'")}')" title="Listen to pronunciation">🔊</button>`;
  },

  _playAudio(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  },

  extractKeyPoints(source, reference, keywords) {
    const words = [];
    const phrases = [];

    if (keywords) {
      keywords.forEach(kw => {
        const kwLower = kw.word.toLowerCase();
        const cn = this._cnMap[kwLower] || '';
        const pos = this._detectPOS(kw.word);
        const isPhrase = /\s/.test(kw.word.trim());
        const item = {
          chinese: cn, english: kw.word, pos: pos,
          synonyms: kw.synonyms, note: kw.note,
          weight: 'high', type: isPhrase ? 'phrase' : 'word'
        };
        if (isPhrase) phrases.push(item);
        else words.push(item);
      });
    }

    return { words, phrases };
  },

  checkKeyPoints(userAnswer, keyPoints, keywords) {
    const userLower = userAnswer.toLowerCase();
    const synonymMap = this._buildSynonymMap(keywords);
    const userWords = userLower.replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
    const userSet = new Set(userWords);

    const check = (kp) => {
      const kpWords = kp.english.toLowerCase().split(/\s+/);
      const exact = kpWords.every(w => userSet.has(w));
      const synMatch = !exact && kp.synonyms.some(s => s.toLowerCase().split(/\s+/).every(w => userSet.has(w)));
      const partial = !exact && !synMatch && kpWords.filter(w => userSet.has(w) || this._hasSynonymInSet(w, userSet, synonymMap)).length >= Math.ceil(kpWords.length / 2);

      let status, statusClass;
      if (exact) { status = '✅'; statusClass = 'kp-hit'; }
      else if (synMatch) { status = '🔄'; statusClass = 'kp-synonym'; }
      else if (partial) { status = '⚠️'; statusClass = 'kp-partial'; }
      else { status = '❌'; statusClass = 'kp-miss'; }

      let suggestion = '';
      if (!exact && !synMatch) {
        const synHint = kp.synonyms.length ? ` (可用: ${kp.synonyms.slice(0, 2).join(', ')})` : '';
        suggestion = `建议: "${kp.english}"${synHint}`;
      }
      return { ...kp, status, statusClass, suggestion };
    };

    return {
      words: (keyPoints.words || []).map(check),
      phrases: (keyPoints.phrases || []).map(check)
    };
  },

  renderKeyPoints(checked, userAnswer) {
    const renderGroup = (items, label) => {
      if (!items || !items.length) return '';
      const rows = items.map(kp => {
        const cnDisplay = kp.chinese ? `<span class="kp-cn">${this._escapeHtml(kp.chinese)}</span>` : '';
        const posDisplay = kp.pos ? `<span class="kp-pos">${this._escapeHtml(kp.pos)}</span>` : '';
        const audioBtn = this._speakEnglish(kp.english);
        const synDisplay = kp.synonyms && kp.synonyms.length
          ? `<span class="kp-syns">${kp.synonyms.map(s => `<span class="kp-syn-tag">${this._escapeHtml(s)}</span>`).join(' ')}</span>`
          : '';
        const saveBtn = kp._saveBtn || '';
        return `<div class="kp-item ${kp.statusClass}">
          <span class="kp-status">${kp.status}</span>${audioBtn}
          <span class="kp-english">${this._escapeHtml(kp.english)}</span>
          ${posDisplay}${cnDisplay}
          ${kp.suggestion ? `<span class="kp-suggestion">${this._escapeHtml(kp.suggestion)}</span>` : ''}
          ${synDisplay}
          ${saveBtn}
        </div>`;
      }).join('');
      return `<div style="margin-bottom:10px"><strong style="font-size:0.85rem;color:#888">${label}</strong></div>${rows}`;
    };

    return renderGroup(checked.words, '📝 单词') + renderGroup(checked.phrases, '🔗 短语');
  },

  // ---- 8. Utility ----
  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
