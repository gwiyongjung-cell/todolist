function errorMiddleware(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || '서버 오류가 발생했습니다.' });
}

module.exports = errorMiddleware;
