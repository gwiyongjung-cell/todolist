import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CategoryPage from './CategoryPage';
import * as categoryApiModule from '../api/categoryApi';

vi.mock('../api/categoryApi');
const mockCategoryApi = vi.mocked(categoryApiModule.categoryApi);

const DEFAULT_CAT = {
  id: '00000000-0000-0000-0000-000000000001',
  user_id: null,
  name: '기본',
  created_at: '2026-01-01T00:00:00.000Z',
};
const USER_CAT = {
  id: 'cat-uuid-1',
  user_id: 'user-uuid-1',
  name: '업무',
  created_at: '2026-05-28T00:00:00.000Z',
};

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderCategoryPage() {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/categories']}>
        <Routes>
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/todos" element={<div>할일 목록</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CategoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategoryApi.getAll.mockResolvedValue([DEFAULT_CAT, USER_CAT]);
  });

  describe('렌더링', () => {
    it('카테고리 목록을 표시한다', async () => {
      renderCategoryPage();
      // 기본 카테고리는 이름+배지 두 곳에 '기본' 텍스트가 있으므로 getAllByText 사용
      expect(await screen.findAllByText('기본')).toHaveLength(2);
      expect(screen.getByText('업무')).toBeInTheDocument();
    });

    it('기본 카테고리에 "기본" 배지를 표시한다', async () => {
      renderCategoryPage();
      await screen.findByText('업무'); // 로딩 대기
      const items = screen.getAllByRole('listitem');
      // 기본 카테고리 아이템: '기본' 텍스트가 2개(이름+배지)
      const defaultItem = items.find((item) => within(item).queryAllByText('기본').length === 2);
      expect(defaultItem).toBeDefined();
    });

    it('새 카테고리 입력 필드와 추가 버튼을 렌더링한다', async () => {
      renderCategoryPage();
      expect(await screen.findByPlaceholderText('새 카테고리 이름')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument();
    });

    it('"목록으로" 링크를 렌더링한다', () => {
      renderCategoryPage();
      expect(screen.getByText('← 목록으로')).toBeInTheDocument();
    });
  });

  describe('카테고리 추가', () => {
    it('이름 입력 후 추가 버튼 클릭 시 createCategory를 호출한다', async () => {
      const newCat = { ...USER_CAT, id: 'cat-uuid-2', name: '개인' };
      mockCategoryApi.create.mockResolvedValue(newCat);
      mockCategoryApi.getAll.mockResolvedValue([DEFAULT_CAT, USER_CAT, newCat]);

      renderCategoryPage();

      const input = await screen.findByPlaceholderText('새 카테고리 이름');
      await userEvent.type(input, '개인');
      await userEvent.click(screen.getByRole('button', { name: '추가' }));

      expect(mockCategoryApi.create).toHaveBeenCalledWith({ name: '개인' });
    });

    it('이름 빈 채로 추가 시 에러 메시지를 표시한다', async () => {
      renderCategoryPage();
      await screen.findByText('업무'); // 로딩 대기
      await userEvent.click(screen.getByRole('button', { name: '추가' }));

      expect(await screen.findByText('카테고리 이름을 입력해주세요.')).toBeInTheDocument();
      expect(mockCategoryApi.create).not.toHaveBeenCalled();
    });

    it('추가 성공 후 입력 필드가 초기화된다', async () => {
      mockCategoryApi.create.mockResolvedValue({ ...USER_CAT, id: 'new', name: '새항목' });

      renderCategoryPage();
      const input = await screen.findByPlaceholderText('새 카테고리 이름');
      await userEvent.type(input, '새항목');
      await userEvent.click(screen.getByRole('button', { name: '추가' }));

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });
  });

  describe('카테고리 수정', () => {
    it('사용자 카테고리의 수정 버튼 클릭 시 편집 모드로 진입한다', async () => {
      renderCategoryPage();
      const editBtn = await screen.findByRole('button', { name: '업무 수정' });
      await userEvent.click(editBtn);

      expect(screen.getByRole('textbox', { name: '카테고리 이름 수정' })).toBeInTheDocument();
    });

    it('편집 모드에서 저장 클릭 시 updateCategory를 호출한다', async () => {
      mockCategoryApi.update.mockResolvedValue({ ...USER_CAT, name: '업무수정' });

      renderCategoryPage();
      await userEvent.click(await screen.findByRole('button', { name: '업무 수정' }));

      const editInput = screen.getByRole('textbox', { name: '카테고리 이름 수정' });
      await userEvent.clear(editInput);
      await userEvent.type(editInput, '업무수정');
      await userEvent.click(screen.getByRole('button', { name: '저장' }));

      expect(mockCategoryApi.update).toHaveBeenCalledWith('cat-uuid-1', { name: '업무수정' });
    });

    it('취소 클릭 시 편집 모드에서 벗어난다', async () => {
      renderCategoryPage();
      await userEvent.click(await screen.findByRole('button', { name: '업무 수정' }));
      await userEvent.click(screen.getByRole('button', { name: '취소' }));

      expect(screen.queryByRole('textbox', { name: '카테고리 이름 수정' })).not.toBeInTheDocument();
    });
  });

  describe('카테고리 삭제', () => {
    it('사용자 카테고리의 삭제 버튼 클릭 시 deleteCategory를 호출한다', async () => {
      mockCategoryApi.delete.mockResolvedValue(undefined);

      renderCategoryPage();
      await userEvent.click(await screen.findByRole('button', { name: '업무 삭제' }));

      expect(mockCategoryApi.delete).toHaveBeenCalledWith('cat-uuid-1');
    });
  });

  describe('기본 카테고리 보호', () => {
    it('기본 카테고리 수정 버튼이 disabled 상태이다', async () => {
      renderCategoryPage();
      const editBtn = await screen.findByRole('button', { name: '기본 수정' });
      expect(editBtn).toBeDisabled();
    });

    it('기본 카테고리 삭제 버튼이 disabled 상태이다', async () => {
      renderCategoryPage();
      const deleteBtn = await screen.findByRole('button', { name: '기본 삭제' });
      expect(deleteBtn).toBeDisabled();
    });
  });

  describe('네비게이션', () => {
    it('"목록으로" 클릭 시 /todos로 이동한다', async () => {
      renderCategoryPage();
      await screen.findByText('업무');
      await userEvent.click(screen.getByText('← 목록으로'));
      expect(screen.getByText('할일 목록')).toBeInTheDocument();
    });
  });
});
