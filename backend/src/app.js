const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const env = require('./config/env');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 인증 미들웨어 (각 보호 라우터에 개별 적용)
// const authMiddleware = require('./middlewares/authMiddleware');

app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/users', require('./routes/userRoutes'));

app.use('/api/categories', require('./routes/categoryRoutes'));

app.use('/api/todos', require('./routes/todoRoutes'));

// TODO: 추가 라우터 등록 위치

app.use(errorMiddleware);

module.exports = app;
