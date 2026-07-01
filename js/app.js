// ===== Constants & State =====
const START_DATE = new Date('2026-06-01');
const APP_USERS_KEY = 'eng_app_users';
const APP_SESSION_KEY = 'eng_app_session';
const APP_DATA_KEY = 'eng_app_data';
const ADMIN_KEY = 'DBWCSR';
const OLD_STORAGE_KEY = 'eng_practice_progress';
const OLD_VOCAB_KEY = 'eng_practice_vocab';

let currentUser = null; // { username, role }
let currentQuestion = null;
let currentQuestionIndex = -1;
let currentMode = 'sentence';
let state = {
  progress: {},
  stats: { totalDays: 0, completedDays: 0, streak: 0 }
};
let vocab = { words: {} };
let reviewState = null;
let modeCache = { sentence: null, paragraph: null };

// ===== User / Auth System =====
function hashPW(pw) { return btoa('eng_' + pw + '_salt'); }

function getUsers() {
  try { return JSON.parse(localStorage.getItem(APP_USERS_KEY)) || {}; }
  catch(e) { return {}; }
}

function saveUsers(users) {
  localStorage.setItem(APP_USERS_KEY, JSON.stringify(users));
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(APP_SESSION_KEY)); }
  catch(e) { return null; }
}

function saveSession(user) {
  if (user) localStorage.setItem(APP_SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(APP_SESSION_KEY);
}

function getAllUserData() {
  try { return JSON.parse(localStorage.getItem(APP_DATA_KEY)) || {}; }
  catch(e) { return {}; }
}

function saveAllUserData(data) {
  localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
}

function getUserData(username) {
  const all = getAllUserData();
  return all[username] || { progress: {}, stats: { totalDays:0, completedDays:0, streak:0 }, vocab: { words: {} } };
}

function saveCurrentUserData() {
  if (!currentUser) return;
  const all = getAllUserData();
  all[currentUser.username] = {
    progress: state.progress,
    stats: state.stats,
    vocab: vocab
  };
  saveAllUserData(all);
}

// ===== Migration from old single-user format =====
function ensureYunqqExists() {
  const users = getUsers();
  if (!users['Yunqq']) {
    users['Yunqq'] = { password: hashPW('88888888'), role: 'admin' };
    saveUsers(users);
    const all = getAllUserData();
    if (!all['Yunqq']) all['Yunqq'] = { progress: {}, stats: { totalDays:0, completedDays:0, streak:0 }, vocab: { words: {} } };
    saveAllUserData(all);
  }
}

function migrateOldData() {
  const oldProgress = localStorage.getItem(OLD_STORAGE_KEY);
  const oldVocab = localStorage.getItem(OLD_VOCAB_KEY);

  //确保Yunqq账户始终存在
  ensureYunqqExists();

  if (!oldProgress && !oldVocab) return false;

  const users = getUsers();
  const allData = getAllUserData();
  if (!allData['Yunqq']) allData['Yunqq'] = { progress: {}, stats: {}, vocab: { words: {} } };

  if (oldProgress) {
    try {
      const parsed = JSON.parse(oldProgress);
      allData['Yunqq'].progress = parsed.progress || {};
      allData['Yunqq'].stats = parsed.stats || { totalDays:0, completedDays:0, streak:0 };
    } catch(e) {}
    localStorage.removeItem(OLD_STORAGE_KEY);
  }

  if (oldVocab) {
    try { allData['Yunqq'].vocab = JSON.parse(oldVocab); }
    catch(e) {}
    localStorage.removeItem(OLD_VOCAB_KEY);
  }

  saveAllUserData(allData);
  return true;
}

function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

let currentCaptcha = '';

function renderAuthPage(action) {
  const root = document.getElementById('mainCard');
  root.style.background = 'transparent';
  root.style.padding = '0';
  root.style.boxShadow = 'none';
  const panels = [document.getElementById('analysisPanel'), document.querySelector('.bottom-panel'), document.querySelector('.mode-toggle')];
  panels.forEach(p => { if (p) { p.style.display = 'none'; } });
  document.body.classList.add("login-page");
  document.body.style.background = "linear-gradient(135deg, #F5F0EB 0%, #F0E6D6 35%, #E4E2E8 65%, #D6E0E8 100%)";
  document.body.style.padding = '0';
  document.body.style.margin = '0';
  const c = document.querySelector('.container');
  if (c) { c.style.maxWidth = '100%'; c.style.padding = '0'; c.style.margin = '0'; }
  document.documentElement.style.margin = '0';
  document.documentElement.style.padding = '0';

  const sharedHTML = (mode) => {
    const isLogin = mode === 'login';
    const penIcon = "✒️";
    const bookIcon = "📖";
    return `<div id="three-container" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0"></div>
    <div class="auth-wrapper" style="background:transparent!important">
      <div class="auth-card">
        <div class="auth-card-header">
          <div class="auth-logo">${isLogin ? penIcon : bookIcon}</div>
          <h2>${isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>${isLogin ? '登录继续你的翻译练习' : '加入英语翻译练习，每日精进'}</p>
        </div>
        <div class="auth-divider"></div>
        <div class="auth-card-body">
          ${isLogin ? `
          <div class="auth-field">
            <input id="loginUser" placeholder="用户名" autocomplete="off">
            <label for="loginUser">用户名</label>
          </div>
          <div class="auth-field">
            <input type="password" id="loginPass" placeholder="密码">
            <label for="loginPass">密码</label>
          </div>
          <div class="auth-error" id="loginError"></div>
          <button class="auth-btn auth-btn-primary" onclick="handleLogin()">登录</button>
          <div class="auth-link">没有账号？<a href="#" onclick="renderAuthPage('register');return false">立即注册</a></div>`
          : `
          <div class="auth-field">
            <input id="regUser" placeholder="用户名" autocomplete="off">
            <label for="regUser">用户名</label>
          </div>
          <div class="auth-field">
            <input type="password" id="regPass" placeholder="密码（至少8位）">
            <label for="regPass">密码</label>
          </div>
          <div class="auth-field">
            <input type="password" id="regPass2" placeholder="确认密码">
            <label for="regPass2">确认密码</label>
          </div>
          <div class="auth-captcha">
            <span class="auth-captcha-code">${currentCaptcha}</span>
            <div class="auth-field">
              <input id="regCaptcha" placeholder="验证码">
              <label for="regCaptcha">验证码</label>
            </div>
            <button class="auth-captcha-refresh" onclick="renderAuthPage('register')">↻</button>
          </div>
          <div class="auth-role-group">
            <button class="auth-role-btn active" id="roleUserBtn" onclick="selectRole('user')">👤 普通用户</button>
            <button class="auth-role-btn" id="roleAdminBtn" onclick="selectRole('admin')">🔑 管理员</button>
          </div>
          <div id="adminKeyWrap" style="display:none">
            <div class="auth-field">
              <input id="regAdminKey" placeholder="管理员密钥">
              <label for="regAdminKey">管理员密钥</label>
            </div>
          </div>
          <input type="hidden" id="regRole" value="user">
          <div class="auth-error" id="regError"></div>
          <button class="auth-btn auth-btn-primary" onclick="handleRegister()">注册</button>
          <div class="auth-link">已有账号？<a href="#" onclick="renderAuthPage('login');return false">去登录</a></div>`}
        </div>
      </div>
    </div>`;
  };

  if (action === 'register') {
    currentCaptcha = generateCaptcha();
    root.innerHTML = sharedHTML('register');
    setTimeout(() => {
      const inp = document.getElementById('regUser');
      if (inp) inp.focus();
      document.querySelectorAll('.auth-input').forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') handleRegister(); });
      });
    }, 50);
  } else {
    root.innerHTML = sharedHTML('login');
    setTimeout(() => {
      const inp = document.getElementById('loginUser');
      if (inp) inp.focus();
      document.querySelectorAll('.auth-input').forEach(el => {
        el.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
      });
    }, 50);
  }
  document.querySelector('.header').style.display = 'none';
  const nb = document.querySelector('.nav-bar');
  if (nb) nb.style.display = 'none';
  const sbEl = document.querySelector('.sd');
  if (sbEl) sbEl.style.display = 'none';

  // 启动粒子动画
  if (window.ShinchanParticles && window.ShinchanParticles.init) {
    setTimeout(() => window.ShinchanParticles.init('three-container'), 100);
  }
}

function selectRole(role) {
  document.getElementById('roleUserBtn').classList.toggle('active', role === 'user');
  document.getElementById('roleAdminBtn').classList.toggle('active', role === 'admin');
  document.getElementById('regRole').value = role;
  document.getElementById('adminKeyWrap').style.display = role === 'admin' ? 'block' : 'none';
}

