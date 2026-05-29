import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoryApi } from './categoryApi';
import { ApiException } from './client';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockResponse(status: number, body?: unknown): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: vi.fn().mockResolvedValue(body ?? {}),
  } as unknown as Response;
}

const MOCK_CATEGORY = { id: 'cat-1', user_id: 'user-1', name: '업무', created_at: '2026-05-28T00:00:00.000Z' };
const DEFAULT_CATEGORY = { id: '00000000-0000-0000-0000-000000000001', user_id: null, name: '기본', created_at: '2026-01-01T00:00:00.000Z' };

describe('categoryApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('getAll', () => {
    it('GET /api/categories 를 호출하고 Category[] 반환', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, [DEFAULT_CATEGORY, MOCK_CATEGORY]));

      const result = await categoryApi.getAll();

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/categories');
      expect(result).toHaveLength(2);
      expect(result[0].user_id).toBeNull();
    });
  });

  describe('create', () => {
    it('POST /api/categories 를 호출하고 생성된 Category 반환', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, MOCK_CATEGORY));

      const result = await categoryApi.create({ name: '업무' });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/categories');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body)).toEqual({ name: '업무' });
      expect(result).toEqual(MOCK_CATEGORY);
    });

    it('이름 누락(400) 시 ApiException throw', async () => {
      mockFetch.mockResolvedValue(mockResponse(400, { message: '카테고리 이름은 필수입니다.' }));

      await expect(categoryApi.create({ name: '' })).rejects.toBeInstanceOf(ApiException);
    });
  });

  describe('update', () => {
    it('PATCH /api/categories/:id 를 호출하고 수정된 Category 반환', async () => {
      const updated = { ...MOCK_CATEGORY, name: '수정됨' };
      mockFetch.mockResolvedValue(mockResponse(200, updated));

      const result = await categoryApi.update('cat-1', { name: '수정됨' });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/categories/cat-1');
      expect(options.method).toBe('PATCH');
      expect(result.name).toBe('수정됨');
    });

    it('기본 카테고리 수정 시도(403) 시 ApiException throw', async () => {
      mockFetch.mockResolvedValue(mockResponse(403, { message: '기본 카테고리는 수정할 수 없습니다.' }));

      await expect(
        categoryApi.update('00000000-0000-0000-0000-000000000001', { name: '시도' })
      ).rejects.toMatchObject({ status: 403 });
    });
  });

  describe('delete', () => {
    it('DELETE /api/categories/:id 를 호출하고 undefined 반환(204)', async () => {
      mockFetch.mockResolvedValue({ status: 204, ok: true, json: vi.fn() } as unknown as Response);

      const result = await categoryApi.delete('cat-1');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/categories/cat-1');
      expect(options.method).toBe('DELETE');
      expect(result).toBeUndefined();
    });

    it('기본 카테고리 삭제 시도(403) 시 ApiException throw', async () => {
      mockFetch.mockResolvedValue(mockResponse(403, { message: '기본 카테고리는 삭제할 수 없습니다.' }));

      await expect(
        categoryApi.delete('00000000-0000-0000-0000-000000000001')
      ).rejects.toMatchObject({ status: 403 });
    });
  });
});
