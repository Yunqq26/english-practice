const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = "/data/data.db";
const DB_DIR = "/data";
console.log("[DB] 数据库路径:", DB_PATH);
console.log("[DB] Volume目录存在:", fs.existsSync(DB_DIR));
try { if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true }); } catch(e) {}
let db = null;

async function getDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  try {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log("[DB] 读取已有数据库, 大小:", buffer.length, "bytes");
  } catch (e) {
    console.log("[DB] 未找到现有数据库:", e.message);
    console.log("[DB] 创建新数据库...");
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

let _savePending = false;
let _saveTimer = null;
function saveDb() {
  // 防抖：1秒内的多次写入合并为一次
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    _saveTimer = null;
    _savePending = false;
    try {
      console.log("[DB] 保存数据库到:", DB_PATH);
      if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
      }
    } catch(e) {
      console.error("[DB] 写入失败:", e.message);
    }
  }, 1000);
  if (!_savePending) {
    _savePending = true;
  }
}

module.exports = { getDb, saveDb };
