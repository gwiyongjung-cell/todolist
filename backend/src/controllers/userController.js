const userService = require('../services/userService');
const logger = require('../utils/logger');

async function getMe(req, res, next) {
  try {
    const user = await userService.getProfile(req.user.userId);
    res.status(200).json(user);
  } catch (err) {
    logger.error('프로필 조회 실패', { message: err.message });
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { name, password } = req.body;
    const user = await userService.updateProfile(req.user.userId, { name, password });
    res.status(200).json(user);
  } catch (err) {
    logger.error('프로필 수정 실패', { message: err.message });
    next(err);
  }
}

async function updatePreferences(req, res, next) {
  try {
    const { theme, language } = req.body;
    const user = await userService.updatePreferences(req.user.userId, { theme, language });
    res.status(200).json(user);
  } catch (err) {
    logger.error('환경설정 수정 실패', { message: err.message });
    next(err);
  }
}

module.exports = { getMe, updateMe, updatePreferences };
