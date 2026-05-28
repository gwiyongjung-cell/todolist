const jwtUtils = require('../utils/jwtUtils');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('인증이 필요합니다.');
    err.status = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwtUtils.verifyToken(token);
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (e) {
    const err = new Error('인증이 필요합니다.');
    err.status = 401;
    next(err);
  }
}

module.exports = authMiddleware;
