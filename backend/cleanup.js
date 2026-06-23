const {getDb, saveDb} = require('./database');
async function run() {
  const db = await getDb();
  const s = db.prepare('SELECT id FROM users WHERE username = ?');
  s.bind(['Yunqq']);
  if (s.step()) {
    const uid = s.getAsObject().id; s.free();
    db.run('DELETE FROM progress WHERE user_id = ?', [uid]);
    db.run('DELETE FROM stats WHERE user_id = ?', [uid]);
    db.run('DELETE FROM vocab WHERE user_id = ?', [uid]);
    db.run('DELETE FROM essays WHERE user_id = ?', [uid]);
    db.run('DELETE FROM essay_progress WHERE user_id = ?', [uid]);
    db.run('DELETE FROM users WHERE id = ?', [uid]);
    saveDb();
    console.log('已清除 Yunqq 数据');
  } else { s.free(); console.log('未找到 Yunqq'); }
}
run();
