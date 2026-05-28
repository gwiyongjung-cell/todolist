const pool = require('./db/pool');
const app = require('./app');
const env = require('./config/env');

(async () => {
  try {
    const client = await pool.connect();
    client.release();

    app.listen(env.PORT, () => {
      console.log(`서버가 포트 ${env.PORT}에서 실행 중입니다.`);
    });
  } catch (err) {
    console.error('서버 시작 실패:', err);
    process.exit(1);
  }
})();
