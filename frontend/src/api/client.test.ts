import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiException, apiClient } from './client';

// fetch 모킹
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// import.meta.env 모킹
vi.stubGlobal('import', {
  meta: { env: { VITE_API_BASE_URL: 'http://localhost:3000' } },
});

function mockResponse(status: number, body?: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: vi.fn().mockResolvedValue(body ?? {}),
  } as unknown as Response;
}

describe('ApiException', () => {
  it('status와 message를 올바르게 저장한다', () => {
    const err = new ApiException(404, '찾을 수 없습니다.');
    expect(err.status).toBe(404);
    expect(err.message).toBe('찾을 수 없습니다.');
    expect(err.name).toBe('ApiException');
  });

  it('Error를 상속한다', () => {
    const err = new ApiException(500, '서버 오류');
    expect(err instanceof Error).toBe(true);
  });
});

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('정상 응답 처리', () => {
    it('200 응답 시 JSON 데이터를 반환한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, { id: '1', title: '테스트' }));

      const result = await apiClient.get('/api/todos');
      expect(result).toEqual({ id: '1', title: '테스트' });
    });

    it('204 응답 시 undefined를 반환하고 json()을 호출하지 않는다', async () => {
      const jsonMock = vi.fn();
      mockFetch.mockResolvedValue({
        status: 204,
        ok: true,
        json: jsonMock,
      } as unknown as Response);

      const result = await apiClient.delete('/api/todos/1');
      expect(result).toBeUndefined();
      expect(jsonMock).not.toHaveBeenCalled();
    });

    it('201 응답 시 생성된 데이터를 반환한다', async () => {
      const created = { id: 'new-uuid', title: '새 할일' };
      mockFetch.mockResolvedValue(mockResponse(201, created));

      const result = await apiClient.post('/api/todos', { title: '새 할일' });
      expect(result).toEqual(created);
    });
  });

  describe('인증 헤더', () => {
    it('토큰이 있을 때 Authorization 헤더를 포함한다', async () => {
      localStorage.setItem('token', 'test-jwt-token');
      mockFetch.mockResolvedValue(mockResponse(200, []));

      await apiClient.get('/api/todos');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Authorization']).toBe('Bearer test-jwt-token');
    });

    it('토큰이 없을 때 Authorization 헤더를 포함하지 않는다', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, []));

      await apiClient.get('/api/todos');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['Authorization']).toBeUndefined();
    });
  });

  describe('에러 처리', () => {
    it('400 응답 시 ApiException을 throw한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(400, { message: '입력 오류' }));

      await expect(apiClient.post('/api/todos', {})).rejects.toThrow(ApiException);
      await expect(apiClient.post('/api/todos', {})).rejects.toMatchObject({
        status: 400,
        message: '입력 오류',
      });
    });

    it('403 응답 시 ApiException(403)을 throw한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(403, { message: '권한 없음' }));

      await expect(apiClient.delete('/api/todos/1')).rejects.toMatchObject({
        status: 403,
        message: '권한 없음',
      });
    });

    it('404 응답 시 ApiException(404)을 throw한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(404, { message: '찾을 수 없습니다.' }));

      await expect(apiClient.get('/api/todos/non-existent')).rejects.toMatchObject({
        status: 404,
      });
    });

    it('응답에 message가 없으면 기본 오류 메시지를 사용한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}));

      await expect(apiClient.get('/api/todos')).rejects.toMatchObject({
        status: 500,
        message: '오류가 발생했습니다.',
      });
    });
  });

  describe('401 자동 처리', () => {
    it('/api/auth/ 경로의 401은 리다이렉트하지 않고 ApiException throw', async () => {
      mockFetch.mockResolvedValue(mockResponse(401, { message: '잘못된 비밀번호' }));
      const originalHref = window.location.href;

      await expect(apiClient.post('/api/auth/login', {})).rejects.toMatchObject({
        status: 401,
      });
      expect(window.location.href).toBe(originalHref);
    });

    it('보호 경로의 401은 토큰을 삭제한다', async () => {
      localStorage.setItem('token', 'expired-token');
      mockFetch.mockResolvedValue(mockResponse(401, { message: '인증 만료' }));

      try {
        await apiClient.get('/api/todos');
      } catch {}

      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('HTTP 메서드', () => {
    it('post는 POST 메서드와 JSON body를 사용한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, {}));

      await apiClient.post('/api/todos', { title: '할일' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
      expect(options.body).toBe(JSON.stringify({ title: '할일' }));
    });

    it('patch는 PATCH 메서드를 사용한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, {}));

      await apiClient.patch('/api/todos/1', { status: 'DONE' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('PATCH');
    });

    it('delete는 DELETE 메서드를 사용한다', async () => {
      mockFetch.mockResolvedValue(mockResponse(204));

      await apiClient.delete('/api/todos/1');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('DELETE');
    });
  });
});