async function handleLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const err = document.getElementById('loginError');
  if (!user || !pass) { err.textContent = '请输入用户名和密码'; err.classList.add('show'); return; }
  try {
    const data = await apiLogin(user, pass);
    currentUser = { username: data.username, role: 'user' };
    saveSession(currentUser);
    loadCurrentUserData();
    document.querySelector('.header').style.display = '';
    return showAppAfterLogin();
  } catch(e) {
    const users = getUsers();
    if (users[user]) {
      if (users[user].password !== hashPW(pass)) { err.textContent = '密码错误'; err.classList.add('show'); return; }
      currentUser = { username: user, role: users[user].role };
      saveSession(currentUser); loadCurrentUserData();
      document.querySelector('.header').style.display = '';
      return showAppAfterLogin();
    }
    err.textContent = e.message || '登录失败'; err.classList.add('show');
  }
  const users = getUsers();
  if (!users[user]) { err.textContent = '用户不存在'; err.classList.add('show'); return; }
  if (users[user].password !== hashPW(pass)) { err.textContent = '密码错误'; err.classList.add('show'); return; }
  currentUser = { username: user, role: users[user].role };
  saveSession(currentUser);
  loadCurrentUserData();
  document.querySelector('.header').style.display = '';
  showAppAfterLogin();
}

async function handleRegister() {
  const user = document.getElementById('regUser').value.trim();
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  const captcha = document.getElementById('regCaptcha').value.trim().toUpperCase();
  const err = document.getElementById('regError');
  if (!user) { err.textContent = '请输入用户名'; err.classList.add('show'); return; }
  if (user.length < 2) { err.textContent = '用户名至少2个字符'; err.classList.add('show'); return; }
  if (pass.length < 8) { err.textContent = '密码至少8位'; err.classList.add('show'); return; }
  if (pass !== pass2) { err.textContent = '两次密码不一致'; err.classList.add('show'); return; }
  if (captcha !== currentCaptcha) { err.textContent = '验证码错误'; err.classList.add('show'); return; }
  try {
    await apiRegister(user, pass);
    err.className = 'auth-success';
    err.textContent = '✅ 注册成功！即将跳转登录...';
    return setTimeout(() => renderAuthPage('login'), 1200);
  } catch(e) { /* 云端任何错误都走本地 */ }
  const users = getUsers();
  if (users[user]) { err.textContent = '用户名已存在'; err.classList.add('show'); return; }
  users[user] = { password: hashPW(pass), role: 'user' };
  saveUsers(users);
  const all = getAllUserData();
  if (!all[user]) all[user] = { progress: {}, stats: { totalDays:0, completedDays:0, streak:0 }, vocab: { words: {} } };
  saveAllUserData(all);
  err.className = 'auth-success';
  err.textContent = '✅ 注册成功！即将跳转登录...';
  setTimeout(() => renderAuthPage('login'), 1200);
}

function loadCurrentUserData() {
  if (!currentUser) return;
  const data = getUserData(currentUser.username);
  state.progress = data.progress || {};
  state.stats = data.stats || { totalDays:0, completedDays:0, streak:0 };
  vocab = data.vocab || { words: {} };
  // Also set up old-format for backward compat with loadState/loadVocab
}

function showAppAfterLogin() {
  // 清理登录页粒子动画
  if (window.ShinchanParticles && window.ShinchanParticles.cleanup) {
    window.ShinchanParticles.cleanup();
  }
  document.body.style.background = '#f0f2f5';
  document.body.style.padding = '20px';
  document.body.style.margin = '';
  document.documentElement.style.margin = '';
  document.documentElement.style.padding = '';
  const mc = document.getElementById('mainCard');
  mc.style.background = '';
  mc.style.padding = '';
  mc.style.boxShadow = '';
  const c = document.querySelector('.container');
  if (c) { c.style.maxWidth = '780px'; c.style.padding = ''; c.style.margin = ''; }
  document.querySelector('.mode-toggle').style.display = '';
  document.querySelector('.bottom-panel').style.display = '';
  document.getElementById('analysisPanel').style.display = '';
  const nb = document.querySelector('.nav-bar');
  if (nb) nb.style.display = '';
  const hc = document.querySelector('.header');
  if (hc) {
    hc.style.display = '';
    // Add user badge
    const existing = document.querySelector('.user-badge');
    if (existing) existing.remove();
    const badge = document.createElement('span');
    badge.className = 'user-badge';
    badge.innerHTML = `👤 ${currentUser.username} ${currentUser.role === 'admin' ? '🔑' : ''} <a href="#" onclick="handleLogout();return false" style="color:rgba(255,255,255,0.6);font-size:0.75rem;margin-left:6px">退出</a>`;
    document.querySelector('.header-meta').appendChild(badge);
  }
  initAfterLogin();
}

function handleLogout() {
  if (state.progress && Object.keys(state.progress).length > 0) saveCurrentUserData();
  currentUser = null;
  saveSession(null);
  state = { progress: {}, stats: { totalDays:0, completedDays:0, streak:0 } };
  vocab = { words: {} };
  location.reload();
}

// ===== Date Helpers =====
function getToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function daysSinceStart(date) {
  return Math.floor((date.getTime() - START_DATE.getTime()) / (1000*60*60*24));
}

function getDayNumber() { return daysSinceStart(getToday()) + 1; }

// ===== Question Selection =====
function getModePool() {
  const f = QUESTION_BANK.filter(q => q.type === currentMode);
  return f.length ? f : QUESTION_BANK;
}

/** 从全部历史记录中收集某个模式已做过的题号 */
function getAllDoneIndices(mode) {
  const done = new Set();
  const today = formatDate(getToday());
  Object.entries(state.progress).forEach(([date, data]) => {
    if (date > today) return; // 不统计未来日期的预览
    if (!data.entries) return;
    data.entries.forEach(e => {
      if (e.mode === mode || !e.mode) done.add(e.qIndex);
    });
  });
  return done;
}

/** 仅今天做过的题号（用于 UI 显示「今日进度」） */
function getDoneIndicesToday() {
  const t = formatDate(getToday());
  const d = state.progress[t];
  if (!d || !d.entries) return new Set();
  return new Set(d.entries.map(e => e.qIndex));
}

function pickNextQuestion() {
  const pool = getModePool();
  const done = getAllDoneIndices(currentMode);
  // 找第一个没做过的题
  for (let i = 0; i < pool.length; i++) {
    if (!done.has(i)) {
      currentQuestionIndex = i;
      currentQuestion = {...pool[i], dayNum: getDayNumber()};
      return;
    }
  }
  // 全部做完了 → 重置从头开始
  currentQuestionIndex = 0;
  currentQuestion = {...pool[0], dayNum: getDayNumber()};
}

function getTodayQuestion() { pickNextQuestion(); }

// ===== Vocab System =====
function loadVocab() {
  // Data already loaded via loadCurrentUserData()
  if (!vocab || !vocab.words) vocab = { words: {} };
  // Fill missing Chinese translations from Analyzer's cnMap
  if (typeof Analyzer !== 'undefined' && Analyzer._cnMap) {
    let updated = false;
    Object.keys(vocab.words).forEach(key => {
      const w = vocab.words[key];
      if (!w.chinese && Analyzer._cnMap[key]) { w.chinese = Analyzer._cnMap[key]; updated = true; }
    });
    if (updated) saveVocab();
  }
}

function saveVocab() {
  if (currentUser) saveCurrentUserData();
  else localStorage.setItem(OLD_VOCAB_KEY, JSON.stringify(vocab));
}

function getVocabCount() {
  return Object.keys(vocab.words).length;
}

/**
 * 获取英文单词/句子中文翻译（MyMemory API）
 */
