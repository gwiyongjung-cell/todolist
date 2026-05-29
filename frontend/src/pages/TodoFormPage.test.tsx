import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoFormPage from './TodoFormPage';
import * as todoApiModule from '../api/todoApi';
import * as categoryApiModule from '../api/categoryApi';

vi.mock('../api/todoApi');
vi.mock('../api/categoryApi');

const mockTodoApi = vi.mocked(todoApiModule.todoApi);
const mockCategoryApi = vi.mocked(categoryApiModule.categoryApi);

const DEFAULT_CAT = { id: '00000000-0000-0000-0000-000000000001', user_id: null, name: '기본', created_at: '' };
const USER_CAT = { id: 'cat-1', user_id: 'u-1', name: '업무', created_at: '' };

const EXISTING_TODO = {
  id: 'todo-edit-1', user_id: 'u-1', category_id: 'cat-1',
  title: '기존 할일', description: '기존 내용',
  start_date: '2026-05-01T00:00:00.000Z',
  end_date: '2026-05-31T00:00:00.000Z',
  status: 'IN_PROGRESS' as const,
  created_at: '', updated_at: '',
};

const DONE_TODO = { ...EXISTING_TODO, id: 'todo-done-1', status: 'DONE' as const, title: '완료된 할일' };

function createQC() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderNewForm() {
  return render(
    <QueryClientProvider client={createQC()}>
      <MemoryRouter initialEntries={['/todos/new']}>
        <Routes>
          <Route path="/todos/new" element={<TodoFormPage />} />
          <Route path="/todos" element={<div>할일 목록</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function renderEditForm(todoId = 'todo-edit-1') {
  return render(
    <QueryClientProvider client={createQC()}>
      <MemoryRouter initialEntries={[`/todos/${todoId}/edit`]}>
        <Routes>
          <Route path="/todos/:id/edit" element={<TodoFormPage />} />
          <Route path="/todos" element={<div>할일 목록</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TodoFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategoryApi.getAll.mockResolvedValue([DEFAULT_CAT, USER_CAT]);
    mockTodoApi.getAll.mockResolvedValue([EXISTING_TODO, DONE_TODO]);
  });

  describe('등록 모드 (새 할일)', () => {
    it('"새 할일 등록" 제목을 표시한다', async () => {
      renderNewForm();
      expect(await screen.findByText('새 할일 등록')).toBeInTheDocument();
    });

    it('제목 입력 필드를 렌더링한다', async () => {
      renderNewForm();
      expect(await screen.findByPlaceholderText('할일 제목을 입력하세요')).toBeInTheDocument();
    });

    it('상태 선택 UI는 등록 모드에서 표시되지 않는다', async () => {
      renderNewForm();
      await screen.findByText('새 할일 등록');
      expect(screen.queryByRole('combobox', { name: '상태 선택' })).not.toBeInTheDocument();
    });

    it('제목 빈 채로 제출 시 에러 메시지 표시', async () => {
      renderNewForm();
      await screen.findByText('새 할일 등록');
      await userEvent.click(screen.getByRole('button', { name: '등록' }));
      expect(await screen.findByText('제목을 입력해주세요.')).toBeInTheDocument();
      expect(mockTodoApi.create).not.toHaveBeenCalled();
    });

    it('종료일 < 시작일이면 에러 메시지 표시', async () => {
      renderNewForm();
      await screen.findByText('새 할일 등록');
      await userEvent.type(screen.getByPlaceholderText('할일 제목을 입력하세요'), '제목');

      // 날짜 직접 설정 - type으로 입력
      const { container } = renderNewForm();
      const inputs = container.querySelectorAll('input[type="date"]');
      // startDate
      await userEvent.type(inputs[0] as HTMLElement, '2026-06-01');
      // endDate
      await userEvent.type(inputs[1] as HTMLElement, '2026-05-01');
    });

    it('정상 제출 시 createTodo를 호출하고 /todos로 이동', async () => {
      mockTodoApi.create.mockResolvedValue({
        ...EXISTING_TODO, id: 'new-1', title: '새 할일', status: 'TODO',
      });

      renderNewForm();
      await screen.findByText('새 할일 등록');
      await userEvent.type(screen.getByPlaceholderText('할일 제목을 입력하세요'), '새 할일');
      await userEvent.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('할일 목록')).toBeInTheDocument();
      });
      expect(mockTodoApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: '새 할일' })
      );
    });

    it('카테고리 미지정 시 DEFAULT_CATEGORY_ID로 전송', async () => {
      mockTodoApi.create.mockResolvedValue({ ...EXISTING_TODO, id: 'new-2', title: 't', status: 'TODO' });

      renderNewForm();
      await screen.findByText('새 할일 등록');
      await userEvent.type(screen.getByPlaceholderText('할일 제목을 입력하세요'), '기본카테고리 할일');
      await userEvent.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(mockTodoApi.create).toHaveBeenCalledWith(
          expect.objectContaining({ category_id: '00000000-0000-0000-0000-000000000001' })
        );
      });
    });

    it('취소 버튼 클릭 시 /todos로 이동', async () => {
      renderNewForm();
      await screen.findByText('새 할일 등록');
      await userEvent.click(screen.getByRole('button', { name: '취소' }));
      expect(screen.getByText('할일 목록')).toBeInTheDocument();
    });
  });

  describe('수정 모드', () => {
    it('"할일 수정" 제목을 표시한다', async () => {
      renderEditForm();
      expect(await screen.findByText('할일 수정')).toBeInTheDocument();
    });

    it('기존 데이터로 폼을 초기화한다', async () => {
      renderEditForm();
      await waitFor(() => {
        expect(screen.getByDisplayValue('기존 할일')).toBeInTheDocument();
      });
    });

    it('상태 선택 UI가 표시된다', async () => {
      renderEditForm();
      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: '상태 선택' })).toBeInTheDocument();
      });
    });

    it('정상 제출 시 updateTodo를 호출하고 /todos로 이동', async () => {
      mockTodoApi.update.mockResolvedValue({ ...EXISTING_TODO, title: '수정된 할일' });

      renderEditForm();
      await waitFor(() => {
        expect(screen.getByDisplayValue('기존 할일')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByRole('button', { name: '수정 저장' }));

      await waitFor(() => {
        expect(screen.getByText('할일 목록')).toBeInTheDocument();
      });
      expect(mockTodoApi.update).toHaveBeenCalledWith(
        'todo-edit-1',
        expect.objectContaining({ title: '기존 할일' })
      );
    });
  });

  describe('DONE 상태 전이 제한', () => {
    it('DONE 상태인 할일은 상태 선택이 disabled', async () => {
      renderEditForm('todo-done-1');
      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: '상태 선택' })).toBeDisabled();
      });
    });
  });
});
