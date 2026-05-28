const authService = require('../services/authService');
const logger = require('../utils/logger');

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const user = await authService.register({ email, password, name });
    res.status(201).json(user);
  } catch (err) {
    logger.error('회원가입 처리 실패', { message: err.message });
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });
    res.status(200).json({ token, user });
  } catch (err) {
    logger.error('로그인 처리 실패', { message: err.message });
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    res.status(200).json({ message: '로그아웃되었습니다.' });
  } catch (err) {
    logger.error('로그아웃 처리 실패', { message: err.message });
    next(err);
  }
}

module.exports = { register, login, logout };
