'use strict';

describe('jwtUtils', () => {
  let generateToken;
  let verifyToken;

  beforeAll(() => {
    // env.js의 필수 환경변수 전체 설정
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '5432';
    process.env.DB_NAME = 'todolist';
    process.env.DB_USER = 'postgres';
    process.env.DB_PASSWORD = 'postgres';
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '24h';
    // 환경변수 설정 후 require (캐시 방지)
    jest.resetModules();
    ({ generateToken, verifyToken } = require('../utils/jwtUtils'));
  });

  describe('generateToken({ userId, email })', () => {
    it('문자열 토큰을 반환해야 한다', () => {
      const token = generateToken({ userId: 1, email: 'test@example.com' });
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('JWT 형식(3개 점으로 구분된 세그먼트)이어야 한다', () => {
      const token = generateToken({ userId: 1, email: 'test@example.com' });
      const parts = token.split('.');
      expect(parts).toHaveLength(3);
    });

    it('페이로드에 userId가 포함되어야 한다', () => {
      const token = generateToken({ userId: 42, email: 'test@example.com' });
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(42);
    });

    it('페이로드에 email이 포함되어야 한다', () => {
      const token = generateToken({ userId: 1, email: 'user@example.com' });
      const decoded = verifyToken(token);
      expect(decoded.email).toBe('user@example.com');
    });

    it('userId와 email이 모두 페이로드에 포함되어야 한다', () => {
      const payload = { userId: 99, email: 'admin@example.com' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });
  });

  describe('verifyToken(token)', () => {
    it('유효한 토큰에서 페이로드를 반환해야 한다', () => {
      const payload = { userId: 10, email: 'valid@example.com' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      expect(decoded).toBeTruthy();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('위조된 토큰에서 에러를 throw해야 한다', () => {
      const fakeToken = 'invalid.token.value';
      expect(() => verifyToken(fakeToken)).toThrow();
    });

    it('다른 secret으로 서명된 토큰에서 에러를 throw해야 한다', () => {
      const jwt = require('jsonwebtoken');
      const tokenWithWrongSecret = jwt.sign(
        { userId: 1, email: 'test@example.com' },
        'wrong-secret'
      );
      expect(() => verifyToken(tokenWithWrongSecret)).toThrow();
    });

    it('빈 문자열 토큰에서 에러를 throw해야 한다', () => {
      expect(() => verifyToken('')).toThrow();
    });

    it('만료된 토큰에서 에러를 throw해야 한다', () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: 1, email: 'test@example.com' },
        'test-secret',
        { expiresIn: '-1s' }
      );
      expect(() => verifyToken(expiredToken)).toThrow();
    });
  });
});
