const express = require('express');
const { getDb, saveDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}
function queryOne(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

router.get('/all', async (req, res) => {
  const db = await getDb();
  const uid = req.userId;
  const progressRows = queryAll(db, 'SELECT date, data FROM progress WHERE user_id = ?', [uid]);
  const progress = {};
  progressRows.forEach(r => { progress[r.date] = JSON.parse(r.data); });
  const statsRow = queryOne(db, 'SELECT * FROM stats WHERE user_id = ?', [uid]);
  const stats = statsRow ? { totalDays: statsRow.total_days, completedDays: statsRow.completed_days, streak: statsRow.streak } : { totalDays:0, completedDays:0, streak:0 };
  const vocabRows = queryAll(db, 'SELECT word, data FROM vocab WHERE user_id = ?', [uid]);
  const words = {};
  vocabRows.forEach(r => { words[r.word] = JSON.parse(r.data); });
  const essayRows = queryAll(db, 'SELECT * FROM essays WHERE user_id = ?', [uid]);
  const essays = essayRows.map(e => ({ id: e.id, title: e.title, content: e.content, sentences: JSON.parse(e.sentences), dateAdded: e.date_added }));
  const epRows = queryAll(db, 'SELECT essay_id, data FROM essay_progress WHERE user_id = ?', [uid]);
  const essayProgress = {};
  epRows.forEach(r => { essayProgress[r.essay_id] = JSON.parse(r.data); });
  res.json({ progress, stats, vocab: { words }, essays, essayProgress });
});

router.put('/progress', async (req, res) => {
  const db = await getDb();
  const uid = req.userId;
  const { progress, stats } = req.body;
  if (progress) {
    let totalCount = 0;
    Object.entries(progress).forEach(([date, data]) => {
      db.run('INSERT OR REPLACE INTO progress (user_id, date, data) VALUES (?, ?, ?)', [uid, date, JSON.stringify(data)]);
      if (data.entries) totalCount += data.entries.length;
    });
    const existing = queryOne(db, 'SELECT total_translations FROM stats WHERE user_id = ?', [uid]);
    const oldTotal = existing ? existing.total_translations : 0;
    db.run('UPDATE stats SET total_translations = ? WHERE user_id = ?', [oldTotal + totalCount, uid]);
  }
  if (stats) {
    db.run('INSERT OR REPLACE INTO stats (user_id, total_days, completed_days, streak) VALUES (?, ?, ?, ?)',
      [uid, stats.totalDays || 0, stats.completedDays || 0, stats.streak || 0]);
  }
  saveDb();
  res.json({ ok: true });
});

router.put('/vocab', async (req, res) => {
  const db = await getDb();
  const uid = req.userId;
  const { vocab } = req.body;
  if (vocab && vocab.words) {
    Object.entries(vocab.words).forEach(([word, data]) => {
      db.run('INSERT OR REPLACE INTO vocab (user_id, word, data) VALUES (?, ?, ?)', [uid, word, JSON.stringify(data)]);
    });
    saveDb();
  }
  res.json({ ok: true });
});

router.put('/essays', async (req, res) => {
  const db = await getDb();
  const uid = req.userId;
  const { essays, essayProgress } = req.body;
  if (essays) {
    db.run('DELETE FROM essays WHERE user_id = ?', [uid]);
    essays.forEach(e => {
      db.run('INSERT INTO essays (id, user_id, title, content, sentences, date_added) VALUES (?, ?, ?, ?, ?, ?)',
        [e.id, uid, e.title, e.content, JSON.stringify(e.sentences), e.dateAdded]);
    });
  }
  if (essayProgress) {
    db.run('DELETE FROM essay_progress WHERE user_id = ?', [uid]);
    Object.entries(essayProgress).forEach(([key, data]) => {
      const essayId = key.split('-')[0];
      db.run('INSERT OR REPLACE INTO essay_progress (id, user_id, essay_id, data) VALUES (?, ?, ?, ?)',
        [key, uid, essayId, JSON.stringify(data)]);
    });
  }
  saveDb();
  res.json({ ok: true });
});

router.get('/leaderboard', async (req, res) => {
  const db = await getDb();
  const rows = queryAll(db, `
    SELECT u.username, u.role, s.completed_days, s.streak, s.total_translations
    FROM users u LEFT JOIN stats s ON s.user_id = u.id
    ORDER BY s.total_translations DESC NULLS LAST
    LIMIT 20
  `);
  res.json(rows);
});

module.exports = router;
