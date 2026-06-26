// ===== 专题练习页面逻辑 =====
let currentTopicId = null;
let currentTopicQuestion = null;
let currentTopicIndex = -1;
let currentTopicQuestions = [];
let timedMode = null; // { total, remaining, timer }
let timedAnswers = [];
let timedCount = 0;

function renderTopicGrid() {
  const el = document.getElementById('topicGrid');
  if (!el) return;
  const topics = getAllTopics();
  el.innerHTML = topics.map(t => `
    <div class="topic-card" onclick="startTopic('${t.id}')">
      <div class="topic-icon">${t.icon}</div>
      <div class="topic-name">${t.name}</div>
      <div class="topic-desc">${t.desc}</div>
      <div class="topic-count">${t.questions.length} 题</div>
    </div>
  `).join('');
  document.getElementById('topicView').innerHTML = '';
  document.getElementById('topicView').hidden = true;
  document.getElementById('topicAnalysis').innerHTML = '';
}

function startTopic(topicId) {
  const topic = getAllTopics().find(t => t.id === topicId);
  if (!topic) return;
  currentTopicId = topicId;
  const grid = document.getElementById('topicGrid');
  grid.innerHTML = `
    <div class="topic-mode-select">
      <div class="tm-header">${topic.icon} ${topic.name}</div>
      <p style="color:#b8a8c8;font-size:0.85rem;margin-bottom:20px">共 ${topic.questions.length} 题，选择练习模式</p>
      <div class="tm-cards">
        <div class="tm-card" onclick="startNormalPractice('${topicId}')">
          <div class="tm-icon">📖</div>
          <div class="tm-title">普通练习</div>
          <div class="tm-desc">不限时间，逐题作答，每道题都有详细分析</div>
        </div>
        <div class="tm-card tm-card-timed" onclick="showTimedOptions('${topicId}')">
          <div class="tm-icon">⏱</div>
          <div class="tm-title">限时挑战</div>
          <div class="tm-desc">模拟考试环境，限时完成，检验真实水平</div>
        </div>
      </div>
      <button class="btn btn-ghost" onclick="renderTopicGrid()" style="margin-top:16px">← 返回专题列表</button>
    </div>
  `;
}

function showTimedOptions(topicId) {
  const topic = getAllTopics().find(t => t.id === topicId);
  if (!topic) return;
  const total = topic.questions.length;
  document.getElementById('topicGrid').innerHTML = `
    <div class="topic-mode-select">
      <div class="tm-header">⏱ 限时挑战 · ${topic.name}</div>
      <p style="color:#b8a8c8;font-size:0.85rem;margin-bottom:20px">选择题数，开始计时挑战</p>
      <div class="tm-cards">
        <div class="tm-card tm-card-timed" onclick="startTimedPractice('${topicId}',5,300)">
          <div class="tm-icon">⚡</div>
          <div class="tm-title">快速挑战</div>
          <div class="tm-desc">5 题 · 5 分钟</div>
        </div>
        <div class="tm-card tm-card-timed" onclick="startTimedPractice('${topicId}',10,600)">
          <div class="tm-icon">🔥</div>
          <div class="tm-title">标准挑战</div>
          <div class="tm-desc">10 题 · 10 分钟</div>
        </div>
        <div class="tm-card tm-card-timed" onclick="startTimedPractice('${topicId}',${total},${total * 60})">
          <div class="tm-icon">💪</div>
          <div class="tm-title">完整挑战</div>
          <div class="tm-desc">${total} 题 · ${total} 分钟</div>
        </div>
      </div>
      <button class="btn btn-ghost" onclick="startTopic('${topicId}')" style="margin-top:16px">← 返回</button>
    </div>
  `;
}

function startNormalPractice(topicId) {
  currentTopicId = topicId;
  currentTopicIndex = -1;
  timedMode = null;
  const topic = getAllTopics().find(t => t.id === topicId);
  if (!topic) return;
  const qs = [...topic.questions];
  for (let i = qs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [qs[i], qs[j]] = [qs[j], qs[i]];
  }
  currentTopicQuestions = qs;
  nextTopicQuestion();
}

function startTimedPractice(topicId, count, seconds) {
  currentTopicId = topicId;
  currentTopicIndex = -1;
  timedAnswers = [];
  timedCount = count;
  const topic = getAllTopics().find(t => t.id === topicId);
  if (!topic) return;
  const qs = [...topic.questions];
  for (let i = qs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [qs[i], qs[j]] = [qs[j], qs[i]];
  }
  currentTopicQuestions = qs.slice(0, count);
  timedMode = { total: seconds, remaining: seconds, timer: null };
  startTimer();
  nextTopicQuestion();
}

