import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import { useAuthStore } from '../stores/authStore';
import * as authApiModule from '../api/authApi';

vi.mock('../api/authApi');
const mockAuthApi = vi.mocked(authApiModule.authApi);

const MOCK_USER = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  name: '테스트',
  theme: 'LIGHT' as const,
  language: 'ko',
  created_at: '2026-05-28T00:00:00.000Z',
  updated_at: '2026-05-28T00:00:00.000Z',
};

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/todos" element={<div>할일 목록 페이지</div>} />
        <Route path="/register" element={<div>회원가입 페이지</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
  });

  describe('렌더링', () => {
    it('이메일, 비밀번호 입력 필드를 렌더링한다', () => {
      renderLoginPage();
      expect(screen.getByPlaceholderText('이메일을 입력하세요')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('비밀번호를 입력하세요')).toBeInTheDocument();
    });

    it('로그인 버튼을 렌더링한다', () => {
      renderLoginPage();
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    });

    it('회원가입 링크를 렌더링한다', () => {
      renderLoginPage();
      expect(screen.getByRole('link', { name: '회원가입' })).toBeInTheDocument();
    });
  });

  describe('폼 유효성 검사', () => {
    it('이메일/비밀번호 빈 상태로 제출 시 에러 메시지를 표시한다', async () => {
      renderLoginPage();
      await userEvent.click(screen.getByRole('button', { name: '로그인' }));
      expect(await screen.findByRole('alert')).toHaveTextContent(
        '이메일과 비밀번호를 입력해주세요.',
      );
    });
  });

  describe('로그인 성공', () => {
    it('성공 시 authStore.setAuth가 호출되고 /todos로 이동한다', async () => {
      mockAuthApi.login.mockResolvedValue({ token: 'mock-token', user: MOCK_USER });

      renderLoginPage();

      await userEvent.type(screen.getByPlaceholderText('이메일을 입력하세요'), 'test@example.com');
      await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력하세요'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: '로그인' }));

      await waitFor(() => {
        expect(screen.getByText('할일 목록 페이지')).toBeInTheDocument();
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().token).toBe('mock-token');
    });

    it('로딩 중일 때 버튼이 비활성화된다', async () => {
      let resolve: (v: { token: string; user: typeof MOCK_USER }) => void;
      mockAuthApi.login.mockReturnValue(
        new Promise((r) => { resolve = r; }),
      );

      renderLoginPage();
      await userEvent.type(screen.getByPlaceholderText('이메일을 입력하세요'), 'test@example.com');
      await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력하세요'), 'pw');
      await userEvent.click(screen.getByRole('button', { name: '로그인' }));

      expect(screen.getByRole('button')).toBeDisabled();
      resolve!({ token: 't', user: MOCK_USER });
    });
  });

  describe('로그인 실패', () => {
    it('401 에러 시 에러 메시지를 표시한다', async () => {
      const { ApiException } = await import('../api/client');
      mockAuthApi.login.mockRejectedValue(
        new ApiException(401, '이메일 또는 비밀번호가 올바르지 않습니다.'),
      );

      renderLoginPage();
      await userEvent.type(screen.getByPlaceholderText('이메일을 입력하세요'), 'test@example.com');
      await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력하세요'), 'wrong');
      await userEvent.click(screen.getByRole('button', { name: '로그인' }));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    });

    it('에러 후 /todos로 이동하지 않는다', async () => {
      const { ApiException } = await import('../api/client');
      mockAuthApi.login.mockRejectedValue(new ApiException(401, '오류'));

      renderLoginPage();
      await userEvent.type(screen.getByPlaceholderText('이메일을 입력하세요'), 'a@b.com');
      await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력하세요'), 'pw');
      await userEvent.click(screen.getByRole('button', { name: '로그인' }));

      await waitFor(() => {
        expect(screen.queryByText('할일 목록 페이지')).not.toBeInTheDocument();
      });
    });
  });

  describe('네비게이션', () => {
    it('회원가입 링크 클릭 시 /register로 이동한다', async () => {
      renderLoginPage();
      await userEvent.click(screen.getByRole('link', { name: '회원가입' }));
      expect(screen.getByText('회원가입 페이지')).toBeInTheDocument();
    });
  });
});
