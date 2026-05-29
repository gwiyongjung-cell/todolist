import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userApi } from './userApi';
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
  id: 'user-1',
  email: 'test@example.com',
  name: '홍길동',
  theme: 'LIGHT',
  language: 'ko',
  created_at: '2026-05-29T00:00:00.000Z',
  updated_at: '2026-05-29T00:00:00.000Z',
};

describe('userApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('getMe', () => {
    it('GET /api/users/me를 호출하고 User를 반환한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, MOCK_USER));

      const result = await userApi.getMe();

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/users/me');
      expect(result).toEqual(MOCK_USER);
    });

    it('401 시 ApiException(401)을 throw한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(401, { message: '인증이 필요합니다.' }));
      await expect(userApi.getMe()).rejects.toMatchObject({ status: 401 });
    });

    it('404 시 ApiException(404)을 throw한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(404, { message: '사용자를 찾을 수 없습니다.' }));
      await expect(userApi.getMe()).rejects.toBeInstanceOf(ApiException);
    });
  });

  describe('updateProfile', () => {
    it('PATCH /api/users/me를 호출하고 업데이트된 User를 반환한다', async () => {
      const updated = { ...MOCK_USER, name: '김철수' };
      mockFetch.mockResolvedValue(mockResponse(200, updated));

      const result = await userApi.updateProfile({ name: '김철수' });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/users/me');
      expect(options.method).toBe('PATCH');
      expect(JSON.parse(options.body)).toEqual({ name: '김철수' });
      expect(result).toEqual(updated);
    });

    it('name과 password를 함께 전달할 수 있다', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, MOCK_USER));

      await userApi.updateProfile({ name: '홍길동', password: 'newpass123' });

      const [, options] = mockFetch.mock.calls[0];
      expect(JSON.parse(options.body)).toEqual({ name: '홍길동', password: 'newpass123' });
    });

    it('password만 전달할 수 있다', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, MOCK_USER));

      await userApi.updateProfile({ password: 'newpass123' });

      const [, options] = mockFetch.mock.calls[0];
      expect(JSON.parse(options.body)).toEqual({ password: 'newpass123' });
    });

    it('400 시 ApiException(400)을 throw한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(400, { message: '수정할 항목이 없습니다.' }));
      await expect(userApi.updateProfile({})).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('updatePreferences', () => {
    it('PATCH /api/users/me/preferences를 호출하고 User를 반환한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, MOCK_USER));

      const result = await userApi.updatePreferences({ theme: 'DARK', language: 'en' });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/users/me/preferences');
      expect(options.method).toBe('PATCH');
      expect(JSON.parse(options.body)).toEqual({ theme: 'DARK', language: 'en' });
      expect(result).toEqual(MOCK_USER);
    });

    it('theme만 전달할 수 있다', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, MOCK_USER));

      await userApi.updatePreferences({ theme: 'LIGHT' });

      const [, options] = mockFetch.mock.calls[0];
      expect(JSON.parse(options.body)).toEqual({ theme: 'LIGHT' });
    });

    it('유효하지 않은 theme(400) 시 ApiException을 throw한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(400, { message: '유효하지 않은 테마 값입니다.' }));
      await expect(userApi.updatePreferences({ theme: 'DARK' })).rejects.toBeInstanceOf(ApiException);
    });
  });
});