function startTimer() {
  if (!timedMode) return;
  timedMode.timer = setInterval(function() {
    timedMode.remaining--;
    updateTimerDisplay();
    if (timedMode.remaining <= 0) {
      clearInterval(timedMode.timer);
      timedMode.timer = null;
      submitTimedResults();
    }
  }, 1000);
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const el = document.getElementById('topicTimer');
  if (!el) return;
  if (!timedMode) { el.innerHTML = ''; return; }
  const m = Math.floor(timedMode.remaining / 60);
  const s = timedMode.remaining % 60;
  const pct = timedMode.remaining / timedMode.total;
  const color = pct > 0.3 ? '#6366f1' : (pct > 0.1 ? '#e67e22' : '#e74c3c');
  el.innerHTML = '<span style="font-size:0.82rem;font-weight:700;color:' + color + '">⏱ ' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0') + '</span>';
}

function stopTimer() {
  if (timedMode && timedMode.timer) {
    clearInterval(timedMode.timer);
    timedMode.timer = null;
  }
}

function nextTopicQuestion() {
  currentTopicIndex++;
  renderTopicQuestion();
}

function renderTopicQuestion() {
  const grid = document.getElementById('topicGrid');
  const view = document.getElementById('topicView');
  const analysis = document.getElementById('topicAnalysis');
  grid.innerHTML = '';

  if (!currentTopicQuestions || currentTopicIndex >= currentTopicQuestions.length) {
    view.hidden = false;
    analysis.innerHTML = '';
    if (timedMode) {
      stopTimer();
      view.innerHTML = '<div class="topic-done"><h3>🎉 全部完成！</h3><p>你已完成本轮所有题目。</p><button class="btn btn-primary" onclick="renderTopicGrid()">← 返回专题列表</button></div>';
    } else {
      view.innerHTML = '<div class="topic-done"><h3>🎉 全部完成！</h3><p>该专题的所有题目已做完。</p><button class="btn btn-primary" onclick="renderTopicGrid()">← 返回专题列表</button></div>';
    }
    return;
  }

  currentTopicQuestion = currentTopicQuestions[currentTopicIndex];
  const total = currentTopicQuestions.length;
  const pos = currentTopicIndex + 1;
  const topic = getAllTopics().find(t => t.id === currentTopicId);
  const timed = timedMode ? '<span id="topicTimer" style="margin-left:auto"></span>' : '';

  view.hidden = false;
  view.innerHTML = '<div style="margin-bottom:12px;display:flex;align-items:center;gap:8px">' +
    '<span style="font-size:0.85rem;color:#888">' + topic.icon + ' ' + topic.name + ' · ' + pos + '/' + total + '</span>' +
    timed +
    '<button class="btn btn-ghost" onclick="endTimedEarly()" style="font-size:0.78rem;margin-left:auto">退出</button></div>' +
    '<div class="main-card" style="margin-bottom:0">' +
    (timedMode ? '<div style="margin-bottom:12px;height:4px;background:#eef0f5;border-radius:2px;overflow:hidden"><div id="timerBar" style="height:100%;width:100%;background:linear-gradient(90deg,#f0abfc,#6366f1);border-radius:2px;transition:width 1s linear"></div></div>' : '') +
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">' +
    '<span style="background:linear-gradient(135deg,#f0abfc,#c084fc);border-radius:8px;padding:2px 10px;font-size:0.72rem;color:#fff;font-weight:700">' + (currentTopicQuestion.diff || 'CET') + '</span>' +
    (timedMode ? '<span style="font-size:0.75rem;color:#e67e22;font-weight:600">⏱ 限时中</span>' : '') +
    '</div>' +
    '<div class="question-section">' +
    '<h2>📝 翻译句子：</h2>' +
    '<div class="source-sentence" style="background:#f5f0ff;border-left-color:#c084fc">' + currentTopicQuestion.source + '</div></div>' +
    '<div class="input-section">' +
    '<label for="topicInput">✏️ 你的翻译：</label>' +
    '<textarea id="topicInput" rows="3" placeholder="Type your English translation here..." autofocus></textarea></div>' +
    '<div class="action-bar">' +
    '<button class="btn btn-primary" onclick="submitTopicAnswer()">Submit</button>' +
    '<button class="btn btn-outline" onclick="showTopicAnswer()">Show Answer</button>' +
    '<button class="btn btn-ghost" onclick="' + (timedMode ? 'nextTimedQuestion()' : 'nextTopicQuestion()') + '">' + (timedMode ? '下一题 →' : '跳过 →') + '</button></div></div>' +
    '<div id="topicAnalysis"></div>';

  if (timedMode) updateTimerDisplay();

  setTimeout(function() {
    const inp = document.getElementById('topicInput');
    if (inp) { inp.focus(); inp.addEventListener('keydown', function(e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitTopicAnswer(); }); }
  }, 50);
}

