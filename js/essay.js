// ===== Essay Bank & Self-Test Module =====
// Depends on: formatDate(), getToday() from app.js (loaded first)

// ===== 1. Data Layer =====
const ESSAYS_KEY = 'eng_essays';

function getEssayData() {
  try { return JSON.parse(localStorage.getItem(ESSAYS_KEY)) || { essays: [], progress: {} }; }
  catch(e) { return { essays: [], progress: {} }; }
}
function saveEssayData(data) {
  localStorage.setItem(ESSAYS_KEY, JSON.stringify(data));
}

// ===== 2. Sentence Helpers =====
function splitSentences(text) {
  return text.split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 10);
}

function sentenceEn(s) { return typeof s === 'string' ? s : s.en; }
function sentenceZh(s) { return typeof s === 'string' ? '' : (s.zh || ''); }

/** 翻译单个句子（MyMemory，带重试和延迟） */
async function fetchTranslation(text) {
  for (let retry = 0; retry < 2; retry++) {
    try {
      const resp = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`);
      if (!resp.ok) { await new Promise(r => setTimeout(r, 1000)); continue; }
      const data = await resp.json();
      if (data?.responseData?.translatedText) return data.responseData.translatedText;
    } catch(e) { await new Promise(r => setTimeout(r, 1000)); }
  }
  return '';
}

/** 自动翻译整篇作文中还没有中文的句子（逐一翻译，不要并发） */
async function autoTranslateEssay(essayId) {
  const data = getEssayData();
  const essay = data.essays.find(e => e.id === essayId);
  if (!essay) return;
  let updated = false;
  for (let i = 0; i < essay.sentences.length; i++) {
    const s = essay.sentences[i];
    if (sentenceZh(s)) continue;
    const en = sentenceEn(s);
    const zh = await fetchTranslation(en);
    if (zh) {
      essay.sentences[i] = { en, zh };
      updated = true;
    }
  }
  if (updated) {
    saveEssayData(data);
    renderEssayList();
    if (selfTestState && selfTestState.essayId === essayId) startSelfTest(essayId);
  }
}

// ===== 3. Import / Delete =====
function importEssay(title, enContent, zhContent) {
  const data = getEssayData();
  const enSents = splitSentences(enContent);
  if (!enSents.length) return { ok: false, msg: '未能从英文内容中解析出有效句子' };
  const zhSents = zhContent ? splitSentences(zhContent) : [];
  const sentences = enSents.map((en, i) => ({ en, zh: zhSents[i] || '' }));
  const essay = {
    id: Date.now(),
    title: title.trim() || enContent.slice(0, 30).trim() + '...',
    content: enContent.trim(),
    sentences,
    dateAdded: formatDate(getToday())
  };
  data.essays.unshift(essay);
  saveEssayData(data);
  if (!zhContent) autoTranslateEssay(essay.id);
  return { ok: true, count: sentences.length };
}

function deleteEssay(id) {
  const data = getEssayData();
  data.essays = data.essays.filter(e => e.id !== id);
  Object.keys(data.progress).forEach(k => {
    if (k.startsWith(id + '-')) delete data.progress[k];
  });
  saveEssayData(data);
}

// ===== 4. Navigation Switching =====
function initNav() {
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.getElementById('pageTranslation').hidden = tab !== 'translation';
      document.getElementById('pageEssayBank').hidden = tab !== 'essay';
      document.getElementById('pageSelfTest').hidden = tab !== 'selftest';
      if (tab === 'essay') renderEssayList();
      if (tab === 'selftest') initSelfTest();
    });
  });
}

// ===== 5. Essay Bank UI =====
function renderEssayList() {
  const data = getEssayData();
  const container = document.getElementById('essayList');
  if (!data.essays.length) {
    container.innerHTML = '<p class="empty-hint">还没有导入作文，在上方粘贴一篇开始吧。</p>';
    return;
  }
  let html = '';
  data.essays.forEach(essay => {
    const sentencesHtml = essay.sentences.map((s, i) => {
      const en = sentenceEn(s);
      const zh = sentenceZh(s);
      return `<div class="essay-sentence">
        <span class="essay-sentence-idx">${i+1}</span>
        <div style="flex:1;min-width:0">
          <div style="color:#4a3f5c;font-size:0.85rem;line-height:1.6">${escapeHtml(en)}</div>
          ${zh ? `<div style="color:#b8a0c8;font-size:0.78rem;margin-top:2px">📖 ${escapeHtml(zh)}</div>` : '<div style="color:#d0c0d8;font-size:0.75rem;margin-top:2px">⏳ 翻译中...</div>'}
        </div>
      </div>`;
    }).join('');
    html += `<div class="essay-item" data-id="${essay.id}">
      <div class="essay-item-header">
        <div>
          <div class="essay-item-title">📄 ${escapeHtml(essay.title)}</div>
          <div class="essay-item-meta">${essay.sentences.length} 句 · ${essay.dateAdded}</div>
        </div>
        <div class="essay-item-actions">
          <button class="essay-item-del" onclick="event.stopPropagation();deleteEssayClick(${essay.id})">🗑️</button>
          <button class="essay-item-del" style="color:#c084fc;font-size:0.75rem" onclick="event.stopPropagation();autoTranslateEssay(${essay.id})">🔄 翻译</button>
        </div>
      </div>
      <div class="essay-item-sentences">${sentencesHtml}</div>
    </div>`;
  });
  container.innerHTML = html;
  container.querySelectorAll('.essay-item').forEach(el => {
    el.addEventListener('click', () => el.classList.toggle('open'));
  });
}

function deleteEssayClick(id) {
  if (!confirm('确定删除这篇作文吗？')) return;
  deleteEssay(id);
  renderEssayList();
  updateSelfTestSelect();
}

function initEssayImport() {
  document.getElementById('btnImportEssay').addEventListener('click', () => {
    const title = document.getElementById('essayTitle').value.trim();
    const en = document.getElementById('essayContent').value.trim();
    const zh = document.getElementById('essayZhContent').value.trim();
    if (!en) { alert('请输入英文作文内容'); return; }
    const result = importEssay(title, en, zh);
    if (!result.ok) { alert(result.msg); return; }
    document.getElementById('essayTitle').value = '';
    document.getElementById('essayContent').value = '';
    document.getElementById('essayZhContent').value = '';
    renderEssayList();
    updateSelfTestSelect();
    alert(`✅ 导入成功！共 ${result.count} 个句子` + (zh ? '。' : '，正在逐一翻译...'));
  });
}

// ===== 6. Self-Test Logic =====
let selfTestState = null;

function updateSelfTestSelect() {
  const data = getEssayData();
  const select = document.getElementById('selftestEssaySelect');
  select.innerHTML = '<option value="">-- 选择作文 --</option>'
    + data.essays.map(e => `<option value="${e.id}">${escapeHtml(e.title)} (${e.sentences.length}句)</option>`).join('');
}

function initSelfTest() {
  updateSelfTestSelect();
  document.getElementById('selftestBody').innerHTML = '<p class="empty-hint">选择一篇作文，开始默写练习。</p>';
  selfTestState = null;
}

function startSelfTest(essayId) {
  const data = getEssayData();
  const essay = data.essays.find(e => e.id === essayId);
  if (!essay) return;
  const due = [];
  essay.sentences.forEach((s, i) => {
    const key = essayId + '-' + i;
    const prog = data.progress[key];
    if (!prog || !prog.mastered) due.push({ index: i, en: sentenceEn(s), zh: sentenceZh(s), key });
  });
  if (!due.length) {
    document.getElementById('selftestBody').innerHTML = `<div class="selftest-summary"><h3>✅ 全部掌握！🎉</h3><p>这篇作文的所有句子你都已经背熟了。</p><button class="btn btn-primary" onclick="resetSelfTest(${essayId})" style="margin-top:12px">🔄 重新开始</button></div>`;
    selfTestState = null;
    return;
  }
  for (let i = due.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [due[i], due[j]] = [due[j], due[i]];
  }
  selfTestState = { essayId, due, currentIdx: 0, wrongWords: [], answered: false, lastCorrect: null };
  renderSelfTestQuestion();
}

function renderSelfTestQuestion() {
  const body = document.getElementById('selftestBody');
  if (!selfTestState || (!selfTestState.due.length && !selfTestState.wrongWords.length)) {
    body.innerHTML = '<p class="empty-hint">没有待默写的句子。选择作文开始吧。</p>';
    return;
  }

  if (selfTestState.currentIdx >= selfTestState.due.length && selfTestState.wrongWords.length > 0) {
    selfTestState.due = [...selfTestState.wrongWords];
    for (let i = selfTestState.due.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selfTestState.due[i], selfTestState.due[j]] = [selfTestState.due[j], selfTestState.due[i]];
    }
    selfTestState.wrongWords = [];
    selfTestState.currentIdx = 0;
    selfTestState.answered = false;
  }

  if (selfTestState.currentIdx >= selfTestState.due.length) {
    const data = getEssayData();
    const essay = data.essays.find(e => e.id === selfTestState.essayId);
    const total = essay ? essay.sentences.length : 0;
    const mastered = essay ? essay.sentences.filter((_, i) => {
      const p = data.progress[essay.id + '-' + i];
      return p && p.mastered;
    }).length : 0;
    body.innerHTML = `<div class="selftest-summary"><h3>🎉 本轮完成！</h3><p>已掌握 <strong style="color:#27ae60">${mastered}</strong> / ${total} 句</p>
      <div style="margin-top:12px">
        <button class="btn btn-primary" onclick="continueSelfTest(${selfTestState.essayId})">🔄 继续默写</button>
      </div></div>`;
    selfTestState = null;
    return;
  }

  const item = selfTestState.due[selfTestState.currentIdx];
  const data = getEssayData();
  const essay = data.essays.find(e => e.id === selfTestState.essayId);
  const totalSentences = essay ? essay.sentences.length : 1;
  const masteredCount = essay ? essay.sentences.filter((_, i) => {
    const p = data.progress[essay.id + '-' + i];
    return p && p.mastered;
  }).length : 0;
  const pct = Math.round((masteredCount / totalSentences) * 100);
  const answered = selfTestState.answered;
  const correct = selfTestState.lastCorrect;

  body.innerHTML = `<div class="selftest-progress">
    <span>进度 ${pct}%</span>
    <div class="selftest-progress-bar"><div class="selftest-progress-fill" style="width:${pct}%"></div></div>
    <span>${masteredCount}/${totalSentences}</span>
  </div>
  <div class="selftest-card">
    <div class="selftest-sentence">${escapeHtml(item.zh || item.en)}</div>
    <textarea class="selftest-input" id="selftestInput" rows="2" placeholder="写出对应的英文..." ${answered ? 'disabled' : ''}>${answered && correct ? escapeHtml(item.en) : ''}</textarea>
    ${answered ? `<div class="selftest-result ${correct ? 'correct' : 'wrong'}">${correct
      ? '✅ 完全正确！'
      : `❌ 有出入。原文：<span class="sr-correct">${escapeHtml(item.en)}</span>`
    }</div>` : ''}
    <div class="selftest-actions">
      ${answered
        ? `<button class="btn btn-primary" onclick="nextSelfTest()">${correct ? '下一句 →' : '下一句（稍后重试）→'}</button>`
        : `<button class="btn btn-primary" onclick="checkSelfTest()">✅ 检查</button>
           <button class="btn btn-outline" onclick="skipSelfTest()">⏭️ 跳过</button>`
      }
      <button class="btn btn-ghost" onclick="playSelfTestAudio()">🔊 朗读</button>
    </div>
  </div>`;

  if (!answered) {
    const inp = document.getElementById('selftestInput');
    if (inp) { inp.focus(); inp.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) checkSelfTest(); }); }
  }
}

function checkSelfTest() {
  if (!selfTestState || selfTestState.answered) return;
  const inp = document.getElementById('selftestInput');
  if (!inp) return;
  const userAnswer = inp.value.trim();
  if (!userAnswer) return;

  const item = selfTestState.due[selfTestState.currentIdx];
  const normalized = s => s.toLowerCase().replace(/[.,!?;:'"()]/g, '').replace(/\s+/g, ' ').trim();
  const normUser = normalized(userAnswer);
  const normRef = normalized(item.en);

  let correct = normUser === normRef;
  if (!correct) {
    const userWords = normUser.split(/\s+/);
    const refWords = normRef.split(/\s+/);
    let hits = 0;
    refWords.forEach(w => { if (userWords.includes(w)) hits++; });
    correct = (hits / refWords.length) >= 0.8;
  }

  selfTestState.answered = true;
  selfTestState.lastCorrect = correct;

  const data = getEssayData();
  const key = selfTestState.essayId + '-' + item.index;
  if (!data.progress[key]) data.progress[key] = { correct: 0, wrong: 0, mastered: false, lastReview: '' };
  if (correct) {
    data.progress[key].correct++;
    data.progress[key].mastered = true;
    data.progress[key].lastReview = formatDate(getToday());
  } else {
    data.progress[key].wrong++;
    selfTestState.wrongWords.push(item);
  }
  saveEssayData(data);
  renderSelfTestQuestion();
}

function skipSelfTest() {
  if (!selfTestState || selfTestState.answered) return;
  selfTestState.answered = true;
  selfTestState.lastCorrect = false;
  selfTestState.wrongWords.push(selfTestState.due[selfTestState.currentIdx]);
  renderSelfTestQuestion();
}

function nextSelfTest() {
  if (!selfTestState) return;
  selfTestState.currentIdx++;
  selfTestState.answered = false;
  selfTestState.lastCorrect = null;
  renderSelfTestQuestion();
}

function continueSelfTest(essayId) { startSelfTest(essayId); }

function resetSelfTest(essayId) {
  const data = getEssayData();
  Object.keys(data.progress).forEach(k => {
    if (k.startsWith(essayId + '-')) delete data.progress[k];
  });
  saveEssayData(data);
  startSelfTest(essayId);
}

function playSelfTestAudio() {
  if (!selfTestState) return;
  const item = selfTestState.due[selfTestState.currentIdx];
  if (!item) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(item.en);
    u.lang = 'en-US';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }
}

// ===== 7. Event Listeners & Helpers =====

document.getElementById('selftestEssaySelect').addEventListener('change', function() {
  if (this.value) startSelfTest(Number(this.value));
  else initSelfTest();
});

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initEssayImport();
});