async function fetchChineseTranslation(text) {
  try {
    const resp = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`);
    if (!resp.ok) return '';
    const data = await resp.json();
    return data?.responseData?.translatedText || '';
  } catch (e) { return ''; }
}

function getDueVocabCount() {
  const today = formatDate(getToday());
  return Object.values(vocab.words).filter(w => !w.mastered && w.nextReview <= today).length;
}

function addVocabWord(word, chinese, pos, synonyms, source) {
  const key = word.toLowerCase().trim();
  if (vocab.words[key]) return false; // already exists
  vocab.words[key] = {
    word: key, chinese: chinese || '', pos: pos || '',
    synonyms: synonyms || [], source: source || '',
    dateAdded: formatDate(getToday()),
    reviews: [], nextReview: formatDate(getToday()),
    interval: 1, stage: 0, mastered: false
  };
  saveVocab();
  updateVocabUI();
  return true;
}

function removeVocabWord(word) {
  delete vocab.words[word.toLowerCase().trim()];
  saveVocab();
  updateVocabUI();
}

function recordReview(wordKey, remembered) {
  const w = vocab.words[wordKey];
  if (!w) return;
  w.reviews.push({ date: formatDate(getToday()), remembered });
  if (remembered) {
    w.stage = Math.min(w.stage + 1, 6);
    w.interval = Math.min(Math.pow(2, w.stage), 30);
  } else {
    w.stage = Math.max(0, w.stage - 2);
    w.interval = Math.max(1, Math.pow(2, w.stage));
  }
  if (w.stage >= 6 || w.interval >= 30) {
    w.mastered = true;
    w.nextReview = '9999-12-31';
  } else {
    w.nextReview = formatDate(addDays(getToday(), w.interval));
  }
  saveVocab();
  updateVocabUI();
}

function getDueWords() {
  const today = formatDate(getToday());
  // 有中文翻译且到复习周期的词
  return Object.values(vocab.words)
    .filter(w => !w.mastered && w.chinese && w.nextReview <= today)
    .sort((a, b) => (a.nextReview || '9999') < (b.nextReview || '9999') ? -1 : 1);
}

// ===== Review Mode (Chinese → English typing) =====
function startReview() {
  const due = getDueWords();
  if (due.length === 0) {
    reviewState = null;
    renderReview();
    return;
  }
  // Shuffle
  for (let i = due.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [due[i], due[j]] = [due[j], due[i]];
  }
  reviewState = { dueWords: due, wrongWords: [], currentIdx: 0, answered: false, lastCorrect: null };
  renderReview();
}

function renderReview() {
  const mc = document.getElementById('mainCard');
  const total = getVocabCount();
  const mastered = Object.values(vocab.words).filter(w => w.mastered).length;
  const remaining = Object.values(vocab.words).filter(w => !w.mastered).length;

  // Summary screen (no active words)
  if (!reviewState || (reviewState.dueWords.length === 0 && reviewState.wrongWords.length === 0)) {
    const msg = total === 0 ? '📭 生词夹为空。做翻译练习时点击踩分点的「+ Save」添加单词。'
      : remaining === 0 ? '✅ 全部掌握！🎉 继续做新练习来扩充生词夹吧。'
      : '📭 本轮复习已完成';
    mc.innerHTML = `<div class="review-summary">
      <h3>📖 复习</h3>
      <div class="rs-stat" style="font-size:1.1rem;margin:16px 0">${msg}</div>
      <div style="color:#888;font-size:0.9rem">总词数: <strong>${total}</strong> · 待复习: <strong style="color:#e67e22">${remaining}</strong> · 已掌握: <strong style="color:#27ae60">${mastered}</strong></div>
      ${remaining > 0 ? `<button class="btn btn-primary" style="margin-top:16px" onclick="startReview()">🔄 再来一轮</button>` : ''}
      <button class="btn btn-outline" style="margin-top:16px" onclick="switchToPractice()">← 返回练习</button>
    </div>`;
    return;
  }

  // If current round done, move wrong words to be the new round
  if (reviewState.currentIdx >= reviewState.dueWords.length && reviewState.wrongWords.length > 0) {
    reviewState.dueWords = [...reviewState.wrongWords];
    reviewState.wrongWords = [];
    reviewState.currentIdx = 0;
    reviewState.answered = false;
    // Re-shuffle
    for (let i = reviewState.dueWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [reviewState.dueWords[i], reviewState.dueWords[j]] = [reviewState.dueWords[j], reviewState.dueWords[i]];
    }
  }

  // All done (including retries)
  if (reviewState.currentIdx >= reviewState.dueWords.length) {
    const correctCount = total - remaining;
    mc.innerHTML = `<div class="review-summary">
      <h3>📖 复习完成 🎉</h3>
      <div class="rs-stat" style="color:#27ae60">全部拼写正确！</div>
      <div style="color:#888;font-size:0.9rem;margin-top:12px">总词数: <strong>${total}</strong> · 已掌握: <strong style="color:#27ae60">${mastered}</strong></div>
      <button class="btn btn-outline" style="margin-top:16px" onclick="switchToPractice()">← 返回练习</button>
    </div>`;
    reviewState = null;
    return;
  }

  const w = reviewState.dueWords[reviewState.currentIdx];
  const sessionTotal = reviewState.dueWords.length;
  const pos = reviewState.currentIdx + 1;

  const answered = reviewState.answered;
  const correct = reviewState.lastCorrect;

  mc.innerHTML = `<div class="review-area">
    <div class="review-progress">${pos} / ${sessionTotal}</div>
    <div class="review-word" style="font-size:1.3rem">${Analyzer._escapeHtml(w.chinese || '请输入对应的英文：' + w.word)}</div>
    ${answered ? `<div class="review-audio" style="margin-bottom:12px">
      <span class="kp-pos">${Analyzer._escapeHtml(w.pos)}</span>
      ${w.source ? `<span style="color:#888;font-size:0.8rem;margin-left:8px">📝 ${Analyzer._escapeHtml(w.source)}</span>` : ''}
    </div>` : ''}
    <div style="margin:16px 0">
      <input type="text" id="reviewInput" placeholder="输入英文翻译..." style="width:100%;padding:12px 16px;border:2px solid ${correct === true ? '#27ae60' : (correct === false ? '#e74c3c' : '#e0e0e0')};border-radius:10px;font-size:1.1rem;font-family:inherit;outline:none;transition:border-color 0.2s" ${answered ? 'disabled' : ''} autofocus>
    </div>
    ${answered ? `
      <div style="margin-bottom:12px">
        ${correct
          ? '<div style="color:#27ae60;font-weight:600">✅ 正确！</div>'
          : `<div style="color:#e74c3c;font-weight:600">❌ 正确答案: <strong>${Analyzer._escapeHtml(w.word)}</strong></div>
             ${w.synonyms && w.synonyms.length ? `<div style="color:#888;font-size:0.85rem">同义词: ${w.synonyms.map(s => `<span class="kp-syn-tag">${Analyzer._escapeHtml(s)}</span>`).join(' ')}</div>` : ''}`
        }
      </div>
      <button class="rev-btn rev-btn-answer" onclick="nextReviewWord()">${correct ? '下一词 →' : '下一词（稍后重试）→'}</button>
    ` : `
      <button class="rev-btn rev-btn-answer" onclick="checkReviewAnswer()" style="margin-right:8px">✅ 检查</button>
      <button class="rev-btn rev-btn-answer" onclick="skipReviewWord()" style="background:#888">⏭️ 跳过</button>
    `}
    <div style="margin-top:16px">
      <button class="btn btn-ghost" onclick="switchToPractice()">← 返回练习</button>
    </div>
  </div>`;

  if (!answered) {
    setTimeout(() => {
      const inp = document.getElementById('reviewInput');
      if (inp) { inp.focus(); inp.addEventListener('keydown', e => { if (e.key === 'Enter') checkReviewAnswer(); }); }
    }, 50);
  }
}

function checkReviewAnswer() {
  if (!reviewState || reviewState.answered) return;
  const inp = document.getElementById('reviewInput');
  if (!inp) return;
  const userAnswer = inp.value.trim().toLowerCase();
  if (!userAnswer) return;

  const w = reviewState.dueWords[reviewState.currentIdx];
  const target = w.word.toLowerCase();
  const allForms = [target, ...(w.synonyms || []).map(s => s.toLowerCase())];

  // Check if user's answer matches target word or any synonym
  const userWords = userAnswer.replace(/[.,!?;:]/g, '').split(/\s+/).filter(Boolean);
  const correct = allForms.some(form => {
    const formWords = form.split(/\s+/);
    return formWords.every(fw => userWords.includes(fw));
  });

  reviewState.answered = true;
  reviewState.lastCorrect = correct;

  if (correct) {
    recordReview(w.word, true);
  } else {
    // Add to retry queue
    reviewState.wrongWords.push(w);
  }

  renderReview();
}

function skipReviewWord() {
  if (!reviewState || reviewState.answered) return;
  reviewState.answered = true;
  reviewState.lastCorrect = false;
  const w = reviewState.dueWords[reviewState.currentIdx];
  reviewState.wrongWords.push(w);
  renderReview();
}

function nextReviewWord() {
  if (!reviewState) return;
  reviewState.currentIdx++;
  reviewState.answered = false;
  reviewState.lastCorrect = null;
  renderReview();
  updateVocabUI();
}

function switchToPractice() {
  const prev = currentMode;
  currentMode = 'sentence';
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === currentMode));
  cacheModeState(prev);
  restoreModeState('sentence');
}

// ===== Mode Toggle =====
function initModeToggle() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.mode === currentMode) return;
      const prevMode = currentMode;
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;

      if (currentMode === 'review') {
        // Cache the practice mode before switching to review
        cacheModeState(prevMode);
        startReview();
        return;
      }
      if (prevMode === 'review') {
        // Restore cached practice mode
        restoreModeState(currentMode);
        return;
      }
      // Switching between sentence/paragraph
      cacheModeState(prevMode);
      restoreModeState(currentMode);
    });
  });
}

function cacheModeState(mode) {
  if (mode === 'review') return;
  const mc = document.getElementById('mainCard');
  const ap = document.getElementById('analysisPanel');
  modeCache[mode] = {
    mainCardHTML: mc ? mc.innerHTML : null,
    analysisVisible: ap ? !ap.hidden : false,
    analysisHTML: ap ? ap.innerHTML : null,
    questionIndex: currentQuestionIndex,
    question: currentQuestion ? {...currentQuestion} : null,
    textareaValue: document.getElementById('translationInput') ? document.getElementById('translationInput').value : '',
    charCount: document.getElementById('charCount') ? document.getElementById('charCount').textContent : ''
  };
}

function restoreModeState(mode) {
  const cache = modeCache[mode];
  if (!cache || !cache.mainCardHTML) {
    // No cache — first time entering this mode
    document.getElementById('translationInput').disabled = false;
    document.getElementById('translationInput').value = '';
    document.getElementById('btnSubmit').disabled = false;
    clearAnalysis();
    getTodayQuestion();
    rebuildMainCard();
    renderHeader();
    renderQuestion();
    renderQuestionType();
    renderStats();
    updateCharCount();
    updateTodayProgress();
    const s = document.querySelector('.status-msg'); if (s) s.remove();
    return;
  }

  // Restore main card
  const mc = document.getElementById('mainCard');
  mc.innerHTML = cache.mainCardHTML;
  document.getElementById('analysisPanel').innerHTML = cache.analysisHTML || '';

  // Restore question state
  if (cache.question) {
    currentQuestion = cache.question;
    currentQuestionIndex = cache.questionIndex;
  }

  // Restore input
  const ta = document.getElementById('translationInput');
  if (ta) {
    ta.value = cache.textareaValue || '';
    ta.disabled = false;
  }
  const cc = document.getElementById('charCount');
  if (cc) cc.textContent = cache.charCount || '0 characters';

  // Restore analysis visibility
  const ap = document.getElementById('analysisPanel');
  if (ap) ap.hidden = !cache.analysisVisible;

  // Re-bind events
  if (document.getElementById('btnSubmit')) {
    document.getElementById('btnSubmit').addEventListener('click', handleSubmit);
    document.getElementById('btnShowAnswer').addEventListener('click', handleShowAnswer);
    document.getElementById('btnNextDay').addEventListener('click', handleNextDay);
    document.getElementById('btnHistory').addEventListener('click', openHistory);
    const inp = document.getElementById('translationInput');
    if (inp) {
      inp.addEventListener('input', updateCharCount);
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSubmit(); }
      });
    }
  }

  renderHeader();
  renderQuestion();
  renderQuestionType();
  renderStats();
  renderHistory();
  updateTodayProgress();
}

function rebuildMainCard() {
  const mc = document.getElementById('mainCard');
  const heading = currentMode === 'paragraph' ? '📄 Translate the following paragraph:' : '📝 Translate the following sentence:';
  mc.innerHTML = `
    <div class="question-section">
      <h2>${heading}</h2>
      <div class="source-sentence" id="sourceSentence">Loading...</div>
    </div>
    <div class="input-section">
      <label for="translationInput">✏️ Your answer:</label>
      <textarea id="translationInput" rows="3" placeholder="Type your English translation here..." autofocus></textarea>
      <div class="char-count" id="charCount">0 characters</div>
    </div>
    <div class="action-bar">
      <button class="btn btn-primary" id="btnSubmit">Submit</button>
      <button class="btn btn-outline" id="btnShowAnswer">Show Answer</button>
      <button class="btn btn-ghost" id="btnNextDay">Next Day →</button>
      <button class="btn btn-ghost" id="btnHistory">📜 History</button>
    </div>`;

  // Re-bind events
  document.getElementById('btnSubmit').addEventListener('click', handleSubmit);
  document.getElementById('btnShowAnswer').addEventListener('click', handleShowAnswer);
  document.getElementById('btnNextDay').addEventListener('click', handleNextDay);
  document.getElementById('btnHistory').addEventListener('click', openHistory);
  document.getElementById('translationInput').addEventListener('input', updateCharCount);
  document.getElementById('translationInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleSubmit(); }
  });
}

// ===== Persistence =====
function loadState() {
  // Data already loaded via loadCurrentUserData()
  // Just run the migration on progress format
  if (!state.progress) state.progress = {};
  try {
    let migrated = false;
    const dates = Object.keys(state.progress);
    for (let di = 0; di < dates.length; di++) {
      const date = dates[di];
      const day = state.progress[date];
      if (!day) continue;
      if (day.submitted !== undefined && !day.entries) {
        state.progress[date] = {
          completed: true, entries: [{
            qIndex: 0, userAnswer: day.userAnswer || '', scores: day.scores || null, mode: 'sentence'
          }]
        };
        migrated = true; continue;
      }
      if (!day.entries) {
        state.progress[date] = { completed: day.completed || false, entries: [] };
        migrated = true;
      }
    }
    if (migrated) saveState();
  } catch(e) { console.warn('Data migration error:', e); }
}

function saveState() {
  if (currentUser) saveCurrentUserData();
  else localStorage.setItem(OLD_STORAGE_KEY, JSON.stringify({ progress: state.progress, stats: state.stats }));
}

function getTotalTranslations() {
  let c = 0;
  Object.values(state.progress).forEach(d => { if (d.entries) c += d.entries.length; });
  return c;
}

function recalcStats() {
  const today = formatDate(getToday());
  const entries = Object.entries(state.progress);
  const completed = entries.filter(([d, p]) => p.completed && d <= today).length;
  let streak = 0;
  let cursor = new Date(getToday());
  while (true) {
    const key = formatDate(cursor);
    const e = state.progress[key];
    if (e && e.completed) { streak++; cursor.setDate(cursor.getDate() - 1); }
    else break;
  }
  state.stats = { totalDays: getDayNumber(), completedDays: completed, streak: streak };
}

function updateVocabUI() {
  const el = document.getElementById('statVocab');
  if (el) el.textContent = getVocabCount();
  const badge = document.getElementById('reviewBadge');
  if (!badge) return;
  const remaining = Object.values(vocab.words).filter(w => !w.mastered).length;
  if (remaining > 0) { badge.textContent = remaining; badge.hidden = false; }
  else { badge.hidden = true; }
}

// ===== Render =====
function renderHeader() {
  document.getElementById('dayBadge').textContent = `Day #${currentQuestion.dayNum}`;
  document.getElementById('dateDisplay').textContent = formatDate(getToday());
}

function renderQuestion() {
  const el = document.getElementById('sourceSentence');
  if (!el) return;
  el.textContent = currentQuestion.source;
  el.className = currentQuestion.type === 'paragraph' ? 'source-paragraph' : 'source-sentence';
}

function renderQuestionType() {
  const existing = document.querySelector('.type-badge');
  if (existing) existing.remove();
  const badge = document.createElement('span');
  badge.className = `type-badge ${currentQuestion.type}`;
  badge.textContent = currentQuestion.type === 'paragraph' ? 'PARAGRAPH' : 'SENTENCE';
  document.getElementById('dayBadge').after(badge);
}

function renderStats() {
  document.getElementById('statTotal').textContent = state.stats.totalDays;
  document.getElementById('statCompleted').textContent = state.stats.completedDays;
  document.getElementById('statStreak').textContent = state.stats.streak;
  updateVocabUI();
}

// ===== Confetti 🎊 =====
function triggerConfetti() {
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#4361ee','#f39c12','#27ae60','#e74c3c','#9c27b0','#f1c40f','#e67e22','#2ecc71'];
  const pieces = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height * -1,
    w: Math.random() * 10 + 5, h: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: Math.random() * 3 + 2, rot: Math.random() * 360,
    rotSpeed: Math.random() * 10 - 5, drift: Math.random() * 2 - 1
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed;
      p.x += p.drift;
      p.rot += p.rotSpeed;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < 120 && pieces.some(p => p.y < canvas.height + 20)) requestAnimationFrame(draw);
    else canvas.remove();
  }
  draw();
}

