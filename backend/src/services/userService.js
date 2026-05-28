const userRepository = require('../repositories/userRepository');
const hashUtils = require('../utils/hashUtils');
const logger = require('../utils/logger');
const { THEME } = require('../constants/statusConstants');

async function getProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    logger.warn('존재하지 않는 사용자 프로필 조회 시도', { userId });
    const err = new Error('사용자를 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }
  return user;
}

async function updateProfile(userId, { name, password }) {
  if (!name && !password) {
    const err = new Error('수정할 항목이 없습니다.');
    err.status = 400;
    throw err;
  }

  const fields = {};
  if (name) fields.name = name;
  if (password) fields.password = await hashUtils.hashPassword(password);

  const user = await userRepository.update(userId, fields);
  logger.info('프로필 업데이트 완료', { userId });
  return user;
}

async function updatePreferences(userId, { theme, language }) {
  const fields = {};

  if (theme !== undefined) {
    if (theme !== THEME.LIGHT && theme !== THEME.DARK) {
      const err = new Error('유효하지 않은 테마값입니다.');
      err.status = 400;
      throw err;
    }
    fields.theme = theme;
  }

  if (language !== undefined) fields.language = language;

  const user = await userRepository.update(userId, fields);
  logger.info('환경설정 업데이트 완료', { userId });
  return user;
}

module.exports = { getProfile, updateProfile, updatePreferences };
