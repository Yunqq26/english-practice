const express = require('express');
const { getDb, saveDb } = require('../database');
const router = express.Router();

router.get('/leaderboard', async (req, res) => {
  const db = await getDb();
  const stmt = db.prepare(`
    SELECT u.username, u.role, s.completed_days, s.streak, s.total_translations
    FROM users u LEFT JOIN stats s ON s.user_id = u.id
    WHERE s.total_translations IS NOT NULL AND s.total_translations > 0
    ORDER BY s.total_translations DESC LIMIT 20
  `);
  stmt.bind([]);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  res.json(rows);
});

router.put('/sync-stats', async (req, res) => {
  const { username, total } = req.body;
  if (!username || typeof total !== 'number') {
    return res.status(400).json({ error: '参数错误' });
  }
  const db = await getDb();
  let user = null;
  const stmt = db.prepare('SELECT id FROM users WHERE username = ?');
  stmt.bind([username]);
  if (stmt.step()) user = stmt.getAsObject();
  stmt.free();
  if (!user) {
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, 'auto', 'user']);
    const s2 = db.prepare('SELECT id FROM users WHERE username = ?');
    s2.bind([username]); s2.step(); user = s2.getAsObject(); s2.free();
  }
  const s3 = db.prepare('SELECT total_translations FROM stats WHERE user_id = ?');
  s3.bind([user.id]);
  const existing = s3.step() ? s3.getAsObject() : null;
  s3.free();
  if (existing) {
    if (total > (existing.total_translations || 0))
      db.run('UPDATE stats SET total_translations = ? WHERE user_id = ?', [total, user.id]);
  } else {
    db.run('INSERT INTO stats (user_id, total_translations) VALUES (?, ?)', [user.id, total]);
  }
  saveDb();
  res.json({ ok: true });
});

// 📥 一键导入本地数据（全量迁移）
router.put('/import', async (req, res) => {
  const { username, progress, stats, vocab, essays, essayProgress } = req.body;
  if (!username) return res.status(400).json({ error: '参数错误' });
  const db = await getDb();
  // 查找或创建用户
  let user = null;
  const stmt = db.prepare('SELECT id FROM users WHERE username = ?');
  stmt.bind([username]);
  if (stmt.step()) user = stmt.getAsObject();
  stmt.free();
  if (!user) {
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, 'auto', 'user']);
    const s2 = db.prepare('SELECT id FROM users WHERE username = ?');
    s2.bind([username]); s2.step(); user = s2.getAsObject(); s2.free();
  }

  // 导入进度
  if (progress) {
    Object.entries(progress).forEach(([date, data]) => {
      db.run('INSERT OR REPLACE INTO progress (user_id, date, data) VALUES (?, ?, ?)',
        [user.id, date, JSON.stringify(data)]);
    });
  }
  // 导入统计
  if (stats) {
    let total = 0;
    if (progress) {
      Object.values(progress).forEach(d => { if (d.entries) total += d.entries.length; });
    }
    db.run('INSERT OR REPLACE INTO stats (user_id, total_days, completed_days, streak, total_translations) VALUES (?, ?, ?, ?, ?)',
      [user.id, stats.totalDays || 0, stats.completedDays || 0, stats.streak || 0, total]);
  }
  // 导入生词
  if (vocab && vocab.words) {
    Object.entries(vocab.words).forEach(([word, data]) => {
      db.run('INSERT OR REPLACE INTO vocab (user_id, word, data) VALUES (?, ?, ?)',
        [user.id, word, JSON.stringify(data)]);
    });
  }
  // 导入作文
  if (essays) {
    db.run('DELETE FROM essays WHERE user_id = ?', [user.id]);
    essays.forEach(e => {
      db.run('INSERT INTO essays (id, user_id, title, content, sentences, date_added) VALUES (?, ?, ?, ?, ?, ?)',
        [e.id, user.id, e.title, e.content, JSON.stringify(e.sentences), e.dateAdded]);
    });
  }
  if (essayProgress) {
    db.run('DELETE FROM essay_progress WHERE user_id = ?', [user.id]);
    Object.entries(essayProgress).forEach(([key, data]) => {
      db.run('INSERT OR REPLACE INTO essay_progress (id, user_id, essay_id, data) VALUES (?, ?, ?, ?)',
        [key, user.id, key.split('-')[0], JSON.stringify(data)]);
    });
  }
  saveDb();
  res.json({ ok: true });
});



router.get('/export/:username', async (req, res) => {
  const db = await getDb();
  const stmt = db.prepare('SELECT id FROM users WHERE username = ?');
  stmt.bind([req.params.username]);
  if (!stmt.step()) { stmt.free(); return res.json(null); }
  const user = stmt.getAsObject(); stmt.free();

  const pRows = db.prepare('SELECT date, data FROM progress WHERE user_id = ?');
  pRows.bind([user.id]); const progress = {};
  while (pRows.step()) { const r = pRows.getAsObject(); progress[r.date] = JSON.parse(r.data); }
  pRows.free();

  const sRow = db.prepare('SELECT * FROM stats WHERE user_id = ?');
  sRow.bind([user.id]); const stats = sRow.step() ? sRow.getAsObject() : null; sRow.free();

  const vRows = db.prepare('SELECT word, data FROM vocab WHERE user_id = ?');
  vRows.bind([user.id]); const words = {};
  while (vRows.step()) { const r = vRows.getAsObject(); words[r.word] = JSON.parse(r.data); }
  vRows.free();

  const eRows = db.prepare('SELECT id, title, content, sentences, date_added FROM essays WHERE user_id = ?');
  eRows.bind([user.id]); const essays = [];
  while (eRows.step()) { const r = eRows.getAsObject(); essays.push({id:r.id,title:r.title,content:r.content,sentences:JSON.parse(r.sentences),dateAdded:r.date_added}); }
  eRows.free();

  res.json({ progress, stats, vocab: { words }, essays });
});


router.put('/reset-pw', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({error:'参数错误'});
  const db = await getDb();
  const stmt = db.prepare('SELECT id FROM users WHERE username = ?');
  stmt.bind([username]);
  if (!stmt.step()) { stmt.free(); return res.json({error:'用户不存在'}); }
  stmt.free();
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync(password, 10);
  db.run('UPDATE users SET password = ? WHERE username = ?', [hash, username]);
  saveDb();
  res.json({ok:true, msg:'密码已重置'});
});
module.exports = router;
