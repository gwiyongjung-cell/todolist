import { describe, it, expect, vi, beforeEach } from 'vitest';
import { todoApi } from './todoApi';
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

const MOCK_TODO = {
  id: 'todo-1',
  user_id: 'user-1',
  category_id: 'cat-1',
  title: '테스트 할일',
  description: null,
  start_date: null,
  end_date: null,
  status: 'TODO' as const,
  created_at: '2026-05-28T00:00:00.000Z',
  updated_at: '2026-05-28T00:00:00.000Z',
};

describe('todoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('getAll', () => {
    it('필터 없이 GET /api/todos 호출', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, [MOCK_TODO]));

      const result = await todoApi.getAll();

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/todos');
      expect(url).not.toContain('?');
      expect(result).toHaveLength(1);
    });

    it('status 필터로 쿼리스트링 생성', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, []));

      await todoApi.getAll({ status: 'TODO' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('status=TODO');
    });

    it('category_id 필터로 쿼리스트링 생성', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, []));

      await todoApi.getAll({ category_id: 'cat-uuid-1' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('category_id=cat-uuid-1');
    });

    it('overdue=true 필터로 쿼리스트링 생성', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, []));

      await todoApi.getAll({ overdue: true });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('overdue=true');
    });

    it('복합 필터로 쿼리스트링 생성', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, []));

      await todoApi.getAll({ status: 'IN_PROGRESS', category_id: 'cat-1' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('status=IN_PROGRESS');
      expect(url).toContain('category_id=cat-1');
    });
  });

  describe('create', () => {
    it('POST /api/todos 호출하고 Todo 반환', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, MOCK_TODO));

      const result = await todoApi.create({ title: '새 할일' });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/todos');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body)).toEqual({ title: '새 할일' });
      expect(result).toEqual(MOCK_TODO);
    });

    it('제목 누락(400) 시 ApiException throw', async () => {
      mockFetch.mockResolvedValue(mockResponse(400, { message: '할일 제목은 필수입니다.' }));

      await expect(todoApi.create({ title: '' })).rejects.toBeInstanceOf(ApiException);
    });
  });

  describe('update', () => {
    it('PATCH /api/todos/:id 호출하고 수정된 Todo 반환', async () => {
      const updated = { ...MOCK_TODO, status: 'IN_PROGRESS' as const };
      mockFetch.mockResolvedValue(mockResponse(200, updated));

      const result = await todoApi.update('todo-1', { status: 'IN_PROGRESS' });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/todos/todo-1');
      expect(options.method).toBe('PATCH');
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('DONE 상태 변경 시도(400) 시 ApiException throw', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(400, { message: '완료된 할일의 상태는 변경할 수 없습니다.' })
      );

      await expect(
        todoApi.update('todo-1', { status: 'TODO' })
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('delete', () => {
    it('DELETE /api/todos/:id 호출하고 undefined 반환', async () => {
      mockFetch.mockResolvedValue({ status: 204, ok: true, json: vi.fn() } as unknown as Response);

      const result = await todoApi.delete('todo-1');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/todos/todo-1');
      expect(options.method).toBe('DELETE');
      expect(result).toBeUndefined();
    });

    it('타인 할일 삭제(403) 시 ApiException throw', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(403, { message: '할일 삭제 권한이 없습니다.' })
      );

      await expect(todoApi.delete('todo-1')).rejects.toMatchObject({ status: 403 });
    });
  });
});
