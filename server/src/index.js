require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');
const employeesRouter = require('./routes/employees');
const projectsRouter = require('./routes/projects');
const assignmentsRouter = require('./routes/assignments');

const authMiddleware = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

const isDev = process.env.NODE_ENV !== 'production';
const corsOrigin = isDev
  ? /^http:\/\/localhost(:\d+)?$/   // 개발: localhost 모든 포트 허용
  : process.env.ALLOWED_ORIGIN;     // 운영: 지정 도메인만 허용

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

// ── 라우터 등록 ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/dashboard', authMiddleware, dashboardRouter);
app.use('/api/employees', authMiddleware, employeesRouter);
app.use('/api/projects', authMiddleware, projectsRouter);
app.use('/api/assignments', authMiddleware, assignmentsRouter);

// ── 헬스체크 ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 글로벌 에러 핸들러 (반드시 마지막 등록) ──────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Peoplify Server] http://localhost:${PORT}`);
});