function submitTopicAnswer() {
  const inp = document.getElementById('topicInput');
  if (!inp) return;
  const answer = inp.value.trim();
  if (!answer) return;
  if (timedMode) {
    timedAnswers.push({ index: currentTopicIndex, question: currentTopicQuestion, answer: answer });
    nextTimedQuestion();
  } else {
    renderTopicAnalysis(answer);
  }
}

function showTopicAnswer() {
  if (!currentTopicQuestion) return;
  if (timedMode) {
    timedAnswers.push({ index: currentTopicIndex, question: currentTopicQuestion, answer: '(skipped)' });
    nextTimedQuestion();
  } else {
    renderTopicAnalysis('');
  }
}

function nextTimedQuestion() {
  currentTopicIndex++;
  if (currentTopicIndex >= currentTopicQuestions.length) {
    stopTimer();
    submitTimedResults();
  } else {
    renderTopicQuestion();
  }
}

function endTimedEarly() {
  if (!timedMode) { renderTopicGrid(); return; }
  if (confirm('确定结束限时挑战吗？未完成的题将不计分。')) {
    stopTimer();
    submitTimedResults();
  }
}

function submitTimedResults() {
  stopTimer();
  const view = document.getElementById('topicView');
  const analysis = document.getElementById('topicAnalysis');
  analysis.innerHTML = '';

  if (!timedAnswers.length) {
    view.innerHTML = '<div class="topic-done"><h3>⏱ 时间到！</h3><p>你没有作答任何题目。</p><button class="btn btn-primary" onclick="renderTopicGrid()">← 返回专题列表</button></div>';
    return;
  }

  let totalScore = 0, maxScore = 0;
  let resultsHtml = '';
  var perfectCount = 0;

  for (var i = 0; i < timedAnswers.length; i++) {
    var ta = timedAnswers[i];
    var q = ta.question;
    var ans = ta.answer;
    var scores = ans && ans !== '(skipped)' ? Analyzer.scoreTranslation(ans, q.reference, q.keywords, q.alternatives) : null;
    var overall = scores ? Math.round(scores.overall * 10) / 10 : 0;
    if (overall >= 4.5) perfectCount++;
    totalScore += overall;
    maxScore += 5;
    var status = !scores ? '⏭️' : (overall >= 4 ? '✅' : (overall >= 3 ? '🔄' : '❌'));
    resultsHtml += '<div style="background:' + (overall >= 4 ? '#f0faf0' : (overall >= 3 ? '#fffaf0' : '#fff0f0')) + ';border-radius:10px;padding:12px 16px;margin-bottom:8px;border:1px solid ' + (overall >= 4 ? '#bbf7d0' : (overall >= 3 ? '#fde68a' : '#fecaca')) + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
      '<span style="font-weight:600;font-size:0.85rem;color:#4a3f5c">#' + (i+1) + ' ' + status + ' ' + Analyzer._escapeHtml(q.source) + '</span>' +
      '<span style="font-weight:700;font-size:0.85rem;color:' + (overall >= 4 ? '#27ae60' : (overall >= 3 ? '#e67e22' : '#e74c3c')) + '">' + (scores ? overall + '/5' : '⏭️') + '</span></div>' +
      (scores ? '<div style="font-size:0.82rem;color:#888;margin-top:4px">' + Analyzer._escapeHtml(ans) + '</div>' : '') +
      '<div style="font-size:0.82rem;color:#27ae60;margin-top:2px">📖 ' + q.reference + '</div></div>';
  }

  var avg = timedAnswers.length ? Math.round(totalScore / timedAnswers.length * 10) / 10 : 0;
  var pct = maxScore ? Math.round(totalScore / maxScore * 100) : 0;

  view.innerHTML = '<div class="topic-done" style="text-align:left;padding:0;background:none;border:none">' +
    '<div style="background:linear-gradient(135deg,#1a1a2e,#2a1f4a);border-radius:20px;padding:28px;text-align:center;margin-bottom:20px;color:#fff">' +
    '<div style="font-size:2.5rem;margin-bottom:8px">' + (pct >= 80 ? '🏆' : (pct >= 60 ? '💪' : '📚')) + '</div>' +
    '<div style="font-size:1.3rem;font-weight:700;margin-bottom:4px">' + (pct >= 80 ? '优秀！' : (pct >= 60 ? '不错！' : '继续加油！')) + '</div>' +
    '<div style="font-size:0.9rem;color:rgba(255,255,255,0.6)">' + timedAnswers.length + ' 题完成 · 平均 ' + avg + '/5 · 正确率 ' + pct + '%</div>' +
    '<div style="margin-top:12px;display:flex;gap:12px;justify-content:center;font-size:0.85rem">' +
    '<span>✅ 优秀: <strong>' + perfectCount + '</strong></span>' +
    '</div></div>' +
    '<h3 style="font-size:1rem;margin-bottom:12px;color:#4a3f5c">📋 答题详情</h3>' + resultsHtml +
    '<div style="margin-top:16px;text-align:center">' +
    '<button class="btn btn-primary" onclick="renderTopicGrid()">← 返回专题列表</button>' +
    '<button class="btn btn-outline" onclick="retryTimed()" style="margin-left:8px">🔄 再来一次</button></div></div>';
}

