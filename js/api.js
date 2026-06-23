// ===== 云端 API 连接层 =====
const API_BASE = 'https://backend-production-80b8b.up.railway.app/api';

// ---- 登录 / 注册 ----
async function apiLogin(username, password) {
  const r = await fetch(API_BASE + '/auth/login', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ username, password })
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || '登录失败');
  return d;
}

async function apiRegister(username, password) {
  const r = await fetch(API_BASE + '/auth/register', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ username, password })
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || '注册失败');
  return d;
}

// ---- 数据下载（登录时调用，合并到本地，不覆盖） ----
async function apiDownload(username) {
  try {
    const r = await fetch(API_BASE + '/public/export/' + encodeURIComponent(username));
    if (!r.ok) return;
    const data = await r.json();
    if (!data || !data.progress) return;
    const all = getAllUserData();
    const local = all[username] || { progress: {}, stats: {}, vocab: { words: {} } };
    // 合并：云端有且本地没有的才写入，本地有的保留
    const merged = {
      progress: { ...data.progress, ...local.progress },
      stats: local.stats.totalDays ? local.stats : (data.stats ? {
        totalDays: data.stats.total_days || 0,
        completedDays: data.stats.completed_days || 0,
        streak: data.stats.streak || 0
      } : { totalDays:0, completedDays:0, streak:0 }),
      vocab: local.vocab?.words && Object.keys(local.vocab.words).length
        ? local.vocab
        : (data.vocab || { words: {} })
    };
    all[username] = merged;
    saveAllUserData(all);
  } catch(e) { /* 静默失败，不影响本地登录 */ }
}

// ---- 数据上传 ----
async function apiSyncTotal(username, total) {
  try {
    await fetch(API_BASE + '/public/sync-stats', {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username, total })
    });
  } catch(e) {}
}

// ---- 排行榜 ----
async function apiLeaderboard() {
  try {
    const r = await fetch(API_BASE + '/public/leaderboard');
    if (!r.ok) return [];
    return await r.json();
  } catch(e) { return []; }
}
