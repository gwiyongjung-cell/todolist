import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import * as authApiModule from '../api/authApi';

vi.mock('../api/authApi');
const mockAuthApi = vi.mocked(authApiModule.authApi);

const MOCK_USER = {
  id: 'user-uuid-1',
  email: 'new@example.com',
  name: '신규',
  theme: 'LIGHT' as const,
  language: 'ko',
  created_at: '2026-05-28T00:00:00.000Z',
  updated_at: '2026-05-28T00:00:00.000Z',
};

function renderRegisterPage() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<div>로그인 페이지</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('이름, 이메일, 비밀번호 입력 필드를 렌더링한다', () => {
      renderRegisterPage();
      expect(screen.getByPlaceholderText('이름을 입력하세요')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('이메일을 입력하세요')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('비밀번호를 입력하세요')).toBeInTheDocument();
    });

    it('가입하기 버튼을 렌더링한다', () => {
      renderRegisterPage();
      expect(screen.getByRole('button', { name: '가입하기' })).toBeInTheDocument();
    });

    it('로그인 링크를 렌더링한다', () => {
      renderRegisterPage();
      expect(screen.getByRole('link', { name: '로그인' })).toBeInTheDocument();
    });
  });

  describe('폼 유효성 검사', () => {
    it('이름 빈 상태로 제출 시 이름 에러 메시지를 표시한다', async () => {
      renderRegisterPage();
      await userEvent.type(screen.getByPlaceholderText('이메일을 입력하세요'), 'a@b.com');
      await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력하세요'), 'pw');
      await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

      expect(await screen.findByText('이름을 입력해주세요.')).toBeInTheDocument();
    });

    it('이메일 빈 상태로 제출 시 이메일 에러 메시지를 표시한다', async () => {
      renderRegisterPage();
      await userEvent.type(screen.getByPlaceholderText('이름을 입력하세요'), '홍길동');
      await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력하세요'), 'pw');
      await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

      expect(await screen.findByText('이메일을 입력해주세요.')).toBeInTheDocument();
    });

    it('비밀번호 빈 상태로 제출 시 비밀번호 에러 메시지를 표시한다', async () => {
      renderRegisterPage();
      await userEvent.type(screen.getByPlaceholderText('이름을 입력하세요'), '홍길동');
      await userEvent.type(screen.getByPlaceholderText('이메일을 입력하세요'), 'a@b.com');
      await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

      expect(await screen.findByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
    });
  });

  describe('회원가입 성공', () => {
    it('성공 시 /login으로 이동한다', async () => {
      mockAuthApi.register.mockResolvedValue(MOCK_USER);

      renderRegisterPage();
      await userEvent.type(screen.getByPlaceholderText('이름을 입력하세요'), '신규');
      await userEvent.type(screen.getByPlaceholderText('이메일을 입력하세요'), 'new@example.com');
      await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력하세요'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

      await waitFor(() => {
        expect(screen.getByText('로그인 페이지')).toBeInTheDocument();
      });
    });

    it('올바른 데이터로 register API를 호출한다', async () => {
      mockAuthApi.register.mockResolvedValue(MOCK_USER);

      renderRegisterPage();
      await userEvent.type(screen.getByPlaceholderText('이름을 입력하세요'), '신규');
      await userEvent.type(screen.getByPlaceholderText('이메일을 입력하세요'), 'new@example.com');
      await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력하세요'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

      expect(mockAuthApi.register).toHaveBeenCalledWith({
        name: '신규',
        email: 'new@example.com',
        password: 'password123',
      });
    });
  });

  describe('회원가입 실패', () => {
    it('중복 이메일(409) 시 이메일 필드에 에러 메시지를 표시한다', async () => {
      const { ApiException } = await import('../api/client');
      mockAuthApi.register.mockRejectedValue(
        new ApiException(409, '이미 사용 중인 이메일입니다.'),
      );

      renderRegisterPage();
      await userEvent.type(screen.getByPlaceholderText('이름을 입력하세요'), '중복');
      await userEvent.type(screen.getByPlaceholderText('이메일을 입력하세요'), 'dup@example.com');
      await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력하세요'), 'pw');
      await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

      expect(await screen.findByText('이미 사용 중인 이메일입니다.')).toBeInTheDocument();
    });

    it('기타 에러 시 폼 에러 메시지를 표시한다', async () => {
      const { ApiException } = await import('../api/client');
      mockAuthApi.register.mockRejectedValue(
        new ApiException(500, '서버 오류가 발생했습니다.'),
      );

      renderRegisterPage();
      await userEvent.type(screen.getByPlaceholderText('이름을 입력하세요'), '홍길동');
      await userEvent.type(screen.getByPlaceholderText('이메일을 입력하세요'), 'a@b.com');
      await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력하세요'), 'pw');
      await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('서버 오류가 발생했습니다.');
    });

    it('중복 이메일 에러 후 /login으로 이동하지 않는다', async () => {
      const { ApiException } = await import('../api/client');
      mockAuthApi.register.mockRejectedValue(new ApiException(409, '중복'));

      renderRegisterPage();
      await userEvent.type(screen.getByPlaceholderText('이름을 입력하세요'), '중복');
      await userEvent.type(screen.getByPlaceholderText('이메일을 입력하세요'), 'dup@example.com');
      await userEvent.type(screen.getByPlaceholderText('비밀번호를 입력하세요'), 'pw');
      await userEvent.click(screen.getByRole('button', { name: '가입하기' }));

      await waitFor(() => {
        expect(screen.queryByText('로그인 페이지')).not.toBeInTheDocument();
      });
    });
  });

  describe('네비게이션', () => {
    it('로그인 링크 클릭 시 /login으로 이동한다', async () => {
      renderRegisterPage();
      await userEvent.click(screen.getByRole('link', { name: '로그인' }));
      expect(screen.getByText('로그인 페이지')).toBeInTheDocument();
    });
  });
});
