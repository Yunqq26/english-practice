// ===== 汉译英专项练习 =====
const ZHEN_API = 'https://backend-production-80b8b.up.railway.app/api/trans';
let zhenState = { mode: null, questions: [], currentIdx: 0, answers: [] };

function renderZhenPage() {
  document.getElementById('zhenGrid').innerHTML = `
    <div style="max-width:500px;margin:40px auto;text-align:center">
      <div style="font-size:2rem;margin-bottom:10px">📝</div>
      <div style="font-size:1.3rem;font-weight:700;color:#4a3f5c;margin-bottom:6px">汉译英专项练习</div>
      <p style="color:#b8a8c8;font-size:0.85rem;margin-bottom:24px">浙江专升本英语备考 · AI 智能批改</p>
      <div class="zhen-cards">
        <div class="zhen-card" onclick="startZhenDaily()">
          <div class="zhen-card-icon">📅</div>
          <div class="zhen-card-title">每日五题</div>
          <div class="zhen-card-desc">每天 5 题，覆盖不同语法模块。连续打卡养成习惯。</div>
          <div id="zhenStreak" style="margin-top:8px;font-size:0.78rem;color:#f0ab60"></div>
        </div>
        <div class="zhen-card" onclick="showZhenFreeOptions()">
          <div class="zhen-card-icon">📚</div>
          <div class="zhen-card-title">自由练习</div>
          <div class="zhen-card-desc">按语法模块筛选，自选题量，针对性薄弱环节训练。</div>
        </div>
      </div>
    </div>
  `;
  // 加载打卡数据
  if (currentUser) {
    fetch(ZHEN_API + '/streak/' + encodeURIComponent(currentUser.username))
      .then(r => r.json()).then(d => {
        const el = document.getElementById('zhenStreak');
        if (el) el.textContent = '🔥 连续打卡 ' + d.current_streak + ' 天';
      }).catch(() => {});
  }
}

async function startZhenDaily() {
  if (!currentUser) { alert('请先登录'); return; }
  zhenState.mode = 'daily';
  zhenState.currentIdx = 0;
  zhenState.answers = [];
  try {
    const r = await fetch(ZHEN_API + '/daily/' + encodeURIComponent(currentUser.username));
    const data = await r.json();
    if (data.empty) { alert('题库为空，请先联系管理员生成题目'); return; }
    zhenState.questions = data.questions;
    // 恢复已答题
    for (const [qid, ans] of Object.entries(data.answers || {})) {
      zhenState.answers[zhenState.questions.findIndex(q => q.id == qid)] = ans;
    }
    renderZhenQuestion();
  } catch(e) { alert('加载失败'); }
}

async function showZhenFreeOptions() {
  if (!currentUser) { alert('请先登录'); return; }
  try {
    const r = await fetch(ZHEN_API + '/modules');
    const modules = await r.json();
    let modHtml = '<option value="all">全部模块</option>';
    modules.forEach(m => { modHtml += '<option value="' + m + '">' + m + '</option>'; });
    document.getElementById('zhenGrid').innerHTML = `
      <div style="max-width:500px;margin:20px auto">
        <div style="font-size:1.1rem;font-weight:700;color:#4a3f5c;margin-bottom:16px">📚 自由练习</div>
        <label style="font-size:0.85rem;color:#888;display:block;margin-bottom:4px">选择语法模块</label>
        <select id="zhenModuleSelect" style="width:100%;padding:10px 14px;border:2px solid #f0e0f0;border-radius:12px;font-size:0.9rem;font-family:inherit;margin-bottom:12px">${modHtml}</select>
        <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
          <button class="btn btn-outline" onclick="startZhenFree(5)">5 题</button>
          <button class="btn btn-outline" onclick="startZhenFree(10)">10 题</button>
          <button class="btn btn-outline" onclick="startZhenFree(20)">20 题</button>
          <button class="btn btn-outline" onclick="startZhenFree(0)" style="color:#c084fc;border-color:#c084fc">只练错题</button>
        </div>
        <button class="btn btn-ghost" onclick="renderZhenPage()" style="font-size:0.78rem">← 返回</button>
      </div>
    `;
  } catch(e) { alert('加载模块失败'); }
}

