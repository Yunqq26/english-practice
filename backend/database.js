const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = "/data/data.db";
const DB_DIR = "/data";
try { if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true }); } catch(e) {}
let db = null;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  try {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } catch (e) {
    db = new SQL.Database();
  }
  initTables();
  return db;
}

function initTables() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
    role TEXT DEFAULT 'user', created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS progress (
    user_id INTEGER NOT NULL, date TEXT NOT NULL, data TEXT NOT NULL,
    PRIMARY KEY (user_id, date)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS stats (
    user_id INTEGER PRIMARY KEY,
    total_days INTEGER DEFAULT 0, completed_days INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0
  )`);
  try { db.run('ALTER TABLE stats ADD COLUMN total_translations INTEGER DEFAULT 0'); } catch(e) {}
  db.run(`CREATE TABLE IF NOT EXISTS vocab (
    user_id INTEGER NOT NULL, word TEXT NOT NULL, data TEXT NOT NULL,
    PRIMARY KEY (user_id, word)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS essays (
    id TEXT NOT NULL, user_id INTEGER NOT NULL,
    title TEXT NOT NULL, content TEXT NOT NULL,
    sentences TEXT NOT NULL, date_added TEXT NOT NULL,
    PRIMARY KEY (id, user_id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS essay_progress (
    id TEXT NOT NULL, user_id INTEGER NOT NULL,
    essay_id TEXT NOT NULL, data TEXT NOT NULL,
    PRIMARY KEY (id, user_id)
  )`);
  saveDb();
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

module.exports = { getDb, saveDb };
