require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;

const isDev = process.env.NODE_ENV !== 'production';
const corsOrigin = isDev
  ? /^http:\/\/localhost(:\d+)?$/   // 개발: localhost 모든 포트 허용
  : process.env.ALLOWED_ORIGIN;     // 운영: 지정 도메인만 허용

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Peoplify Server] http://localhost:${PORT}`);
});
