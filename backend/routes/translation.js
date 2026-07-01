const express = require('express');
const { getDb, saveDb } = require('../database');
const router = express.Router();

const DEEPSEEK_KEY = process.env.DEEPSEEK_KEY || 'sk-5abfc03936b1498fac44f778f08e9fe1';

// ===== 数据库初始化（汉译英表）=====
async function initTables() {
  const db = await getDb();
  db.run(`CREATE TABLE IF NOT EXISTS zh_en_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL,
    format TEXT DEFAULT 'full_sentence',
    chinese_prompt TEXT NOT NULL,
    reference_answer TEXT NOT NULL,
    grammar_point TEXT,
    key_phrases TEXT,
    difficulty INTEGER DEFAULT 2,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS zh_en_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    user_answer TEXT,
    score REAL DEFAULT 0,
    errors TEXT,
    type TEXT DEFAULT 'free',
    date TEXT DEFAULT (date('now')),
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS zh_en_streaks (
    username TEXT PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_date TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS zh_en_daily (
    username TEXT NOT NULL,
    date TEXT NOT NULL,
    question_ids TEXT,
    completed INTEGER DEFAULT 0,
    score REAL DEFAULT 0,
    PRIMARY KEY (username, date)
  )`);
  saveDb();
}

// ===== DeepSeek 批改 =====
router.post('/grade', async (req, res) => {
  const { questionId, userAnswer, username, type } = req.body;
  if (!questionId || !userAnswer) return res.status(400).json({error:'参数不足'});

  const db = await getDb();
  const q = db.prepare('SELECT * FROM zh_en_questions WHERE id = ?');
  q.bind([questionId]);
  if (!q.step()) { q.free(); return res.status(404).json({error:'题目不存在'}); }
  const question = q.getAsObject(); q.free();

  const systemPrompt = `你是浙江专升本英语阅卷老师。给定中文原题（可能是完整句或半句填空式）、该题考察的语法点、用户提交的英文译文。

请只返回json格式的批改结果，不要输出markdown代码块或任何其他文字。json格式如下：
{
  "score": 0-2之间的分数（可以是0.5的倍数）,
  "errors": ["错误1的具体描述（说明为什么错）", "错误2的具体描述"],
  "reference_answer": "标准参考译文",
  "grammar_point": "本题考察的语法点说明",
  "key_phrases": ["核心词组1", "核心词组2"]
}

批改要求：
- 语气鼓励但要精准指出问题
- 如果是拼写错误，明确指出错在哪个单词
- 如果是语法结构错误，说明为什么错、正确逻辑是什么
- 如果用户答案虽与参考答案不同但语法正确、意思准确，给满分或高分`;

  const userMsg = `题目：${question.chinese_prompt}\n语法点：${question.grammar_point}\n用户译文：${userAnswer}`;

  try {
    const apiRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + DEEPSEEK_KEY
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMsg }
        ],
        response_format: { type: 'json_object' },
        thinking: { type: 'disabled' },
        temperature: 0.2,
        max_tokens: 400
      })
    });
    const data = await apiRes.json();
    let result;
    try {
      result = JSON.parse(data.choices[0].message.content);
    } catch(e) {
      // 重试一次
      const retry = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + DEEPSEEK_KEY
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: [
            { role: 'system', content: systemPrompt + '\n务必输出合法JSON。' },
            { role: 'user', content: userMsg }
          ],
          response_format: { type: 'json_object' },
          temperature: 0,
          max_tokens: 400
        })
      });
      const retryData = await retry.json();
      result = JSON.parse(retryData.choices[0].message.content);
    }

    // 保存答题记录
    db.run('INSERT INTO zh_en_answers (username, question_id, user_answer, score, errors, type, date) VALUES (?, ?, ?, ?, ?, ?, date("now"))',
      [username || 'anonymous', questionId, userAnswer, result.score || 0, JSON.stringify(result.errors || []), type || 'free']);
    saveDb();

    res.json(result);
  } catch(e) {
    res.status(500).json({ error: '批改服务暂时繁忙，请重试', detail: e.message });
  }
});

