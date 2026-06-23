// ===== 排行榜 + 数据迁移 API =====
const API_BASE = 'https://backend-production-80b8b.up.railway.app/api';

async function apiLeaderboard() {
  try {
    const r = await fetch(API_BASE + '/public/leaderboard');
    if (!r.ok) return [];
    return await r.json();
  } catch(e) { return []; }
}

async function apiSyncTotal(username, total) {
  try {
    await fetch(API_BASE + '/public/sync-stats', {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username, total })
    });
  } catch(e) {}
}

// 📤 一键导入全部本地数据到云端
async function apiImportAll(username) {
  const data = getAllUserData();
  const userData = data[username];
  if (!userData) return { ok: false, msg: '没有找到 ' + username + ' 的数据' };

  // 收集作文库
  let essays = [], essayProgress = {};
  try {
    const ed = JSON.parse(localStorage.getItem('eng_essays')) || { essays: [], progress: {} };
    essays = ed.essays;
    essayProgress = ed.progress;
  } catch(e) {}

  const body = {
    username,
    progress: userData.progress || {},
    stats: userData.stats || {},
    vocab: userData.vocab || {},
    essays,
    essayProgress
  };

  try {
    const r = await fetch(API_BASE + '/public/import', {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    const d = await r.json();
    return d.ok ? { ok: true } : { ok: false, msg: '导入失败' };
  } catch(e) {
    return { ok: false, msg: '无法连接服务器' };
  }
}


// ☁️ 一键上传本地数据到云端
async function syncLocalToCloud() {
  const btn = document.getElementById('btnSyncCloud');
  if (!currentUser) { alert('请先登录'); return; }
  btn.textContent = '⏳ 上传中...';
  btn.disabled = true;
  try {
    const r = await apiImportAll(currentUser.username);
    if (r.ok) {
      btn.textContent = '✅ 上传成功！';
      setTimeout(() => { btn.style.display = 'none'; }, 2000);
      renderLeaderboard();
    } else {
      alert(r.msg);
      btn.textContent = '☁️ 上传本地数据到云端';
    }
  } catch(e) {
    alert('上传失败');
    btn.textContent = '☁️ 上传本地数据到云端';
  }
  btn.disabled = false;
}


// 📥 从云端下载数据到本地
async function apiDownloadToLocal(username) {
  try {
    const r = await fetch(API_BASE + '/public/export/' + encodeURIComponent(username));
    if (!r.ok) return false;
    const data = await r.json();
    if (!data) return false;
    const all = getAllUserData();
    all[username] = {
      progress: data.progress || {},
      stats: data.stats ? { totalDays: data.stats.total_days || 0, completedDays: data.stats.completed_days || 0, streak: data.stats.streak || 0 } : { totalDays:0, completedDays:0, streak:0 },
      vocab: data.vocab || { words: {} }
    };
    saveAllUserData(all);
    if (data.essays && data.essays.length) {
      try {
        const old = JSON.parse(localStorage.getItem('eng_essays')) || { essays: [], progress: {} };
        old.essays = data.essays;
        localStorage.setItem('eng_essays', JSON.stringify(old));
      } catch(e) {}
    }
    return true;
  } catch(e) { return false; }
}
