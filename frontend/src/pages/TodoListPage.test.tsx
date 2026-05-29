import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoListPage from './TodoListPage';
import { useAuthStore } from '../stores/authStore';
import * as todoApiModule from '../api/todoApi';
import * as categoryApiModule from '../api/categoryApi';
import * as authApiModule from '../api/authApi';

vi.mock('../api/todoApi');
vi.mock('../api/categoryApi');
vi.mock('../api/authApi');

const mockTodoApi = vi.mocked(todoApiModule.todoApi);
const mockCategoryApi = vi.mocked(categoryApiModule.categoryApi);
const mockAuthApi = vi.mocked(authApiModule.authApi);

const DEFAULT_CAT = { id: '00000000-0000-0000-0000-000000000001', user_id: null, name: '기본', created_at: '' };
const USER_CAT = { id: 'cat-1', user_id: 'u-1', name: '업무', created_at: '' };

const TODO_TODO = {
  id: 'todo-1', user_id: 'u-1', category_id: 'cat-1',
  title: '회의 준비', description: null,
  start_date: null, end_date: null,
  status: 'TODO' as const, created_at: '', updated_at: '',
};
const TODO_DONE = {
  id: 'todo-2', user_id: 'u-1', category_id: DEFAULT_CAT.id,
  title: '완료된 할일', description: null,
  start_date: null, end_date: null,
  status: 'DONE' as const, created_at: '', updated_at: '',
};
const TODO_OVERDUE = {
  id: 'todo-3', user_id: 'u-1', category_id: 'cat-1',
  title: '기한 초과 항목', description: null,
  start_date: null, end_date: '2020-01-01T00:00:00.000Z',
  status: 'TODO' as const, created_at: '', updated_at: '',
};

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderTodoListPage() {
  const queryClient = createQueryClient();
  useAuthStore.setState({ token: 'tok', user: null, isAuthenticated: true });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/todos']}>
        <Routes>
          <Route path="/todos" element={<TodoListPage />} />
          <Route path="/todos/new" element={<div>새 할일 폼</div>} />
          <Route path="/todos/:id/edit" element={<div>수정 폼</div>} />
          <Route path="/categories" element={<div>카테고리 페이지</div>} />
          <Route path="/profile" element={<div>프로필 페이지</div>} />
          <Route path="/login" element={<div>로그인 페이지</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TodoListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategoryApi.getAll.mockResolvedValue([DEFAULT_CAT, USER_CAT]);
    mockTodoApi.getAll.mockResolvedValue([TODO_TODO, TODO_DONE]);
  });

  describe('렌더링', () => {
    it('할일 목록을 표시한다', async () => {
      renderTodoListPage();
      expect(await screen.findByText('회의 준비')).toBeInTheDocument();
      expect(screen.getByText('완료된 할일')).toBeInTheDocument();
    });

    it('할일이 없을 때 빈 상태 메시지를 표시한다', async () => {
      mockTodoApi.getAll.mockResolvedValue([]);
      renderTodoListPage();
      expect(await screen.findByText('할일이 없습니다.')).toBeInTheDocument();
    });

    it('상태 배지(대기, 완료)를 표시한다', async () => {
      renderTodoListPage();
      await screen.findByText('회의 준비');
      // 필터 버튼 + 배지 모두 포함
      expect(screen.getAllByText('대기').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('완료').length).toBeGreaterThanOrEqual(1);
    });

    it('카테고리 필터 select를 렌더링한다', async () => {
      renderTodoListPage();
      expect(await screen.findByRole('combobox', { name: '카테고리 필터' })).toBeInTheDocument();
    });

    it('상태 필터 버튼들을 렌더링한다', async () => {
      renderTodoListPage();
      await screen.findByText('회의 준비');
      expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '대기' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '진행중' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '완료' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '기한 초과' })).toBeInTheDocument();
    });

    it('기한 초과 항목에 강조 스타일이 적용된다', async () => {
      mockTodoApi.getAll.mockResolvedValue([TODO_OVERDUE]);
      renderTodoListPage();
      const item = await screen.findByText('기한 초과 항목');
      expect(item.closest('li')).toHaveClass('border-l-danger');
    });

    it('완료된 할일 제목에 취소선이 적용된다', async () => {
      renderTodoListPage();
      const doneTitle = await screen.findByText('완료된 할일');
      expect(doneTitle).toHaveClass('line-through');
    });
  });

  describe('필터 동작', () => {
    it('상태 필터 버튼 클릭 시 getTodos를 해당 status로 호출한다', async () => {
      renderTodoListPage();
      await screen.findByText('회의 준비');
      await userEvent.click(screen.getByRole('button', { name: '대기' }));

      await waitFor(() => {
        expect(mockTodoApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'TODO' })
        );
      });
    });

    it('기한 초과 버튼 클릭 시 overdue=true로 호출한다', async () => {
      renderTodoListPage();
      await screen.findByText('회의 준비');
      await userEvent.click(screen.getByRole('button', { name: '기한 초과' }));

      await waitFor(() => {
        expect(mockTodoApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ overdue: true })
        );
      });
    });

    it('카테고리 필터 변경 시 category_id 파라미터로 호출한다', async () => {
      renderTodoListPage();
      await screen.findByText('회의 준비');
      const select = screen.getByRole('combobox', { name: '카테고리 필터' });
      await userEvent.selectOptions(select, 'cat-1');

      await waitFor(() => {
        expect(mockTodoApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ category_id: 'cat-1' })
        );
      });
    });
  });

  describe('네비게이션', () => {
    it('새 할일 버튼 클릭 시 /todos/new로 이동한다', async () => {
      renderTodoListPage();
      await screen.findByText('회의 준비');
      await userEvent.click(screen.getByRole('button', { name: '+ 새 할일' }));
      expect(screen.getByText('새 할일 폼')).toBeInTheDocument();
    });

    it('할일 항목 클릭 시 /todos/:id/edit로 이동한다', async () => {
      renderTodoListPage();
      const item = await screen.findByText('회의 준비');
      await userEvent.click(item.closest('li')!);
      expect(screen.getByText('수정 폼')).toBeInTheDocument();
    });

    it('카테고리 버튼 클릭 시 /categories로 이동한다', async () => {
      renderTodoListPage();
      await userEvent.click(screen.getByRole('button', { name: '카테고리' }));
      expect(screen.getByText('카테고리 페이지')).toBeInTheDocument();
    });
  });

  describe('할일 삭제', () => {
    it('삭제 버튼 클릭 + 확인 시 deleteTodo를 호출한다', async () => {
      mockTodoApi.delete.mockResolvedValue(undefined);
      vi.stubGlobal('confirm', () => true);

      renderTodoListPage();
      const deleteBtn = await screen.findByRole('button', { name: '회의 준비 삭제' });
      await userEvent.click(deleteBtn);

      expect(mockTodoApi.delete).toHaveBeenCalledWith('todo-1');
    });

    it('삭제 취소 시 deleteTodo를 호출하지 않는다', async () => {
      vi.stubGlobal('confirm', () => false);

      renderTodoListPage();
      const deleteBtn = await screen.findByRole('button', { name: '회의 준비 삭제' });
      await userEvent.click(deleteBtn);

      expect(mockTodoApi.delete).not.toHaveBeenCalled();
    });
  });

  describe('로그아웃', () => {
    it('로그아웃 클릭 시 clearAuth 후 /login으로 이동한다', async () => {
      mockAuthApi.logout.mockResolvedValue({ message: '로그아웃되었습니다.' });

      renderTodoListPage();
      await screen.findByText('회의 준비');
      await userEvent.click(screen.getByRole('button', { name: '로그아웃' }));

      await waitFor(() => {
        expect(screen.getByText('로그인 페이지')).toBeInTheDocument();
      });
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });
});