// ===== 获取每日五题 =====
router.get('/daily/:username', async (req, res) => {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0];
  const username = req.params.username;

  // 检查今天是否已有题目
  const daily = db.prepare('SELECT * FROM zh_en_daily WHERE username = ? AND date = ?');
  daily.bind([username, today]);
  const existing = daily.step() ? daily.getAsObject() : null;
  daily.free();

  if (existing && existing.question_ids) {
    const ids = JSON.parse(existing.question_ids);
    const questions = [];
    for (const id of ids) {
      const qs = db.prepare('SELECT * FROM zh_en_questions WHERE id = ?');
      qs.bind([id]);
      if (qs.step()) questions.push(qs.getAsObject());
      qs.free();
    }
    // 返回已答情况
    const answers = db.prepare('SELECT question_id, score, errors, user_answer FROM zh_en_answers WHERE username = ? AND date = ?');
    answers.bind([username, today]);
    const ansMap = {};
    while (answers.step()) { const a = answers.getAsObject(); ansMap[a.question_id] = a; }
    answers.free();
    return res.json({ questions, answers: ansMap, completed: existing.completed, date: today });
  }

  // 生成新题（从题库随机抽5题，覆盖不同模块）
  const modules = db.prepare('SELECT DISTINCT module FROM zh_en_questions');
  modules.bind([]);
  const modList = [];
  while (modules.step()) modList.push(modules.getAsObject().module);
  modules.free();

  if (!modList.length) return res.json({ questions: [], answers: {}, date: today, empty: true });

  const selected = [];
  const usedMods = [];
  // 尽量每个模块抽一题
  for (let i = 0; i < Math.min(5, modList.length); i++) {
    const mod = modList[i % modList.length];
    const qs = db.prepare('SELECT * FROM zh_en_questions WHERE module = ? ORDER BY RANDOM() LIMIT 1');
    qs.bind([mod]);
    if (qs.step()) selected.push(qs.getAsObject());
    qs.free();
  }
  // 不足5题补随机
  while (selected.length < 5) {
    const qs = db.prepare('SELECT * FROM zh_en_questions ORDER BY RANDOM() LIMIT 1');
    qs.bind([]);
    if (qs.step()) {
      const q = qs.getAsObject();
      if (!selected.find(s => s.id === q.id)) selected.push(q);
    }
    qs.free();
  }

  const ids = selected.map(s => s.id);
  db.run('INSERT OR REPLACE INTO zh_en_daily (username, date, question_ids, completed, score) VALUES (?, ?, ?, 0, 0)',
    [username, today, JSON.stringify(ids)]);
  saveDb();

  res.json({ questions: selected, answers: {}, completed: false, date: today });
});

// ===== 获取自由练习题目 =====
router.get('/questions', async (req, res) => {
  const db = await getDb();
  const { module, limit, wrongOnly, username } = req.query;
  let sql = 'SELECT * FROM zh_en_questions';
  const params = [];
  const conditions = [];

  if (module && module !== 'all') {
    conditions.push('module = ?');
    params.push(module);
  }
  if (wrongOnly === 'true' && username) {
    conditions.push('id IN (SELECT question_id FROM zh_en_answers WHERE username = ? AND score < 2)');
    params.push(username);
  }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY RANDOM() LIMIT ?';
  params.push(parseInt(limit) || 10);

  const stmt = db.prepare(sql);
  stmt.bind(params);
  const questions = [];
  while (stmt.step()) questions.push(stmt.getAsObject());
  stmt.free();
  res.json(questions);
});

// ===== 获取模块列表 =====
router.get('/modules', async (req, res) => {
  const db = await getDb();
  const stmt = db.prepare('SELECT DISTINCT module FROM zh_en_questions ORDER BY module');
  stmt.bind([]);
  const modules = [];
  while (stmt.step()) modules.push(stmt.getAsObject().module);
  stmt.free();
  res.json(modules);
});

