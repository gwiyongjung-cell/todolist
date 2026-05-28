'use strict';

beforeAll(() => {
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5432';
  process.env.DB_NAME = 'todolist';
  process.env.DB_USER = 'postgres';
  process.env.DB_PASSWORD = 'postgres';
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_EXPIRES_IN = '24h';
});

jest.mock('../services/userService');

const userService = require('../services/userService');
const userController = require('../controllers/userController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('userController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe 핸들러', () => {
    it('req.user.userId로 userService.getProfile 호출 → res.status(200).json(user)', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const req = {
        user: { userId, email: 'test@example.com' },
      };
      const res = mockRes();
      const next = jest.fn();
      const user = {
        id: userId,
        email: 'test@example.com',
        name: '홍길동',
        theme: 'LIGHT',
        language: 'ko',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      userService.getProfile.mockResolvedValue(user);

      await userController.getMe(req, res, next);

      expect(userService.getProfile).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
      expect(next).not.toHaveBeenCalled();
    });

    it('userService.getProfile이 404 에러 throw → next(err) 호출', async () => {
      const req = {
        user: { userId: 'non-existent-id', email: 'test@example.com' },
      };
      const res = mockRes();
      const next = jest.fn();
      const error = Object.assign(new Error('사용자를 찾을 수 없습니다.'), { status: 404 });

      userService.getProfile.mockRejectedValue(error);

      await userController.getMe(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('updateMe 핸들러', () => {
    it('req.body의 name, password를 userService.updateProfile에 전달 → res.status(200).json(user)', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const req = {
        user: { userId, email: 'test@example.com' },
        body: { name: '새이름', password: 'newpassword123' },
      };
      const res = mockRes();
      const next = jest.fn();
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        name: '새이름',
        theme: 'LIGHT',
        language: 'ko',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      userService.updateProfile.mockResolvedValue(updatedUser);

      await userController.updateMe(req, res, next);

      expect(userService.updateProfile).toHaveBeenCalledWith(userId, {
        name: '새이름',
        password: 'newpassword123',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedUser);
      expect(next).not.toHaveBeenCalled();
    });

    it('서비스 에러 → next(err)', async () => {
      const req = {
        user: { userId: '550e8400-e29b-41d4-a716-446655440000', email: 'test@example.com' },
        body: {},
      };
      const res = mockRes();
      const next = jest.fn();
      const error = Object.assign(new Error('변경할 항목이 없습니다.'), { status: 400 });

      userService.updateProfile.mockRejectedValue(error);

      await userController.updateMe(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('updatePreferences 핸들러', () => {
    it('req.body의 theme, language를 userService.updatePreferences에 전달 → res.status(200).json(user)', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const req = {
        user: { userId, email: 'test@example.com' },
        body: { theme: 'DARK', language: 'en' },
      };
      const res = mockRes();
      const next = jest.fn();
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        name: '홍길동',
        theme: 'DARK',
        language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      userService.updatePreferences.mockResolvedValue(updatedUser);

      await userController.updatePreferences(req, res, next);

      expect(userService.updatePreferences).toHaveBeenCalledWith(userId, {
        theme: 'DARK',
        language: 'en',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedUser);
      expect(next).not.toHaveBeenCalled();
    });

    it('theme이 유효하지 않아 400 에러 throw → next(err)', async () => {
      const req = {
        user: { userId: '550e8400-e29b-41d4-a716-446655440000', email: 'test@example.com' },
        body: { theme: 'INVALID', language: 'ko' },
      };
      const res = mockRes();
      const next = jest.fn();
      const error = Object.assign(new Error('유효하지 않은 theme 값입니다.'), { status: 400 });

      userService.updatePreferences.mockRejectedValue(error);

      await userController.updatePreferences(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