async function startZhenFree(limit) {
  const mod = document.getElementById('zhenModuleSelect').value;
  const isWrongOnly = limit === 0;
  try {
    const r = await fetch(ZHEN_API + '/questions?module=' + encodeURIComponent(mod) + '&limit=' + (isWrongOnly ? 50 : limit) + '&wrongOnly=' + isWrongOnly + '&username=' + encodeURIComponent(currentUser.username));
    const questions = await r.json();
    if (!questions.length) { alert('没有符合条件的题目'); return; }
    zhenState.mode = 'free';
    zhenState.questions = questions;
    zhenState.currentIdx = 0;
    zhenState.answers = [];
    renderZhenQuestion();
  } catch(e) { alert('加载失败'); }
}

function renderZhenQuestion() {
  if (zhenState.currentIdx >= zhenState.questions.length) {
    renderZhenComplete();
    return;
  }
  const q = zhenState.questions[zhenState.currentIdx];
  const pos = zhenState.currentIdx + 1;
  const total = zhenState.questions.length;
  const existingAns = zhenState.answers[zhenState.currentIdx];

  // 进度条
  const pct = Math.round((pos - 1) / total * 100);

  // 检查是否已答
  if (existingAns) {
    renderZhenResult(q, existingAns);
    return;
  }

  document.getElementById('zhenGrid').innerHTML = `
    <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:0.85rem;color:#888">📝 汉译英 · ${pos}/${total}</span>
      <button class="btn btn-ghost" onclick="renderZhenPage()" style="font-size:0.78rem">← 返回</button>
    </div>
    <div style="height:4px;background:#eef0f5;border-radius:2px;margin-bottom:16px;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#6366f1,#c084fc);border-radius:2px;transition:width 0.3s"></div>
    </div>
    <div class="main-card" style="margin-bottom:0">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="background:linear-gradient(135deg,#6366f1,#c084fc);border-radius:8px;padding:2px 10px;font-size:0.72rem;color:#fff;font-weight:700">${q.module}</span>
        <span style="font-size:0.72rem;color:#888">难度 ${'⭐'.repeat(q.difficulty || 2)}</span>
      </div>
      <div style="background:#f0f0ff;border-radius:14px;padding:18px 20px;border-left:4px solid #6366f1;margin-bottom:16px;font-size:1.05rem;line-height:1.7;color:#2c2440">
        ${q.chinese_prompt}
      </div>
      <div class="input-section">
        <label for="zhenInput">✏️ 输入你的翻译：</label>
        <textarea id="zhenInput" rows="3" placeholder="在此输入英文翻译..." autofocus></textarea>
      </div>
      <div class="action-bar">
        <button class="btn btn-primary" onclick="submitZhenAnswer()">提交批改</button>
        <button class="btn btn-ghost" onclick="nextZhenQuestion()">跳过 →</button>
      </div>
    </div>
    <div id="zhenResult"></div>
  `;
  setTimeout(() => {
    const inp = document.getElementById('zhenInput');
    if (inp) { inp.focus(); inp.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitZhenAnswer(); }); }
  }, 50);
}

async function submitZhenAnswer() {
  const inp = document.getElementById('zhenInput');
  if (!inp) return;
  const answer = inp.value.trim();
  if (!answer) return;
  const q = zhenState.questions[zhenState.currentIdx];
  const btn = document.querySelector('.btn-primary');
  if (btn) { btn.textContent = '⏳ 批改中...'; btn.disabled = true; }

  try {
    const r = await fetch(ZHEN_API + '/grade', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        questionId: q.id,
        userAnswer: answer,
        username: currentUser ? currentUser.username : 'anonymous',
        type: zhenState.mode
      })
    });
    const result = await r.json();
    if (result.error) { alert(result.error); if(btn){btn.textContent='提交批改';btn.disabled=false;} return; }

    zhenState.answers[zhenState.currentIdx] = { user_answer: answer, score: result.score, errors: result.errors, question_id: q.id };
    renderZhenResult(q, zhenState.answers[zhenState.currentIdx], result);
  } catch(e) {
    alert('批改服务暂时繁忙，请重试');
    if(btn){btn.textContent='提交批改';btn.disabled=false;}
  }
}