// ===== 打卡数据 =====
router.get('/streak/:username', async (req, res) => {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM zh_en_streaks WHERE username = ?');
  stmt.bind([req.params.username]);
  const data = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  res.json(data || { current_streak: 0, max_streak: 0 });

  // 更新打卡
  const today = new Date().toISOString().split('T')[0];
  if (data) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = data.current_streak;
    if (data.last_date === yesterday) newStreak++;
    else if (data.last_date !== today) newStreak = 1;
    if (newStreak > data.max_streak) {
      db.run('UPDATE zh_en_streaks SET current_streak = ?, max_streak = ?, last_date = ? WHERE username = ?',
        [newStreak, Math.max(data.max_streak, newStreak), today, username]);
    } else {
      db.run('UPDATE zh_en_streaks SET current_streak = ?, last_date = ? WHERE username = ?',
        [newStreak, today, username]);
    }
  } else {
    db.run('INSERT INTO zh_en_streaks (username, current_streak, max_streak, last_date) VALUES (?, 1, 1, ?)',
      [username, today]);
  }
  saveDb();
});


// ===== 清理不符合格式的题目 =====
router.delete('/clean', async (req, res) => {
  const db = await getDb();
  const stmt = db.prepare('SELECT id, chinese_prompt FROM zh_en_questions');
  stmt.bind([]);
  const badIds = [];
  while (stmt.step()) {
    const q = stmt.getAsObject();
    // 检测是否为纯中文（没有英文字母）
    if (!/[a-zA-Z]/.test(q.chinese_prompt || '')) {
      badIds.push(q.id);
    }
  }
  stmt.free();
  if (badIds.length) {
    const del = db.prepare('DELETE FROM zh_en_questions WHERE id = ?');
    for (const id of badIds) {
      del.run([id]);
    }
    del.free();
    saveDb();
  }
  res.json({ ok: true, deleted: badIds.length });
});

// ===== 生成题目（调用 DeepSeek）=====
router.post('/generate', async (req, res) => {
  const { module, count } = req.body;
  const modules = ['定语从句与名词性从句','非谓语动词','虚拟语气与条件状语从句','特殊句型','社会热点与文化词汇'];
  if (module && !modules.includes(module)) return res.status(400).json({error:'模块不存在'});
  const countNum = Math.min(count || 10, 30);

  const prompt = `你是英语试题出题老师。请生成${countNum}道浙江专升本英语汉译英题目，${module ? '模块："' + module + '"' : '覆盖以下模块：' + modules.join('、')}。

【重要】每道题必须采用"半句填空式"——保留部分英文句子结构，用___标记空格位置，在空格后用中文括号提示要翻译的内容。
	绝对禁止生成纯中文句子或整句翻译题。禁止使用 full_sentence 格式。
	
	正确示例：
	- "We had better ___ (避免在公共场合吸烟)." → avoid smoking in public
	- "I have a book ___ (封面是红色的)." → whose cover is red
	- "The ___ (人口老龄化) problem has become serious." → aging population

请只返回json数组，每个元素包含：
{
  "module": "所属模块名称",
  "format": "fill_in_blank（必须，禁止使用full_sentence）",
  "chinese_prompt": "题目文本",
  "reference_answer": "标准答案",
  "grammar_point": "本题考察的语法点",
  "key_phrases": ["核心词组1", "核心词组2"],
  "difficulty": 1-3
}`;

  try {
    const apiRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + DEEPSEEK_KEY
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: '你是一个英语试题出题老师。只输出json数组，不要markdown。' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4000
      })
    });
    const data = await apiRes.json();
    let questions;
    try {
      questions = JSON.parse(data.choices[0].message.content);
    } catch(e) {
      return res.status(500).json({error:'生成失败，请重试'});
    }

    const arr = Array.isArray(questions) ? questions : (questions.questions || [questions]);
    const db = await getDb();
    let inserted = 0;
    for (const q of arr) {
      if (!q.chinese_prompt || !q.reference_answer) continue;
      db.run('INSERT INTO zh_en_questions (module, format, chinese_prompt, reference_answer, grammar_point, key_phrases, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [q.module || module, q.format || 'full_sentence', q.chinese_prompt, q.reference_answer, q.grammar_point || '', JSON.stringify(q.key_phrases || []), q.difficulty || 2]);
      inserted++;
    }
    saveDb();
    res.json({ ok: true, count: inserted });
  } catch(e) {
    res.status(500).json({error:'生成失败:' + e.message});
  }
});

initTables();
module.exports = router;
