'use strict';

jest.mock('../services/authService');

const authService = require('../services/authService');
const authController = require('../controllers/authController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register 핸들러', () => {
    it('성공 시 res.status(201).json을 호출하고 body에 user가 포함된다', async () => {
      const req = {
        body: { email: 'test@example.com', password: 'password123', name: '홍길동' },
      };
      const res = mockRes();
      const next = jest.fn();
      const createdUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        name: '홍길동',
        theme: 'LIGHT',
        language: 'ko',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      authService.register.mockResolvedValue(createdUser);

      await authController.register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ...createdUser }));
      expect(next).not.toHaveBeenCalled();
    });

    it('authService.register가 409 에러를 throw하면 next(err)를 호출한다', async () => {
      const req = {
        body: { email: 'duplicate@example.com', password: 'password123', name: '홍길동' },
      };
      const res = mockRes();
      const next = jest.fn();
      const error = Object.assign(new Error('이미 사용 중인 이메일입니다.'), { status: 409 });

      authService.register.mockRejectedValue(error);

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('login 핸들러', () => {
    it('성공 시 res.status(200).json을 호출하고 body에 token과 user가 포함된다', async () => {
      const req = {
        body: { email: 'test@example.com', password: 'password123' },
      };
      const res = mockRes();
      const next = jest.fn();
      const loginResult = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'test@example.com',
          name: '홍길동',
          theme: 'LIGHT',
          language: 'ko',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      authService.login.mockResolvedValue(loginResult);

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ token: loginResult.token, user: loginResult.user })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('authService.login이 401 에러를 throw하면 next(err)를 호출한다', async () => {
      const req = {
        body: { email: 'test@example.com', password: 'wrongpassword' },
      };
      const res = mockRes();
      const next = jest.fn();
      const error = Object.assign(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'), {
        status: 401,
      });

      authService.login.mockRejectedValue(error);

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('logout 핸들러', () => {
    it('성공 시 res.status(200).json({ message })을 호출한다', async () => {
      const req = {};
      const res = mockRes();
      const next = jest.fn();

      await authController.logout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });
  });
});
