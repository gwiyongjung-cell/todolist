import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from './authApi';
import { ApiException } from './client';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockResponse(status: number, body: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

const MOCK_USER = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  name: '테스트',
  theme: 'LIGHT',
  language: 'ko',
  created_at: '2026-05-28T00:00:00.000Z',
  updated_at: '2026-05-28T00:00:00.000Z',
};

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('register', () => {
    it('POST /api/auth/register 를 호출하고 User를 반환한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, MOCK_USER));

      const result = await authApi.register({
        email: 'test@example.com',
        password: 'password123',
        name: '테스트',
      });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/auth/register');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body)).toEqual({
        email: 'test@example.com',
        password: 'password123',
        name: '테스트',
      });
      expect(result).toEqual(MOCK_USER);
    });

    it('중복 이메일(409) 시 ApiException(409)을 throw한다', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(409, { message: '이미 사용 중인 이메일입니다.' }),
      );

      await expect(
        authApi.register({ email: 'dup@example.com', password: 'pw', name: '중복' }),
      ).rejects.toMatchObject({ status: 409 });
    });

    it('필수값 누락(400) 시 ApiException(400)을 throw한다', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(400, { message: '이메일, 비밀번호, 이름은 필수 입력값입니다.' }),
      );

      await expect(
        authApi.register({ email: '', password: '', name: '' }),
      ).rejects.toBeInstanceOf(ApiException);
    });
  });

  describe('login', () => {
    it('POST /api/auth/login 을 호출하고 LoginResponse를 반환한다', async () => {
      const loginResponse = { token: 'jwt-token', user: MOCK_USER };
      mockFetch.mockResolvedValue(mockResponse(200, loginResponse));

      const result = await authApi.login({
        email: 'test@example.com',
        password: 'password123',
      });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/auth/login');
      expect(options.method).toBe('POST');
      expect(result.token).toBe('jwt-token');
      expect(result.user).toEqual(MOCK_USER);
    });

    it('잘못된 비밀번호(401) 시 ApiException(401)을 throw한다', async () => {
      // /api/auth/ 경로이므로 자동 리다이렉트 없이 throw
      mockFetch.mockResolvedValue(
        mockResponse(401, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' }),
      );

      await expect(
        authApi.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toMatchObject({ status: 401 });
    });
  });

  describe('logout', () => {
    it('POST /api/auth/logout 를 호출하고 message를 반환한다', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(200, { message: '로그아웃되었습니다.' }),
      );

      const result = await authApi.logout();

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/auth/logout');
      expect(options.method).toBe('POST');
      expect(result.message).toBe('로그아웃되었습니다.');
    });
  });
});
