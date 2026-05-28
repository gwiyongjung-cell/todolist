'use strict';

describe('authService', () => {
  let authService;
  let userRepository;
  let hashUtils;

  beforeAll(() => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'todolist';
    process.env.DB_USER = 'postgres';
    process.env.DB_PASSWORD = 'postgres';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '24h';

    jest.resetModules();
    jest.mock('../repositories/userRepository');
    jest.mock('../utils/hashUtils');

    userRepository = require('../repositories/userRepository');
    hashUtils = require('../utils/hashUtils');
    authService = require('../services/authService');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register({ email, password, name })', () => {
    it('정상 등록 시 userRepository.create를 호출하고 생성된 user를 반환한다', async () => {
      const input = { email: 'test@example.com', password: 'password123', name: '홍길동' };
      const hashedPassword = 'hashed_password';
      const createdUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: input.email,
        name: input.name,
        theme: 'LIGHT',
        language: 'ko',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      userRepository.findByEmail.mockResolvedValue(null);
      hashUtils.hashPassword.mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(createdUser);

      const result = await authService.register(input);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(input.email);
      expect(hashUtils.hashPassword).toHaveBeenCalledWith(input.password);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: input.email,
        password: hashedPassword,
        name: input.name,
      });
      expect(result).toEqual(createdUser);
    });

    it('중복 이메일 등록 시 status 409 에러를 throw한다', async () => {
      const input = { email: 'duplicate@example.com', password: 'password123', name: '홍길동' };
      const existingUser = { id: 'existing-id', email: input.email };

      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(authService.register(input)).rejects.toMatchObject({ status: 409 });
    });

    it('이메일 누락 시 status 400 에러를 throw한다', async () => {
      const input = { password: 'password123', name: '홍길동' };

      await expect(authService.register(input)).rejects.toMatchObject({ status: 400 });
    });

    it('비밀번호 누락 시 status 400 에러를 throw한다', async () => {
      const input = { email: 'test@example.com', name: '홍길동' };

      await expect(authService.register(input)).rejects.toMatchObject({ status: 400 });
    });

    it('이름 누락 시 status 400 에러를 throw한다', async () => {
      const input = { email: 'test@example.com', password: 'password123' };

      await expect(authService.register(input)).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('login({ email, password })', () => {
    it('정상 로그인 시 { token, user }를 반환하고 token은 문자열이다', async () => {
      const input = { email: 'test@example.com', password: 'password123' };
      const foundUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: input.email,
        password: 'hashed_password',
        name: '홍길동',
        theme: 'LIGHT',
        language: 'ko',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      userRepository.findByEmail.mockResolvedValue(foundUser);
      hashUtils.comparePassword.mockResolvedValue(true);

      const result = await authService.login(input);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(typeof result.token).toBe('string');
      expect(result.user).not.toHaveProperty('password');
    });

    it('존재하지 않는 이메일로 로그인 시 status 401 에러를 throw한다', async () => {
      const input = { email: 'notfound@example.com', password: 'password123' };

      userRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login(input)).rejects.toMatchObject({ status: 401 });
    });

    it('잘못된 비밀번호로 로그인 시 status 401 에러를 throw한다', async () => {
      const input = { email: 'test@example.com', password: 'wrongpassword' };
      const foundUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: input.email,
        password: 'hashed_password',
        name: '홍길동',
      };

      userRepository.findByEmail.mockResolvedValue(foundUser);
      hashUtils.comparePassword.mockResolvedValue(false);

      await expect(authService.login(input)).rejects.toMatchObject({ status: 401 });
    });

    it('이메일 누락 시 status 400 에러를 throw한다', async () => {
      const input = { password: 'password123' };

      await expect(authService.login(input)).rejects.toMatchObject({ status: 400 });
    });
  });
});
