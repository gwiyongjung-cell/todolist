import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfilePage from './ProfilePage';
import * as userApiModule from '../api/userApi';

vi.mock('../api/userApi');

const mockUserApi = vi.mocked(userApiModule.userApi);

const MOCK_USER = {
  id: 'user-1',
  email: 'test@example.com',
  name: '홍길동',
  theme: 'LIGHT' as const,
  language: 'ko',
  created_at: '',
  updated_at: '',
};

function createQC() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderProfile() {
  return render(
    <QueryClientProvider client={createQC()}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUserApi.getMe.mockResolvedValue(MOCK_USER);
  });

  it('"내 정보 수정" 제목을 표시한다', async () => {
    renderProfile();
    expect(await screen.findByText('내 정보 수정')).toBeInTheDocument();
  });

  it('현재 사용자 이름으로 이름 필드를 초기화한다', async () => {
    renderProfile();
    await waitFor(() => {
      expect(screen.getByDisplayValue('홍길동')).toBeInTheDocument();
    });
  });

  it('현재 사용자 이메일을 표시한다', async () => {
    renderProfile();
    expect(await screen.findByText('test@example.com')).toBeInTheDocument();
  });

  it('이름 빈 채로 제출 시 에러 메시지를 표시한다', async () => {
    renderProfile();
    const nameInput = await screen.findByDisplayValue('홍길동');
    await userEvent.clear(nameInput);
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByText('이름을 입력해주세요.')).toBeInTheDocument();
    expect(mockUserApi.updateProfile).not.toHaveBeenCalled();
  });

  it('이름만 변경 시 name만 포함하여 updateProfile을 호출한다', async () => {
    mockUserApi.updateProfile.mockResolvedValue({ ...MOCK_USER, name: '김철수' });
    renderProfile();

    const nameInput = await screen.findByDisplayValue('홍길동');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '김철수');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(mockUserApi.updateProfile).toHaveBeenCalledWith({ name: '김철수' });
    });
  });

  it('비밀번호 입력 시 name과 password를 포함하여 updateProfile을 호출한다', async () => {
    mockUserApi.updateProfile.mockResolvedValue(MOCK_USER);
    renderProfile();

    await screen.findByDisplayValue('홍길동');
    await userEvent.type(
      screen.getByPlaceholderText('변경할 비밀번호 (미입력 시 변경 없음)'),
      'newpass123',
    );
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(mockUserApi.updateProfile).toHaveBeenCalledWith({
        name: '홍길동',
        password: 'newpass123',
      });
    });
  });

  it('저장 성공 시 성공 메시지를 표시한다', async () => {
    mockUserApi.updateProfile.mockResolvedValue(MOCK_USER);
    renderProfile();

    await screen.findByDisplayValue('홍길동');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText('정보가 수정되었습니다.')).toBeInTheDocument();
  });

  it('저장 성공 시 비밀번호 필드가 초기화된다', async () => {
    mockUserApi.updateProfile.mockResolvedValue(MOCK_USER);
    renderProfile();

    await screen.findByDisplayValue('홍길동');
    const pwInput = screen.getByPlaceholderText('변경할 비밀번호 (미입력 시 변경 없음)');
    await userEvent.type(pwInput, 'mypassword');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(pwInput).toHaveValue('');
    });
  });

  it('API 에러 시 에러 메시지를 표시한다', async () => {
    mockUserApi.updateProfile.mockRejectedValue(new Error('서버 오류'));
    renderProfile();

    await screen.findByDisplayValue('홍길동');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByText('저장 중 오류가 발생했습니다.')).toBeInTheDocument();
  });

  it('취소(← 목록으로) 버튼이 존재한다', async () => {
    renderProfile();
    expect(await screen.findByText('← 목록으로')).toBeInTheDocument();
  });
});
