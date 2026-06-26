// ===== 专题练习页面逻辑 =====
let currentTopicId = null;
let currentTopicQuestion = null;
let currentTopicIndex = -1;

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
  document.getElementById('topicAnalysis').innerHTML = '';
  document.getElementById('topicView').hidden = true;
  document.getElementById('topicAnalysis').hidden = true;
}

function startTopic(topicId) {
  currentTopicId = topicId;
  currentTopicIndex = -1;
  const topic = getAllTopics().find(t => t.id === topicId);
  if (!topic) return;
  // 打乱题目顺序
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
    analysis.hidden = true;
    return;
  }

  currentTopicQuestion = currentTopicQuestions[currentTopicIndex];
  const total = currentTopicQuestions.length;
  const pos = currentTopicIndex + 1;
  const topic = getAllTopics().find(t => t.id === currentTopicId);

  view.hidden = false;
  analysis.hidden = true;
  view.innerHTML = `
    <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:0.85rem;color:#888">${topic.icon} ${topic.name} · ${pos}/${total}</span>
      <button class="btn btn-ghost" onclick="renderTopicGrid()" style="font-size:0.78rem">← 返回</button>
    </div>
    <div class="main-card" style="margin-bottom:16px">
      <div class="question-section">
        <h2>📝 翻译句子：</h2>
        <div class="source-sentence" style="background:#f0f0ff;border-left-color:#c084fc">${currentTopicQuestion.source}</div>
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
  el.hidden = false;

  const scores = Analyzer.scoreTranslation(userAnswer || q.reference, q.reference, q.keywords, q.alternatives);

  let gpHtml = '';
  if (q.grammarPoints) {
    gpHtml = '<div style="margin-bottom:16px"><h3 style="font-size:1rem;margin-bottom:10px;color:#7c3aed">📖 语法知识点</h3>';
    q.grammarPoints.forEach((gp, i) => {
      gpHtml += `<div style="background:#f5f0ff;border-radius:10px;padding:12px 16px;margin-bottom:8px;border-left:4px solid #c084fc">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="background:#c084fc;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:bold">${i+1}</span>
          <span style="font-weight:600;color:#4a3f5c;font-size:0.9rem">${gp.name}</span>
        </div>
        <div style="color:#7c6fa0;font-size:0.85rem;line-height:1.6;margin-left:28px">${gp.detail}</div>
      </div>`;
    });
    gpHtml += '</div>';
  }

  const feedback = userAnswer ? Analyzer.generateFeedback(scores, q.keywords, userAnswer, q.reference) : '';
  const diff = userAnswer ? Analyzer.wordDiff(userAnswer, q.reference, q.keywords) : [];
  const diffHtml = userAnswer && diff.length ? Analyzer.renderDiff(diff) : '';

  let userHtml = userAnswer
    ? `<div style="margin-bottom:10px"><span style="color:#888;font-size:0.85rem">✏️ 你的翻译</span><div class="user-answer" style="margin-top:4px">${Analyzer._escapeHtml(userAnswer)}</div></div>`
    : '';

  el.innerHTML = `
    <div class="main-card">
      ${gpHtml}
      <div style="margin-bottom:10px"><span style="color:#888;font-size:0.85rem">📖 参考答案</span><div class="reference-answer" style="margin-top:4px">${q.reference}</div></div>
      ${userHtml}
      ${userAnswer ? `<div style="margin-bottom:10px"><span style="color:#888;font-size:0.85rem">📊 评分</span>${Analyzer.renderScores(scores)}</div>` : ''}
      ${diffHtml ? `<div style="margin-bottom:10px"><span style="color:#888;font-size:0.85rem">✅ 逐词对比</span><div class="diff-content" style="margin-top:4px">${diffHtml}</div></div>` : ''}
      ${feedback ? `<div style="margin-bottom:10px"><span style="color:#888;font-size:0.85rem">👩‍🏫 老师评语</span><div class="feedback-content" style="margin-top:4px">${Analyzer.renderFeedback(feedback)}</div></div>` : ''}
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="nextTopicQuestion()">下一题 →</button>
        ${userAnswer ? `<button class="btn btn-outline" onclick="retryTopicQuestion()">✏️ 重写提交</button>` : ''}
      </div>
    </div>
  `;
}

function retryTopicQuestion() {
  currentTopicIndex--;
  nextTopicQuestion();
}
