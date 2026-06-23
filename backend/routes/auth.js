const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, saveDb } = require('../database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

function queryOne(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: '用户名和密码不符合要求' });
  }
  const db = await getDb();
  const existing = queryOne(db, 'SELECT id FROM users WHERE username = ?', [username]);
  if (existing) return res.status(400).json({ error: '用户名已存在' });

  const hash = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
  saveDb();

  const user = queryOne(db, 'SELECT * FROM users WHERE username = ?', [username]);
  const token = generateToken(user);
  res.json({ token, username: user.username });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '请输入用户名和密码' });

  const db = await getDb();
  const user = queryOne(db, 'SELECT * FROM users WHERE username = ?', [username]);
  if (!user) return res.status(400).json({ error: '用户不存在' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: '密码错误' });

  const token = generateToken(user);
  res.json({ token, username: user.username });
});

module.exports = router;
