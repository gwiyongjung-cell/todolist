'use strict';

describe('userService', () => {
  let userService;
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
    userService = require('../services/userService');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile(userId)', () => {
    it('userId로 user를 반환한다', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const user = {
        id: userId,
        email: 'test@example.com',
        name: '홍길동',
        theme: 'LIGHT',
        language: 'ko',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      userRepository.findById.mockResolvedValue(user);

      const result = await userService.getProfile(userId);

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
    });

    it('존재하지 않는 userId → status 404 에러 throw', async () => {
      const userId = 'non-existent-id';

      userRepository.findById.mockResolvedValue(null);

      await expect(userService.getProfile(userId)).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('updateProfile(userId, { name, password })', () => {
    it('name만 변경 → userRepository.update가 { name }으로 호출된다', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        name: '새이름',
        theme: 'LIGHT',
        language: 'ko',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      userRepository.update.mockResolvedValue(updatedUser);

      await userService.updateProfile(userId, { name: '새이름' });

      expect(userRepository.update).toHaveBeenCalledWith(userId, { name: '새이름' });
      expect(hashUtils.hashPassword).not.toHaveBeenCalled();
    });

    it('password만 변경 → hashPassword 호출 후 update가 { password: hashedValue }로 호출된다', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const hashedValue = 'hashed_new_password';
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        name: '홍길동',
        theme: 'LIGHT',
        language: 'ko',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      hashUtils.hashPassword.mockResolvedValue(hashedValue);
      userRepository.update.mockResolvedValue(updatedUser);

      await userService.updateProfile(userId, { password: 'newpassword123' });

      expect(hashUtils.hashPassword).toHaveBeenCalledWith('newpassword123');
      expect(userRepository.update).toHaveBeenCalledWith(userId, { password: hashedValue });
    });

    it('name과 password 모두 없음 → status 400 에러 throw', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';

      await expect(userService.updateProfile(userId, {})).rejects.toMatchObject({ status: 400 });
    });

    it('변경된 user를 반환한다', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        name: '변경된이름',
        theme: 'LIGHT',
        language: 'ko',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateProfile(userId, { name: '변경된이름' });

      expect(result).toEqual(updatedUser);
    });
  });

  describe('updatePreferences(userId, { theme, language })', () => {
    it('유효한 theme(LIGHT/DARK)과 language → update 호출', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        name: '홍길동',
        theme: 'DARK',
        language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      userRepository.update.mockResolvedValue(updatedUser);

      await userService.updatePreferences(userId, { theme: 'DARK', language: 'en' });

      expect(userRepository.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ theme: 'DARK', language: 'en' })
      );
    });

    it('유효하지 않은 theme → status 400 에러 throw', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';

      await expect(
        userService.updatePreferences(userId, { theme: 'INVALID', language: 'ko' })
      ).rejects.toMatchObject({ status: 400 });
    });

    it('language만 변경 (theme 없음) → theme 검증 없이 update 호출', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        name: '홍길동',
        theme: 'LIGHT',
        language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      userRepository.update.mockResolvedValue(updatedUser);

      await userService.updatePreferences(userId, { language: 'en' });

      expect(userRepository.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ language: 'en' })
      );
    });

    it('변경된 user를 반환한다', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        name: '홍길동',
        theme: 'DARK',
        language: 'ko',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updatePreferences(userId, { theme: 'DARK' });

      expect(result).toEqual(updatedUser);
    });
  });
});