// ===== Bidirectional Word Hover =====
function buildWordMap() {
  const q = currentQuestion;
  if (!q || !q.keywords) return {};
  const map = {}; // engLower -> cn text
  q.keywords.forEach(kw => {
    const eng = kw.word.toLowerCase();
    const cn = Analyzer._cnMap[eng] || '';
    if (cn) map[eng] = cn;
  });
  return map;
}

function renderSourceWithBidirection(source, wordMap) {
  if (!source) return source;
  // For Chinese, wrap each keyword's Chinese translation in a span
  let html = source;
  Object.entries(wordMap).forEach(([eng, cn]) => {
    if (cn) {
      const re = new RegExp(cn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      html = html.replace(re, match => `<span class="source-word" data-eng="${eng}">${match}</span>`);
    }
  });
  return html;
}

function initBidirectionalHover() {
  document.querySelectorAll('.ref-word, .source-word').forEach(el => el.removeEventListener('mouseenter', handleWordHover));
  document.querySelectorAll('.ref-word, .source-word').forEach(el => el.removeEventListener('mouseleave', handleWordLeave));
  document.querySelectorAll('.ref-word').forEach(el => el.addEventListener('mouseenter', handleWordHover));
  document.querySelectorAll('.ref-word').forEach(el => el.addEventListener('mouseleave', handleWordLeave));
  document.querySelectorAll('.source-word').forEach(el => el.addEventListener('mouseenter', handleWordHover));
  document.querySelectorAll('.source-word').forEach(el => el.addEventListener('mouseleave', handleWordLeave));
}

function handleWordHover(e) {
  const el = e.currentTarget;
  const isSource = el.classList.contains('source-word');
  if (isSource) {
    el.classList.add('active');
    const eng = el.dataset.eng;
    if (eng) document.querySelectorAll(`.ref-word[data-eng="${eng}"]`).forEach(s => s.classList.add('active'));
  } else {
    el.classList.add('active');
    const eng = el.dataset.eng || el.textContent.toLowerCase().trim().replace(/[.,!?;:]/g, '');
    document.querySelectorAll(`.source-word[data-eng="${eng}"]`).forEach(s => s.classList.add('active'));
  }
}

function handleWordLeave(e) {
  document.querySelectorAll('.ref-word.active, .source-word.active').forEach(s => s.classList.remove('active'));
}

// ===== Ask AI =====
function renderAskAI(userAnswer, scores, q) {
  const container = document.getElementById('askAIContent');
  if (!container) return;
  const issues = scores.issues || [];
  const hasGrammarIssues = issues.length > 0;

  let questions = [];

  // Question 1: Word substitution
  if (q.keywords && q.keywords.length > 0) {
    const missed = q.keywords.filter(kw => {
      const words = userAnswer.toLowerCase().split(/\s+/);
      return !kw.word.toLowerCase().split(/\s+/).every(w => words.includes(w));
    });
    if (missed.length > 0) {
      const m = missed[0];
      questions.push({
        q: `可以用更简单的词代替 "${m.word}" 吗？`,
        a: `"${m.word}" 是这道题的踩分词。如果你想用更简单的表达，可以用：${m.synonyms.slice(0,3).join('、')}。但建议尽量掌握 "${m.word}"，它在六级写作中很实用。`
      });
    }
  }

  // Question 2: Grammar
  if (hasGrammarIssues) {
    const types = [...new Set(issues.map(i => i.type))];
    questions.push({
      q: `${types.slice(0,2).join('、')}问题怎么避免？`,
      a: `${types.slice(0,2).join('和')}是常见的翻译错误。建议：1) 写完后通读一遍检查主谓搭配；2) 注意时态一致性；3) 不确定的介词搭配查词典确认。平时多积累固定搭配。`
    });
  }

  // Question 3: Alternative structure
  if (q.alternatives && q.alternatives.length > 0) {
    questions.push({
      q: '这句话还能用什么句式表达？',
      a: `当然可以！这里提供了 ${q.alternatives.length} 种不同的译法：<br>${q.alternatives.map((a, i) => `${i+1}. ${a}`).join('<br>')}`
    });
  }

  // Question 4: General improvement
  questions.push({
    q: '我的翻译整体怎么样？怎么提高？',
    a: `你的综合评分是 ${scores.overall}/5.0。${scores.meaning.score < 4 ? '意思表达方面还有提升空间，建议先确保核心信息不漏译。' : '意思表达不错！'}${scores.vocabulary.score < 4 ? '词汇方面可以多积累同义替换。' : '词汇使用得当。'}${scores.grammar.score < 4 ? '语法上注意检查时态和搭配。' : '语法基本没问题。'}坚持每天练一题，进步会很快！`
  });

  container.innerHTML = questions.map((qi, i) => `
    <button class="ai-q-btn" onclick="toggleAIAnswer(${i})">💡 ${qi.q}</button>
    <div class="ai-answer" id="aiAns${i}">${qi.a}</div>
  `).join('');
}

function toggleAIAnswer(idx) {
  const el = document.getElementById('aiAns' + idx);
  if (el) el.classList.toggle('open');
}

// ===== Heatmap =====
function renderHeatmap() {
  const container = document.getElementById('heatmapContainer');
  const totalEl = document.getElementById('heatmapTotal');
  if (!container) return;
  const today = getToday();
  let totalPractices = 0;
  let html = '';
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = formatDate(d);
    const dayData = state.progress[key];
    const count = dayData && dayData.entries ? dayData.entries.length : 0;
    totalPractices += count;
    let level = 0;
    if (count >= 5) level = 4;
    else if (count >= 3) level = 3;
    else if (count >= 1) level = 2;
    else if (count > 0) level = 1;
    const tip = `${key}: ${count} 次练习`;
    html += `<div class="heatmap-cell" data-level="${level}" data-tip="${tip}"></div>`;
  }
  container.innerHTML = html;
  if (totalEl) totalEl.textContent = totalPractices + ' practices';
}

