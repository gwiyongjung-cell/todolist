'use strict';

describe('authMiddleware', () => {
  let authMiddleware;
  let generateToken;

  beforeAll(() => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'todolist';
    process.env.DB_USER = 'postgres';
    process.env.DB_PASSWORD = 'postgres';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '24h';

    jest.resetModules();
    authMiddleware = require('../middlewares/authMiddleware');
    ({ generateToken } = require('../utils/jwtUtils'));
  });

  describe('Authorization 헤더가 없는 경우', () => {
    it('헤더가 없으면 next(err)가 401 상태로 호출된다', () => {
      const req = { headers: {} };
      const res = {};
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(Error);
      expect(err.status).toBe(401);
    });
  });

  describe('Bearer 접두사 없이 토큰만 전달한 경우', () => {
    it('Bearer 없이 토큰만 전달하면 next(err)가 401 상태로 호출된다', () => {
      const req = { headers: { authorization: 'plain-token-without-bearer' } };
      const res = {};
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(Error);
      expect(err.status).toBe(401);
    });
  });

  describe('서명이 잘못된 토큰인 경우', () => {
    it('잘못된 서명의 토큰이면 next(err)가 401 상태로 호출된다', () => {
      const jwt = require('jsonwebtoken');
      const tokenWithWrongSecret = jwt.sign(
        { userId: 1, email: 'test@example.com' },
        'wrong-secret'
      );
      const req = { headers: { authorization: `Bearer ${tokenWithWrongSecret}` } };
      const res = {};
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(Error);
      expect(err.status).toBe(401);
    });
  });

  describe('만료된 토큰인 경우', () => {
    it('만료된 토큰이면 next(err)가 401 상태로 호출된다', () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: 1, email: 'test@example.com' },
        'test-secret',
        { expiresIn: '-1s' }
      );
      const req = { headers: { authorization: `Bearer ${expiredToken}` } };
      const res = {};
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(Error);
      expect(err.status).toBe(401);
    });
  });

  describe('유효한 토큰인 경우', () => {
    it('유효한 토큰이면 next()가 에러 없이 호출된다', () => {
      const token = generateToken({ userId: 1, email: 'user@example.com' });
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = {};
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('유효한 토큰이면 req.user에 userId와 email이 정확히 주입된다', () => {
      const payload = { userId: 42, email: 'hello@example.com' };
      const token = generateToken(payload);
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = {};
      const next = jest.fn();

      authMiddleware(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe(payload.userId);
      expect(req.user.email).toBe(payload.email);
    });
  });
});
