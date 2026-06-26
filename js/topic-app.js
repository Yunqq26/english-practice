// ===== 专题练习页面逻辑 =====
let currentTopicId = null;
let currentTopicQuestion = null;
let currentTopicIndex = -1;
let currentTopicQuestions = [];

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
  currentTopicId = topicId;
  currentTopicIndex = -1;
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
    view.innerHTML = '<div class="topic-done"><h3>🎉 全部完成！</h3><p>该专题的所有题目已做完。</p><button class="btn btn-primary" onclick="renderTopicGrid()">← 返回专题列表</button></div>';
    view.hidden = false;
    return;
  }

  currentTopicQuestion = currentTopicQuestions[currentTopicIndex];
  const total = currentTopicQuestions.length;
  const pos = currentTopicIndex + 1;
  const topic = getAllTopics().find(t => t.id === currentTopicId);

  view.hidden = false;
  view.innerHTML = `
    <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:0.85rem;color:#888">${topic.icon} ${topic.name} · ${pos}/${total}</span>
      <button class="btn btn-ghost" onclick="renderTopicGrid()" style="font-size:0.78rem">← 返回</button>
    </div>
    <div class="main-card" style="margin-bottom:0">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <span style="background:linear-gradient(135deg,#f0abfc,#c084fc);border-radius:8px;padding:2px 10px;font-size:0.72rem;color:#fff;font-weight:700">${currentTopicQuestion.diff || 'CET'}</span>
      </div>
      <div class="question-section">
        <h2>📝 翻译句子：</h2>
        <div class="source-sentence" style="background:#f5f0ff;border-left-color:#c084fc">${currentTopicQuestion.source}</div>
      </div>
      <div class="input-section">
        <label for="topicInput">✏️ 你的翻译：</label>
        <textarea id="topicInput" rows="3" placeholder="Type your English translation here..." autofocus></textarea>
      </div>
      <div class="action-bar">
        <button class="btn btn-primary" onclick="submitTopicAnswer()">Submit</button>
        <button class="btn btn-outline" onclick="showTopicAnswer()">Show Answer</button>
        <button class="btn btn-ghost" onclick="nextTopicQuestion()">跳过 →</button>
      </div>
    </div>
    <div id="topicAnalysis"></div>
  `;

  setTimeout(() => {
    const inp = document.getElementById('topicInput');
    if (inp) { inp.focus(); inp.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitTopicAnswer(); }); }
  }, 50);
}

function submitTopicAnswer() {
  const inp = document.getElementById('topicInput');
  if (!inp) return;
  const answer = inp.value.trim();
  if (!answer) return;
  renderTopicAnalysis(answer);
}

function showTopicAnswer() {
  if (!currentTopicQuestion) return;
  renderTopicAnalysis('');
}