function clearAnalysis() {
  const panel = document.getElementById('analysisPanel');
  if (!panel) return;
  panel.hidden = true;
  ['userAnswerDisplay','referenceDisplay','grammarContent','vocabContent','alternativesContent','diffContent','scoreContent','grammarIssuesContent','feedbackContent','keyPointsContent','askAIContent']
    .forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
  // Hide score summary (regular div), close collapsible sections
  document.getElementById('sectionScore').hidden = true;
  document.querySelectorAll('.collapse-section').forEach(el => el.removeAttribute('open'));
}

function renderAnalysis(userAnswer) {
  const q = currentQuestion;
  document.getElementById('analysisPanel').hidden = false;

  // Score (always visible)
  const scores = Analyzer.scoreTranslation(userAnswer, q.reference, q.keywords, q.alternatives);
  document.getElementById('scoreContent').innerHTML = Analyzer.renderScores(scores);
  document.getElementById('sectionScore').hidden = false;

  // Answer comparison (collapsible via <details>)
  document.getElementById('userAnswerDisplay').innerHTML = Analyzer.renderInlineCorrection(userAnswer, q.reference, q.keywords);
  const explainEl = document.getElementById('userAnswerExplain');
  if (explainEl) {
    const diff = Analyzer.wordDiff(userAnswer, q.reference, q.keywords);
    explainEl.innerHTML = Analyzer.explainErrors(diff, userAnswer, q.reference);
  }
  document.getElementById('referenceDisplay').innerHTML = makeClickableReference(q.reference, q.source);

  // Feedback
  const feedback = Analyzer.generateFeedback(scores, q.keywords, userAnswer, q.reference);
  document.getElementById('feedbackContent').innerHTML = Analyzer.renderFeedback(feedback);

  // Key Points (grouped into words + phrases)
  const keyPoints = Analyzer.extractKeyPoints(q.source, q.reference, q.keywords);
  const checkedPoints = Analyzer.checkKeyPoints(userAnswer, keyPoints, q.keywords);
  // Add Save buttons to each checked item
  const addSaveBtns = (items) => {
    if (!items) return items;
    items.forEach(kp => {
      kp._saveBtn = ((kp) => {
        const isSaved = vocab.words[kp.english.toLowerCase().trim()];
        const escW = Analyzer._escapeHtml(kp.english).replace(/'/g, "\\'");
        return `<button class="kp-save-btn ${isSaved ? 'saved' : ''}" data-word="${escW}" onclick="toggleVocabWord('${escW}', '${Analyzer._escapeHtml(kp.chinese).replace(/'/g, "\\'")}', '${kp.pos}', '${kp.synonyms.map(s => Analyzer._escapeHtml(s)).join('||').replace(/'/g, "\\'")}', '${Analyzer._escapeHtml(q.source).replace(/'/g, "\\'")}')">${isSaved ? '✅ Saved' : '+ Save'}</button>`;
      })(kp);
    });
    return items;
  };
  if (checkedPoints.words) addSaveBtns(checkedPoints.words);
  if (checkedPoints.phrases) addSaveBtns(checkedPoints.phrases);

  // Use renderKeyPoints which now accepts { words, phrases }
  document.getElementById('keyPointsContent').innerHTML = Analyzer.renderKeyPoints(checkedPoints, userAnswer);

  // Word diff
  const diff = Analyzer.wordDiff(userAnswer, q.reference, q.keywords);
  document.getElementById('diffContent').innerHTML = Analyzer.renderDiff(diff);

  // Grammar
  document.getElementById('grammarIssuesContent').innerHTML = Analyzer.renderGrammarIssues(scores.issues);
  document.getElementById('grammarContent').textContent = q.grammar || '暂无语法笔记。';

  // Vocab tips
  const vocabDiv = document.getElementById('vocabContent');
  vocabDiv.innerHTML = '';
  if (q.keywords && q.keywords.length) {
    const analysis = Analyzer.analyzeVocabulary(userAnswer, q.keywords);
    analysis.forEach(kw => {
      const div = document.createElement('div');
      div.className = 'vocab-item';
      div.innerHTML = `<div class="vocab-word">${kw.word} <span class="status-${kw.statusClass}" style="font-size:0.8rem;font-weight:400">${kw.status}</span></div>
        <div class="vocab-synonyms">同义词: ${kw.synonyms.map(s => `<span>${s}</span>`).join(' ')}</div>
        <div class="vocab-note">${kw.note}</div>`;
      vocabDiv.appendChild(div);
    });
  }

  // Alternatives
  const altDiv = document.getElementById('alternativesContent');
  altDiv.innerHTML = '';
  if (q.alternatives && q.alternatives.length) {
    q.alternatives.forEach(alt => {
      const div = document.createElement('div');
      div.className = 'alternative-item';
      div.textContent = alt;
      altDiv.appendChild(div);
    });
  } else {
    altDiv.innerHTML = '<p style="color:#999">暂无其他表达方式。</p>';
  }

  // --- New features integration ---

  // 1. Source sentence with bidirectional word spans
  const wordMap = buildWordMap();
  const sourceEl = document.getElementById('sourceSentence');
  if (sourceEl) {
    const original = q.source;
    sourceEl.innerHTML = renderSourceWithBidirection(original, wordMap);
    sourceEl.className = q.type === 'paragraph' ? 'source-paragraph' : 'source-sentence';
  }

  // 2. Init bidirectional hover
  initBidirectionalHover();

  // 3. Confetti on high scores
  if (scores.overall >= 4.5) triggerConfetti();
  if (checkedPoints.words && checkedPoints.words.some(kp => kp.statusClass === 'kp-synonym')) triggerConfetti();

  // 4. Ask AI
  renderAskAI(userAnswer, scores, q);

  // 5. Heatmap
  renderHeatmap();
  renderLeaderboard();
}

function makeClickableReference(reference, sourceSentence) {
  if (!reference) return '';
  const words = reference.replace(/([.,!?;:])/g, ' $1 ').split(/\s+/).filter(Boolean);
  return words.map(w => {
    if (/^[.,!?;:]+$/.test(w)) return w;
    const clean = w.replace(/[.,!?;:]/g, '').toLowerCase().trim();
    if (!clean) return w;
    const isAlready = !!vocab.words[clean];
    const cn = (typeof Analyzer !== 'undefined' && Analyzer._cnMap) ? (Analyzer._cnMap[clean] || '') : '';
    const escW = Analyzer._escapeHtml(clean).replace(/'/g, "\\'");
    return `<span class="ref-word ${isAlready ? 'ref-saved' : ''}" data-eng="${escW}" onclick="clickRefWord('${escW}')" title="${cn ? '📖 '+cn : '点击加入生词夹'}">${Analyzer._escapeHtml(w)}</span>`;
  }).join(' ');
}

function clickRefWord(word) {
  const cn = (typeof Analyzer !== 'undefined' && Analyzer._cnMap) ? (Analyzer._cnMap[word] || '') : '';
  const pos = (typeof Analyzer !== 'undefined') ? Analyzer._detectPOS(word) : '';
  const key = word.toLowerCase().trim();
  if (vocab.words[key]) {
    removeVocabWord(key);
  } else {
    addVocabWord(word, cn, pos, [], '');
    // 没有中文翻译？自动去获取
    if (!cn) {
      fetchChineseTranslation(word).then(translation => {
        if (translation && vocab.words[key]) {
          vocab.words[key].chinese = translation;
          saveVocab();
        }
      });
    }
  }
  // Refresh all reference word styles
  document.querySelectorAll('.ref-word').forEach(el => {
    const elWord = el.textContent.toLowerCase().trim().replace(/[.,!?;:]/g, '');
    if (vocab.words[elWord]) el.classList.add('ref-saved');
    else el.classList.remove('ref-saved');
  });
  updateVocabUI();
}

function toggleVocabWord(word, chinese, pos, synStr, source) {
  const syns = synStr ? synStr.split('||').filter(Boolean) : [];
  const key = word.toLowerCase().trim();
  if (vocab.words[key]) {
    removeVocabWord(key);
  } else {
    addVocabWord(word, chinese, pos, syns, source);
  }
  // Refresh just the button state
  const btns = document.querySelectorAll('.kp-save-btn');
  btns.forEach(btn => {
    const btnWord = btn.getAttribute('data-word');
    if (btnWord) {
      const isNowSaved = !!vocab.words[btnWord.toLowerCase().trim()];
      btn.textContent = isNowSaved ? '✅ Saved' : '+ Save';
      btn.classList.toggle('saved', isNowSaved);
    }
  });
  updateVocabUI();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  const today = formatDate(getToday());
  const entries = Object.entries(state.progress).filter(([d]) => d <= today).sort(([a],[b]) => b.localeCompare(a));
  if (!entries.length) { list.innerHTML = '<p class="empty-hint">No records yet. Start practicing!</p>'; return; }
  list.innerHTML = '';
  entries.forEach(([date, data]) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    const count = data.entries ? data.entries.length : 0;
    const last = data.entries && data.entries.length > 0 ? data.entries[data.entries.length-1].userAnswer : '';
    const preview = last ? (last.length > 60 ? last.slice(0,60)+'...' : last) : '(no answer)';
    item.innerHTML = `<div class="history-date">✅ ${date} — ${count} practice${count!==1?'es':''}</div><div class="history-translation">Last: ${preview}</div>`;
    list.appendChild(item);
  });
}

function renderStatus(message, type) {
  const existing = document.querySelector('.status-msg');
  if (existing) existing.remove();
  const msg = document.createElement('div');
  msg.className = `status-msg status-${type}`;
  msg.textContent = message;
  const is = document.querySelector('.input-section');
  if (is) is.before(msg);
}

function updateCharCount() {
  const t = document.getElementById('translationInput');
  if (!t) return;
  const c = t.value.length;
  document.getElementById('charCount').textContent = `${c} character${c!==1?'s':''}`;
}

function updateTodayProgress() {
  const done = getDoneIndicesToday();
  const pool = getModePool();
  const existing = document.querySelector('.today-status');
  if (existing) existing.remove();
  if (done.size > 0) {
    const s = document.createElement('div');
    s.className = 'today-status';
    s.style.cssText = 'text-align:right;font-size:0.8rem;color:#999;margin-bottom:12px';
    s.textContent = `Today: ${done.size}/${pool.length} ${currentMode}s completed`;
    document.querySelector('.question-section').appendChild(s);
  }
}

function enableInputs() {
  const t = document.getElementById('translationInput');
  if (t) t.disabled = false;
  const b = document.getElementById('btnSubmit');
  if (b) b.disabled = false;
}

// ===== Handlers =====
function handleSubmit() {
  const textarea = document.getElementById('translationInput');
  if (!textarea) return;
  const answer = textarea.value.trim();
  if (!answer) { renderStatus('请先输入翻译内容再提交。', 'skip'); return; }

  const today = formatDate(getToday());
  if (!state.progress[today] || !state.progress[today].entries) {
    state.progress[today] = { completed: true, entries: [] };
  }

  const scores = Analyzer.scoreTranslation(answer, currentQuestion.reference, currentQuestion.keywords, currentQuestion.alternatives);
  const feedback = Analyzer.generateFeedback(scores, currentQuestion.keywords, answer, currentQuestion.reference);
  state.progress[today].entries.push({
    qIndex: currentQuestionIndex, userAnswer: answer, scores: scores, mode: currentMode,
    source: currentQuestion.source, reference: currentQuestion.reference,
    feedback: feedback, keywords: currentQuestion.keywords || []
  });
  state.progress[today].completed = true;
  recalcStats(); saveState();
  if (currentUser) apiSyncTotal(currentUser.username, getTotalTranslations());

  renderAnalysis(answer);
  renderStats(); renderHistory(); updateTodayProgress();
  renderStatus('✅ 已提交！可继续修改后重新提交，或做下一题。', 'success');

  // Keep textarea editable for rephrase
  textarea.disabled = false;

  // Add "Rephrase" + "Try Another" buttons
  const bar = document.querySelector('.action-bar');
  if (!document.getElementById('btnRephrase')) {
    const rb = document.createElement('button');
    rb.id = 'btnRephrase'; rb.className = 'btn btn-rephrase';
    rb.textContent = '✏️ 重写提交';
    rb.addEventListener('click', () => {
      const newAns = textarea.value.trim();
      if (!newAns) { renderStatus('请修改后再提交。', 'skip'); return; }
      // Update the last entry (rephrase)
      const today = formatDate(getToday());
      const entries = state.progress[today].entries;
      if (entries && entries.length > 0) {
        const newScores = Analyzer.scoreTranslation(newAns, currentQuestion.reference, currentQuestion.keywords, currentQuestion.alternatives);
        const newFeedback = Analyzer.generateFeedback(newScores, currentQuestion.keywords, newAns, currentQuestion.reference);
        entries[entries.length - 1] = {
          qIndex: currentQuestionIndex, userAnswer: newAns, scores: newScores, mode: currentMode,
          source: currentQuestion.source, reference: currentQuestion.reference,
          feedback: newFeedback, keywords: currentQuestion.keywords || []
        };
        saveState();
        recalcStats();
      }
      renderAnalysis(newAns);
      renderStats(); renderHistory();
      renderStatus('✅ 已更新！看看分数有没有提高。', 'success');
      document.querySelectorAll('.status-msg').forEach(el => el.remove());
      textarea.focus();
    });
    bar.appendChild(rb);
  }

  if (!document.getElementById('btnTryAnother')) {
    const btn = document.createElement('button');
    btn.id = 'btnTryAnother';
    btn.className = 'btn btn-primary';
    btn.textContent = '🎯 Try Another';
    btn.addEventListener('click', () => {
      const m = document.querySelector('.status-msg'); if (m) m.remove();
      clearAnalysis();
      textarea.value = ''; enableInputs();
      pickNextQuestion();
      renderHeader(); renderQuestion(); renderQuestionType();
      updateCharCount(); updateTodayProgress();
      textarea.focus();
      ['btnTryAnother','btnRephrase','btnBackToday'].forEach(id => {
        const el = document.getElementById(id); if (el) el.remove();
      });
    });
    bar.appendChild(btn);
  }
}

function handleShowAnswer() {
  const today = formatDate(getToday());
  if (!state.progress[today] || !state.progress[today].entries) {
    state.progress[today] = { completed: true, entries: [] };
  }
  const textarea = document.getElementById('translationInput');
  if (!textarea) return;
  const existingAnswer = textarea.value.trim();

  state.progress[today].entries.push({
    qIndex: currentQuestionIndex, userAnswer: existingAnswer || '(skipped)',
    scores: null, mode: currentMode, skipped: true,
    source: currentQuestion.source, reference: currentQuestion.reference,
    feedback: '', keywords: currentQuestion.keywords || []
  });
  state.progress[today].completed = true;
  recalcStats(); saveState();

  document.getElementById('analysisPanel').hidden = false;
  document.getElementById('referenceDisplay').innerHTML = makeClickableReference(currentQuestion.reference, currentQuestion.source);
  document.getElementById('userAnswerExplain').innerHTML = '';
  document.getElementById('userAnswerDisplay').innerHTML = currentQuestion.keywords
    ? Analyzer.renderInlineCorrection(existingAnswer || '(skipped)', currentQuestion.reference, currentQuestion.keywords)
    : `<span>${existingAnswer || '(skipped)'}</span>`;
  document.getElementById('grammarContent').textContent = currentQuestion.grammar || '';
  // Vocab
  const vocabDiv = document.getElementById('vocabContent');
  vocabDiv.innerHTML = '';
  if (currentQuestion.keywords) {
    currentQuestion.keywords.forEach(kw => {
      const div = document.createElement('div');
      div.className = 'vocab-item';
      div.innerHTML = `<div class="vocab-word">${kw.word}</div><div class="vocab-synonyms">Synonyms: ${kw.synonyms.map(s=>`<span>${s}</span>`).join(' ')}</div><div class="vocab-note">${kw.note}</div>`;
      vocabDiv.appendChild(div);
    });
  }
  const altDiv = document.getElementById('alternativesContent');
  altDiv.innerHTML = '';
  if (currentQuestion.alternatives) {
    currentQuestion.alternatives.forEach(alt => { const d = document.createElement('div'); d.className='alternative-item'; d.textContent=alt; altDiv.appendChild(d); });
  }

  // Source with bidirectional words
  const wm = buildWordMap();
  const se = document.getElementById('sourceSentence');
  if (se) { se.innerHTML = renderSourceWithBidirection(currentQuestion.source, wm); se.className = currentQuestion.type === 'paragraph' ? 'source-paragraph' : 'source-sentence'; }
  initBidirectionalHover();
  renderHeatmap();
  renderLeaderboard();

  renderStats(); renderHistory(); updateTodayProgress();
  renderStatus('⏭️ 参考答案已展示。准备好后可以继续练习。', 'skip');

  if (!document.getElementById('btnTryAnother')) {
    const btn = document.createElement('button');
    btn.id = 'btnTryAnother'; btn.className = 'btn btn-primary';
    btn.textContent = '🎯 Try Another';
    btn.addEventListener('click', () => {
      const m = document.querySelector('.status-msg'); if (m) m.remove();
      clearAnalysis(); textarea.value = ''; enableInputs();
      pickNextQuestion();
      renderHeader(); renderQuestion(); renderQuestionType();
      updateCharCount(); updateTodayProgress();
      textarea.focus(); btn.remove();
    });
    document.querySelector('.action-bar').appendChild(btn);
  }
}

function handleNextDay() {
  const tomorrow = addDays(getToday(), 1);
  const tomorrowDay = daysSinceStart(tomorrow) + 1;
  const pool = getModePool();
  const idx = (tomorrowDay - 1) % pool.length;
  const nextQ = {...pool[idx], dayNum: tomorrowDay};
  const originalQ = currentQuestion;
  const originalIdx = currentQuestionIndex;
  currentQuestion = nextQ; currentQuestionIndex = idx;

  const textarea = document.getElementById('translationInput');
  const btnSubmit = document.getElementById('btnSubmit');
  if (!textarea || !btnSubmit) return;
  document.getElementById('sourceSentence').textContent = nextQ.source;
  document.getElementById('sourceSentence').className = nextQ.type === 'paragraph' ? 'source-paragraph' : 'source-sentence';
  document.getElementById('dayBadge').textContent = `Day #${nextQ.dayNum} (Preview)`;
  document.getElementById('dateDisplay').textContent = `Tomorrow — ${formatDate(tomorrow)}`;
  const badge = document.querySelector('.type-badge');
  if (badge) badge.textContent = nextQ.type === 'paragraph' ? 'PARAGRAPH' : 'SENTENCE';
  textarea.value = ''; textarea.disabled = true; btnSubmit.disabled = true;
  clearAnalysis();
  renderStatus('🔮 明日题目的预览。', 'skip');

  if (!document.getElementById('btnBackToday')) {
    const backBtn = document.createElement('button');
    backBtn.id = 'btnBackToday'; backBtn.className = 'btn btn-outline';
    backBtn.textContent = '← Back to Today';
    backBtn.addEventListener('click', () => {
      currentQuestion = originalQ; currentQuestionIndex = originalIdx;
      const tb = document.getElementById('btnTryAnother'); if (tb) tb.remove();
      renderQuestion();
      document.getElementById('dayBadge').textContent = `Day #${originalQ.dayNum}`;
      document.getElementById('dateDisplay').textContent = formatDate(getToday());
      if (badge) badge.textContent = originalQ.type === 'paragraph' ? 'PARAGRAPH' : 'SENTENCE';
      backBtn.remove(); clearAnalysis();
      const m = document.querySelector('.status-msg'); if (m) m.remove();
      textarea.disabled = false; textarea.value = ''; btnSubmit.disabled = false;
      textarea.focus(); updateCharCount(); updateTodayProgress();
    });
    document.querySelector('.action-bar').appendChild(backBtn);
  }
}

// ===== History Modal =====
function openHistory() {
  document.getElementById('historyModal').classList.add('visible');
  try { renderHistoryModal(); }
  catch(e) { console.error('History error:', e);
    document.getElementById('historyModalBody').innerHTML = '<div class="history-empty">⚠️ 加载历史记录时出错，请刷新后重试。</div>'; }
}

function closeHistory() {
  document.getElementById('historyModal').classList.remove('visible');
}

function safeScore(entry, field, fallback) {
  if (!entry || !entry.scores) return fallback;
  if (entry.scores.overall === undefined && entry.scores.accuracy) {
    // Legacy format: { accuracy: {score}, grammar: {score}, vocabulary: {score} }
    const map = { meaning: 'accuracy', vocabulary: 'vocabulary' };
    return entry.scores[map[field]] ? entry.scores[map[field]].score : fallback;
  }
  return entry.scores[field] !== undefined ? entry.scores[field].score : fallback;
}

function renderHistoryModal() {
  const body = document.getElementById('historyModalBody');
  const allDays = Object.entries(state.progress).filter(([d]) => d <= formatDate(getToday())).sort(([a],[b]) => b.localeCompare(a));
  if (!allDays.length) { body.innerHTML = '<div class="history-empty">📭 还没有练习记录。</div>'; return; }

  let totalPractices = 0, totalScore = 0, scoredCount = 0;
  allDays.forEach(([d, data]) => {
    if (data.entries) data.entries.forEach(e => {
      totalPractices++;
      const overall = safeScore(e, 'overall', null);
      if (overall !== null) { totalScore += overall; scoredCount++; }
    });
  });
  const avgScore = scoredCount ? (totalScore/scoredCount).toFixed(1) : '—';

  let html = `<div class="history-summary-bar">
    <div class="history-summary-item"><div class="hsi-value">${totalPractices}</div><div class="hsi-label">练习次数</div></div>
    <div class="history-summary-item"><div class="hsi-value">${allDays.filter(([d,data])=>data.completed).length}</div><div class="hsi-label">练习天数</div></div>
    <div class="history-summary-item"><div class="hsi-value">${avgScore}</div><div class="hsi-label">平均分</div></div>
    <div class="history-summary-item"><div class="hsi-value">📖 ${getVocabCount()}</div><div class="hsi-label">生词</div></div>
  </div>`;

  allDays.forEach(([date, data]) => {
    const entries = data.entries || [];
    const scores = entries.map(e => safeScore(e, 'overall', null)).filter(s => s !== null);
    const dayAvgD = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1) : '—';
    html += `<div class="history-day"><div class="history-day-header"><span class="history-day-date">📅 ${date}</span><span class="history-day-stats">${entries.length} 次 · ⭐ ${dayAvgD}</span></div>`;
    entries.forEach((entry, ei) => {
      const isSkipped = entry.skipped || !entry.userAnswer || entry.userAnswer === '(skipped)';
      const preview = entry.userAnswer ? (entry.userAnswer.length > 80 ? entry.userAnswer.slice(0,80)+'...' : entry.userAnswer) : '(skipped)';
      const overall = safeScore(entry, 'overall', null);
      const scoreDisplay = overall !== null ? `⭐ ${overall}` : '⏭️';
      const meaningS = safeScore(entry, 'meaning', null);
      const vocabS = safeScore(entry, 'vocabulary', null);
      const gramS = safeScore(entry, 'grammar', null);
      const issueCount = entry.scores && entry.scores.issues ? entry.scores.issues.length : null;
      const src = entry.source ? Analyzer._escapeHtml(entry.source) : '';
      const ref = entry.reference ? Analyzer._escapeHtml(entry.reference) : '';
      const fb = entry.feedback || '';
      const kws = entry.keywords || [];
      const synHtml = kws.length > 0 ? kws.map(kw =>
        `<div style="margin:3px 0;font-size:0.85rem"><strong>${Analyzer._escapeHtml(kw.word)}</strong> → ${kw.synonyms.map(s => `<span class="kp-syn-tag">${Analyzer._escapeHtml(s)}</span>`).join(' ')}${kw.note ? `<span style="color:#888;margin-left:6px">${Analyzer._escapeHtml(kw.note)}</span>` : ''}</div>`
      ).join('') : '';
      html += `<div class="history-entry ${isSkipped?'skipped':''}" style="cursor:default">
        <div class="history-entry-header"><span>#${entry.qIndex+1} · ${entry.mode||'sentence'}</span><span class="history-entry-score">${scoreDisplay}</span></div>
        <div style="margin-top:8px">
          ${src ? `<div style="margin-bottom:5px"><span style="color:#888;font-size:0.8rem">🀄 原文:</span><br><span style="font-size:0.9rem">${src}</span></div>` : ''}
          ${ref ? `<div style="margin-bottom:5px"><span style="color:#888;font-size:0.8rem">📖 参考:</span><br><span style="font-size:0.9rem;color:#4361ee">${ref}</span></div>` : ''}
          ${entry.userAnswer && entry.userAnswer !== '(skipped)' ? `<div style="margin-bottom:5px"><span style="color:#888;font-size:0.8rem">✏️ 你:</span><br><span style="font-size:0.9rem">${Analyzer._escapeHtml(entry.userAnswer)}</span></div>` : ''}
          ${overall !== null ? `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;padding-top:6px;border-top:1px solid #eee"><span>🎯 意义: ${meaningS}/5</span><span>📖 词汇: ${vocabS}/5</span><span>🔧 语法: ${gramS}/5</span></div>
            ${issueCount !== null ? (issueCount > 0 ? `<div style="color:#e74c3c;font-size:0.85rem">⚠️ ${issueCount} 个语法问题</div>` : '<div style="color:#27ae60;font-size:0.85rem">✅ 语法没问题</div>') : ''}`
          : '<div style="color:#e67e22;margin-top:4px">📖 查看答案</div>'}
          ${synHtml ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #eee"><span style="color:#888;font-size:0.8rem">💡 同义词:</span><br>${synHtml}</div>` : ''}
          ${fb ? `<details style="margin-top:6px;padding-top:6px;border-top:1px solid #eee;font-size:0.85rem"><summary style="cursor:pointer;color:#888">👩‍🏫 查看评语</summary><div style="margin-top:6px;color:#555;line-height:1.6">${Analyzer.renderFeedback(fb)}</div></details>` : ''}
        </div>
      </div>`;
    });
    html += '</div>';
  });
  body.innerHTML = html;
}

function toggleHistoryEntry(el) {
  const d = el.querySelector('.history-entry-detail');
  if (d) d.classList.toggle('open');
}

// ===== Init =====
function initAfterLogin() {
  // Rebuild main card (login form replaced the HTML)
  rebuildMainCard();
  loadState();
  loadVocab();
  initModeToggle();

  getTodayQuestion();
  renderHeader();
  renderQuestion();
  renderQuestionType();
  renderStats();
  renderHistory();
  renderHeatmap();
  renderLeaderboard();
  clearAnalysis();
  updateCharCount();
  updateTodayProgress();

  // Global listeners (not element-specific)
  document.getElementById('historyClose').addEventListener('click', closeHistory);
  document.getElementById('historyScrim').addEventListener('click', closeHistory);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('historyModal').classList.contains('visible')) closeHistory();
  });
}

function init() {
  // Try migration first
  migrateOldData();

  // Check existing session
  const session = getSession();
  if (session) {
    currentUser = session;
    loadCurrentUserData();
    showAppAfterLogin();
    return;
  }

  // Show auth page
  const mt = document.querySelector('.mode-toggle');
  const bp = document.querySelector('.bottom-panel');
  const nb = document.querySelector('.nav-bar');
  if (nb) nb.style.display = 'none';
  const sd2 = document.querySelector('.sd');
  const sbEl = document.querySelector('.sd');
  if (sbEl) sbEl.style.display = 'none';
  if (bp) bp.style.display = 'none';
  if (nb) nb.style.display = 'none';
  if (sbEl) sbEl.style.display = 'none';
  renderAuthPage('login');
}

// Safe boot
const _origSubmit = handleSubmit; handleSubmit = function() { try { _origSubmit.apply(this, arguments); } catch(e) { console.error('Submit error:', e); renderStatus('❌ '+e.message, 'skip'); }};
const _origShowAnswer = handleShowAnswer; handleShowAnswer = function() { try { _origShowAnswer.apply(this, arguments); } catch(e) { console.error('ShowAnswer error:', e); renderStatus('❌ '+e.message, 'skip'); }};

function safeInit() {
  try { init(); }
  catch (e) {
    console.error('Init error:', e);
    document.body.innerHTML = `<div style="padding:20px;max-width:780px;margin:0 auto;font-family:sans-serif"><h2 style="color:#e74c3c">⚠️ 加载失败</h2><pre style="background:#f8f9fc;padding:16px;border-radius:8px;margin-top:12px;overflow:auto">${e.stack || e.message || e}</pre></div>`;
  }
}

window.addEventListener('error', e => {
  console.error('Runtime error:', e.error || e.message);
  const m = document.querySelector('.status-msg'); if (m) m.remove();
  const msg = document.createElement('div');
  msg.className = 'status-msg status-skip';
  msg.textContent = '⚠️ 错误: ' + (e.error ? e.error.message : e.message);
  const is = document.querySelector('.input-section');
  if (is) is.before(msg);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeInit);
} else { safeInit(); }
