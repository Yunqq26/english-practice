// ===== 排行榜 =====
async function renderLeaderboard() {
  const el = document.getElementById('leaderboardBody');
  if (!el) return;
  const rows = await apiLeaderboard();
  if (!rows || rows.length === 0) {
    el.innerHTML = '<div class="lb-empty">暂无数据</div>';
    return;
  }
  let html = '';
  rows.forEach((u, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
    const isMe = currentUser && u.username === currentUser.username;
    html += '<div class="lb-row' + (isMe ? ' lb-me' : '') + '">' +
      '<span class="lb-rank">' + medal + '</span>' +
      '<span class="lb-name">' + u.username + '</span>' +
      '<span class="lb-stat">' + (u.total_translations || 0) + '</span>' +
    '</div>';
  });
  el.innerHTML = html;
}