function retryTimed() {
  var topicId = currentTopicId;
  showTimedOptions(topicId);
}

function renderTopicAnalysis(userAnswer) {
  var q = currentTopicQuestion;
  if (!q) return;
  var el = document.getElementById('topicAnalysis');
  if (!el) return;

  if (timedMode) return; // 限时模式不显示即时分析

  var scores = userAnswer ? Analyzer.scoreTranslation(userAnswer, q.reference, q.keywords, q.alternatives) : null;
  var feedback = userAnswer ? Analyzer.generateFeedback(scores, q.keywords, userAnswer, q.reference) : '';
  var diff = userAnswer ? Analyzer.wordDiff(userAnswer, q.reference, q.keywords) : [];
  var diffHtml = userAnswer && diff.length ? Analyzer.renderDiff(diff) : '';
  var feedbackHtml = userAnswer && feedback ? Analyzer.renderFeedback(feedback) : '';

  var gpItems = '';
  if (q.grammarPoints) {
    for (var i = 0; i < q.grammarPoints.length; i++) {
      var gp = q.grammarPoints[i];
      gpItems += '<div style="background:linear-gradient(135deg,#f5f0ff,#faf5ff);border-radius:12px;padding:14px 18px;margin-bottom:10px;border:1px solid rgba(192,132,252,0.2);border-left:4px solid #c084fc">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">' +
        '<span style="background:linear-gradient(135deg,#f0abfc,#c084fc);color:#fff;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:bold;box-shadow:0 2px 6px rgba(192,132,252,0.3)">' + (i+1) + '</span>' +
        '<span style="font-weight:700;color:#4a3f5c;font-size:0.9rem">' + gp.name + '</span>' +
        '<span style="margin-left:auto;font-size:0.68rem;padding:2px 8px;border-radius:6px;background:#e8f8e8;color:#27ae60;font-weight:600">✓ 本题考查</span>' +
        '</div><div style="color:#7c6fa0;font-size:0.85rem;line-height:1.6;margin-left:32px">' + gp.detail + '</div></div>';
    }
  }

  var keyPointsHtml = '';
  if (q.keywords) {
    var kp = Analyzer.extractKeyPoints(q.source, q.reference, q.keywords);
    var checked = userAnswer ? Analyzer.checkKeyPoints(userAnswer, kp, q.keywords) : { words: kp.words || [], phrases: kp.phrases || [] };
    var addSave = function(items) {
      if (!items) return;
      for (var i$ = 0; i$ < items.length; i$++) {
        var k = items[i$];
        var isSaved = vocab.words && vocab.words[k.english.toLowerCase().trim()];
        var ew = Analyzer._escapeHtml(k.english).replace(/'/g, "\\'");
        var cn = Analyzer._escapeHtml(k.chinese || '').replace(/'/g, "\\'");
        var pos = k.pos || '';
        var syn = (k.synonyms||[]).map(function(s){return Analyzer._escapeHtml(s);}).join('||').replace(/'/g,"\\'");
        var src = Analyzer._escapeHtml(q.source).replace(/'/g,"\\'");
        k._saveBtn = '<button class="kp-save-btn ' + (isSaved ? 'saved' : '') + '" data-word="' + ew + '" onclick="toggleVocabWord(\'' + ew + '\',\'' + cn + '\',\'' + pos + '\',\'' + syn + '\',\'' + src + '\')">' + (isSaved ? '✅ Saved' : '+ Save') + '</button>';
      }
    };
    addSave(checked.words);
    addSave(checked.phrases);
    keyPointsHtml = Analyzer.renderKeyPoints(checked, userAnswer || '');
  }

  el.innerHTML = '<div class="analysis-panel" style="margin-top:12px">' +
    '<h2 style="display:flex;align-items:center;gap:8px;color:#4a3f5c">' +
    '<span style="background:linear-gradient(135deg,#f0abfc,#c084fc);border-radius:10px;padding:4px 10px;font-size:0.75rem;color:#fff;font-weight:700">' + (q.diff || 'CET') + '</span>📊 分析</h2>' +

    '<div class="analysis-section" style="border-bottom:2px solid #f0e0f0;padding-bottom:16px">' +
    '<h3 style="color:#7c3aed;font-size:1rem;margin-bottom:10px">📖 本关语法知识点</h3>' +
    (gpItems || '<p style="color:#999;font-size:0.85rem">暂无语法标注</p>') + '</div>' +

    '<div class="analysis-section" id="topicSectionScore"' + (scores ? '' : ' hidden') + '>' +
    '<h3>🏆 分数总结</h3><div class="score-display">' + (scores ? Analyzer.renderScores(scores) : '') + '</div></div>' +

    '<details class="analysis-section collapse-section"' + (userAnswer ? ' open' : '') + '>' +
    '<summary><h3>📝 答案对比</h3></summary><div style="margin-top:10px">' +
    (userAnswer ? '<div style="margin-bottom:10px"><span style="color:#888;font-size:0.85rem">✏️ 你的翻译</span><div class="user-answer" style="margin-top:4px">' + Analyzer._escapeHtml(userAnswer) + '</div></div>' : '') +
    '<div><span style="color:#888;font-size:0.85rem">📖 参考答案</span><div class="reference-answer" style="margin-top:4px">' + makeClickableReference(q.reference, q.source) + '</div></div>' +
    '</div></details>' +

    (q.keywords ? '<details class="analysis-section collapse-section"><summary><h3>🎯 踩分点分析</h3></summary>' +
    '<p class="kp-hint" style="margin-top:8px">✅ 匹配 · 🔄 同义替换 · ❌ 未使用</p><div style="margin-top:6px">' + keyPointsHtml + '</div></details>' : '') +

    (diffHtml ? '<details class="analysis-section collapse-section" open><summary><h3>✅ 逐词对比</h3></summary>' +
    '<div style="margin-top:10px"><div class="diff-legend">' +
    '<span class="diff-label same">✓ 匹配</span><span class="diff-label missing">✗ 遗漏</span>' +
    '<span class="diff-label extra">+ 多余</span><span class="diff-label substituted">~ 替换</span></div>' +
    '<div class="diff-content">' + diffHtml + '</div></div></details>' : '') +

    (feedbackHtml ? '<details class="analysis-section collapse-section"><summary><h3>👩‍🏫 老师评语</h3></summary>' +
    '<div class="feedback-content" style="margin-top:10px">' + feedbackHtml + '</div></details>' : '') +

    '<details class="analysis-section collapse-section"><summary><h3>🔄 其他表达方式</h3></summary>' +
    (q.alternatives ? q.alternatives.map(function(a){return '<div class="alternative-item">' + a + '</div>';}).join('') : '<p style="color:#999;font-size:0.85rem;margin-top:8px">暂无其他表达方式</p>') +
    '</details>' +

    (q.grammar ? '<details class="analysis-section collapse-section"><summary><h3>🔍 语法笔记</h3></summary>' +
    '<div style="margin-top:8px;background:#f8f9fc;padding:14px 18px;border-radius:8px;border-left:4px solid #4361ee;line-height:1.6;font-size:0.9rem">' + q.grammar + '</div></details>' : '') +

    '<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;padding-top:16px;border-top:1px solid #edf0f5">' +
    '<button class="btn btn-primary" onclick="nextTopicQuestion()">下一题 →</button>' +
    (userAnswer ? '<button class="btn btn-outline" onclick="retryTopicQuestion()">✏️ 重写提交</button>' : '<button class="btn btn-outline" onclick="showTopicAnswer()">📖 看答案</button>') +
    '</div></div>';
}

function retryTopicQuestion() { currentTopicIndex--; nextTopicQuestion(); }