function renderTopicAnalysis(userAnswer) {
  const q = currentTopicQuestion;
  if (!q) return;
  const el = document.getElementById('topicAnalysis');
  if (!el) return;

  const scores = userAnswer ? Analyzer.scoreTranslation(userAnswer, q.reference, q.keywords, q.alternatives) : null;
  const feedback = userAnswer ? Analyzer.generateFeedback(scores, q.keywords, userAnswer, q.reference) : '';
  const diff = userAnswer ? Analyzer.wordDiff(userAnswer, q.reference, q.keywords) : [];
  const diffHtml = userAnswer && diff.length ? Analyzer.renderDiff(diff) : '';
  const feedbackHtml = userAnswer && feedback ? Analyzer.renderFeedback(feedback) : '';

  // 语法知识点
  let gpItems = '';
  if (q.grammarPoints) {
    q.grammarPoints.forEach((gp, i) => {
      gpItems += '<div style="background:linear-gradient(135deg,#f5f0ff,#faf5ff);border-radius:12px;padding:14px 18px;margin-bottom:10px;border:1px solid rgba(192,132,252,0.2);border-left:4px solid #c084fc">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">' +
        '<span style="background:linear-gradient(135deg,#f0abfc,#c084fc);color:#fff;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:bold;box-shadow:0 2px 6px rgba(192,132,252,0.3)">' + (i+1) + '</span>' +
        '<span style="font-weight:700;color:#4a3f5c;font-size:0.9rem">' + gp.name + '</span>' +
        '<span style="margin-left:auto;font-size:0.68rem;padding:2px 8px;border-radius:6px;background:#e8f8e8;color:#27ae60;font-weight:600">✓ 本题考查</span>' +
        '</div>' +
        '<div style="color:#7c6fa0;font-size:0.85rem;line-height:1.6;margin-left:32px">' + gp.detail + '</div></div>';
    });
  }

  // 踩分点 + Save 按钮
  let keyPointsHtml = '';
  if (q.keywords) {
    const kp = Analyzer.extractKeyPoints(q.source, q.reference, q.keywords);
    const checked = userAnswer ? Analyzer.checkKeyPoints(userAnswer, kp, q.keywords) : { words: kp.words || [], phrases: kp.phrases || [] };
    const addSave = (items) => {
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const k = items[i];
        const isSaved = vocab.words && vocab.words[k.english.toLowerCase().trim()];
        const ew = Analyzer._escapeHtml(k.english).replace(/'/g, "\\'");
        const cn = Analyzer._escapeHtml(k.chinese || '').replace(/'/g, "\\'");
        const pos = k.pos || '';
        const syn = (k.synonyms||[]).map(function(s){return Analyzer._escapeHtml(s);}).join('||').replace(/'/g,"\\'");
        const src = Analyzer._escapeHtml(q.source).replace(/'/g,"\\'");
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

    // 语法知识点
    '<div class="analysis-section" style="border-bottom:2px solid #f0e0f0;padding-bottom:16px">' +
    '<h3 style="color:#7c3aed;font-size:1rem;margin-bottom:10px">📖 本关语法知识点</h3>' +
    (gpItems || '<p style="color:#999;font-size:0.85rem">暂无语法标注</p>') + '</div>' +

    // 分数总结
    '<div class="analysis-section" id="topicSectionScore"' + (scores ? '' : ' hidden') + '>' +
    '<h3>🏆 分数总结</h3><div class="score-display">' + (scores ? Analyzer.renderScores(scores) : '') + '</div></div>' +

    // 答案对比（参考答案可点击添加生词）
    '<details class="analysis-section collapse-section"' + (userAnswer ? ' open' : '') + '>' +
    '<summary><h3>📝 答案对比</h3></summary><div style="margin-top:10px">' +
    (userAnswer ? '<div style="margin-bottom:10px"><span style="color:#888;font-size:0.85rem">✏️ 你的翻译</span><div class="user-answer" style="margin-top:4px">' + Analyzer._escapeHtml(userAnswer) + '</div></div>' : '') +
    '<div><span style="color:#888;font-size:0.85rem">📖 参考答案</span><div class="reference-answer" style="margin-top:4px">' + makeClickableReference(q.reference, q.source) + '</div></div>' +
    '</div></details>' +

    // 踩分点分析（含 Save 按钮）
    (q.keywords ? '<details class="analysis-section collapse-section"><summary><h3>🎯 踩分点分析</h3></summary>' +
    '<p class="kp-hint" style="margin-top:8px">✅ 匹配 · 🔄 同义替换 · ❌ 未使用</p>' +
    '<div style="margin-top:6px">' + keyPointsHtml + '</div></details>' : '') +

    // 逐词对比
    (diffHtml ? '<details class="analysis-section collapse-section" open><summary><h3>✅ 逐词对比</h3></summary>' +
    '<div style="margin-top:10px"><div class="diff-legend">' +
    '<span class="diff-label same">✓ 匹配</span><span class="diff-label missing">✗ 遗漏</span>' +
    '<span class="diff-label extra">+ 多余</span><span class="diff-label substituted">~ 替换</span></div>' +
    '<div class="diff-content">' + diffHtml + '</div></div></details>' : '') +

    // 老师评语
    (feedbackHtml ? '<details class="analysis-section collapse-section"><summary><h3>👩‍🏫 老师评语</h3></summary>' +
    '<div class="feedback-content" style="margin-top:10px">' + feedbackHtml + '</div></details>' : '') +

    // 其他表达方式
    '<details class="analysis-section collapse-section"><summary><h3>🔄 其他表达方式</h3></summary>' +
    (q.alternatives ? q.alternatives.map(function(a){return '<div class="alternative-item">' + a + '</div>';}).join('') : '<p style="color:#999;font-size:0.85rem;margin-top:8px">暂无其他表达方式</p>') +
    '</details>' +

    // 语法笔记
    (q.grammar ? '<details class="analysis-section collapse-section"><summary><h3>🔍 语法笔记</h3></summary>' +
    '<div style="margin-top:8px;background:#f8f9fc;padding:14px 18px;border-radius:8px;border-left:4px solid #4361ee;line-height:1.6;font-size:0.9rem">' + q.grammar + '</div></details>' : '') +

    // 操作按钮
    '<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;padding-top:16px;border-top:1px solid #edf0f5">' +
    '<button class="btn btn-primary" onclick="nextTopicQuestion()">下一题 →</button>' +
    (userAnswer ? '<button class="btn btn-outline" onclick="retryTopicQuestion()">✏️ 重写提交</button>' : '<button class="btn btn-outline" onclick="showTopicAnswer()">📖 看答案</button>') +
    '</div></div>';
}

function retryTopicQuestion() {
  currentTopicIndex--;
  nextTopicQuestion();
}
