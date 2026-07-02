const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const syncRoutes = require('./routes/sync');
const publicRoutes = require('./routes/public');
const translationRoutes = require('./routes/translation');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/trans', translationRoutes);

// 健康检查
app.get('/api/health', (req, res) => res.json({ ok: true }));

process.on('uncaughtException', (err) => {
  console.error('[FATAL]', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL]', reason);
});

app.listen(PORT, () => {
  console.log(`✅ 后端 API 运行在 http://localhost:${PORT}`);
  console.log(`   排行: GET /api/public/leaderboard`);
});