function renderZhenResult(q, ans, result) {
  const res = result || ans;
  const errors = typeof res.errors === 'string' ? JSON.parse(res.errors) : (res.errors || []);
  const score = res.score || 0;
  const pos = zhenState.currentIdx + 1;
  const total = zhenState.questions.length;

  document.getElementById('zhenGrid').innerHTML = `
    <div style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:0.85rem;color:#888">📝 汉译英 · ${pos}/${total}</span>
      <button class="btn btn-ghost" onclick="renderZhenPage()" style="font-size:0.78rem">← 返回</button>
    </div>
    ${pos < total ? `<div style="height:4px;background:#eef0f5;border-radius:2px;margin-bottom:16px;overflow:hidden"><div style="height:100%;width:${Math.round(pos/total*100)}%;background:linear-gradient(90deg,#6366f1,#c084fc);border-radius:2px;transition:width 0.3s"></div></div>` : ''}

    <div class="analysis-panel" style="margin-top:0">
      <h2 style="display:flex;align-items:center;gap:8px;color:#4a3f5c">
        <span style="background:${score >= 2 ? '#27ae60' : (score >= 1 ? '#e67e22' : '#e74c3c')};border-radius:10px;padding:4px 10px;font-size:0.78rem;color:#fff;font-weight:700">${score}/2</span>
        批改结果
      </h2>

      <div class="analysis-section">
        <h3>✏️ 我的译文</h3>
        <div class="user-answer" style="margin-top:4px">${escapeHtml(ans.user_answer || '')}</div>
      </div>

      <div class="analysis-section">
        <h3>📊 评分与纠错</h3>
        <div style="margin-top:6px;font-size:2rem;font-weight:700;color:${score >= 2 ? '#27ae60' : (score >= 1 ? '#e67e22' : '#e74c3c')}">${score}/2</div>
        ${errors.length ? errors.map(e => '<div style="background:#fff5f5;border-radius:8px;padding:10px 14px;margin-top:6px;border-left:3px solid #e74c3c;font-size:0.85rem;color:#555">❌ ' + e + '</div>').join('') : '<div style="background:#f0faf0;border-radius:8px;padding:10px 14px;margin-top:6px;border-left:3px solid #27ae60;font-size:0.85rem;color:#27ae60">✅ 没有明显的语法错误</div>'}
      </div>

      <div class="analysis-section">
        <h3>📖 标准参考译文</h3>
        <div class="reference-answer" style="margin-top:4px">${q.reference_answer}</div>
      </div>

      <div class="analysis-section" style="border-bottom:none">
        <h3>🎯 考点解析</h3>
        <div style="margin-top:6px;font-size:0.88rem;color:#555;line-height:1.6">${q.grammar_point || '本题考察综合翻译能力'}</div>
        ${q.key_phrases ? '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">' + (typeof q.key_phrases === 'string' ? JSON.parse(q.key_phrases) : q.key_phrases).map(k => '<span style="background:#ede7f6;padding:4px 12px;border-radius:12px;font-size:0.82rem;color:#7b1fa2">' + k + '</span>').join('') + '</div>' : ''}
      </div>

      <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;padding-top:16px;border-top:1px solid #edf0f5">
        <button class="btn btn-primary" onclick="nextZhenQuestion()">${pos < total ? '下一题 →' : '查看结果'}</button>
      </div>
    </div>
  `;
}

function nextZhenQuestion() {
  zhenState.currentIdx++;
  renderZhenQuestion();
}

function renderZhenComplete() {
  const total = zhenState.answers.length;
  const scored = zhenState.answers.filter(a => a && a.score !== undefined);
  const avg = scored.length ? (scored.reduce((s,a) => s + a.score, 0) / scored.length).toFixed(1) : 0;
  const perfect = scored.filter(a => a.score >= 2).length;
  const passed = scored.filter(a => a.score >= 1).length;

  document.getElementById('zhenGrid').innerHTML = `
    <div style="max-width:500px;margin:20px auto;text-align:center">
      <div style="background:linear-gradient(135deg,#1a1a2e,#2a1f4a);border-radius:20px;padding:32px;color:#fff;margin-bottom:20px">
        <div style="font-size:2.5rem;margin-bottom:8px">${avg >= 1.5 ? '🎉' : '💪'}</div>
        <div style="font-size:1.3rem;font-weight:700;margin-bottom:4px">${zhenState.mode === 'daily' ? '今日打卡完成！' : '练习完成！'}</div>
        <div style="font-size:0.9rem;color:rgba(255,255,255,0.6)">完成 ${total} 题 · 平均 ${avg}/2 分 · 满分 ${perfect} 题</div>
      </div>
      <button class="btn btn-primary" onclick="renderZhenPage()">← 返回</button>
    </div>
  `;
}

function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
