import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SettingsPage from './SettingsPage';
import { useUiStore } from '../stores/uiStore';
import * as userApiModule from '../api/userApi';
import i18n from '../i18n';

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

function renderSettings() {
  return render(
    <QueryClientProvider client={createQC()}>
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SettingsPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    useUiStore.setState({ theme: 'LIGHT', language: 'ko' });
    await i18n.changeLanguage('ko');
  });

  it('"환경설정" 제목을 표시한다', () => {
    renderSettings();
    expect(screen.getByText('환경설정')).toBeInTheDocument();
  });

  it('테마 버튼을 표시한다', () => {
    renderSettings();
    expect(screen.getByText('라이트 모드')).toBeInTheDocument();
    expect(screen.getByText('다크 모드')).toBeInTheDocument();
  });

  it('현재 테마(LIGHT)에서 라이트 모드 버튼이 활성화(aria-pressed=true)된다', () => {
    renderSettings();
    expect(screen.getByText('라이트 모드')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('다크 모드')).toHaveAttribute('aria-pressed', 'false');
  });

  it('다크 모드 버튼 클릭 시 테마가 DARK로 변경된다', async () => {
    renderSettings();
    await userEvent.click(screen.getByText('다크 모드'));
    expect(useUiStore.getState().theme).toBe('DARK');
  });

  it('다크 모드 클릭 시 document에 data-theme="dark"가 설정된다', async () => {
    renderSettings();
    await userEvent.click(screen.getByText('다크 모드'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('언어 선택 드롭다운을 표시한다', () => {
    renderSettings();
    expect(screen.getByRole('combobox', { name: '언어 선택' })).toBeInTheDocument();
  });

  it('언어를 English로 변경하면 uiStore language가 en이 된다', async () => {
    renderSettings();
    await userEvent.selectOptions(screen.getByRole('combobox', { name: '언어 선택' }), 'en');
    expect(useUiStore.getState().language).toBe('en');
  });

  it('저장 버튼 클릭 시 updatePreferences를 호출한다', async () => {
    mockUserApi.updatePreferences.mockResolvedValue(MOCK_USER);
    renderSettings();
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => {
      expect(mockUserApi.updatePreferences).toHaveBeenCalledWith({
        theme: 'LIGHT',
        language: 'ko',
      });
    });
  });

  it('저장 성공 시 성공 메시지를 표시한다', async () => {
    mockUserApi.updatePreferences.mockResolvedValue(MOCK_USER);
    renderSettings();
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByText('설정이 저장되었습니다.')).toBeInTheDocument();
  });

  it('저장 API 에러 시 에러 메시지를 표시한다', async () => {
    mockUserApi.updatePreferences.mockRejectedValue(new Error('서버 오류'));
    renderSettings();
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByText('저장 중 오류가 발생했습니다.')).toBeInTheDocument();
  });

  it('테마 변경 후 저장하면 변경된 테마로 updatePreferences를 호출한다', async () => {
    mockUserApi.updatePreferences.mockResolvedValue(MOCK_USER);
    renderSettings();
    await userEvent.click(screen.getByText('다크 모드'));
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() => {
      expect(mockUserApi.updatePreferences).toHaveBeenCalledWith(
        expect.objectContaining({ theme: 'DARK' })
      );
    });
  });

  it('← 목록으로 버튼이 존재한다', () => {
    renderSettings();
    expect(screen.getByText('← 목록으로')).toBeInTheDocument();
  });
});
