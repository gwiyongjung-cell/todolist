const userRepository = require('../repositories/userRepository');
const hashUtils = require('../utils/hashUtils');
const jwtUtils = require('../utils/jwtUtils');
const logger = require('../utils/logger');

async function register({ email, password, name }) {
  if (!email || !password || !name) {
    const err = new Error('이메일, 비밀번호, 이름은 필수 입력값입니다.');
    err.status = 400;
    throw err;
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    logger.warn('중복 이메일 회원가입 시도', { email });
    const err = new Error('이미 사용 중인 이메일입니다.');
    err.status = 409;
    throw err;
  }

  const hashedPassword = await hashUtils.hashPassword(password);
  const user = await userRepository.create({ email, password: hashedPassword, name });

  logger.info('회원가입 완료', { email });
  return user;
}

async function login({ email, password }) {
  if (!email || !password) {
    const err = new Error('이메일과 비밀번호는 필수 입력값입니다.');
    err.status = 400;
    throw err;
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    logger.warn('존재하지 않는 이메일로 로그인 시도', { email });
    const err = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    err.status = 401;
    throw err;
  }

  const isMatch = await hashUtils.comparePassword(password, user.password);
  if (!isMatch) {
    logger.warn('비밀번호 불일치 로그인 시도', { email });
    const err = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    err.status = 401;
    throw err;
  }

  const token = jwtUtils.generateToken({ userId: user.id, email: user.email });

  const { password: _password, ...userWithoutPassword } = user;

  logger.info('로그인 완료', { email });
  return { token, user: userWithoutPassword };
}

module.exports = { register, login };
