import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PrivateRoute, PublicRoute } from './PrivateRoute';
import { useAuthStore } from '../stores/authStore';

const MOCK_USER = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  name: '테스트',
  theme: 'LIGHT' as const,
  language: 'ko',
  created_at: '2026-05-28T00:00:00.000Z',
  updated_at: '2026-05-28T00:00:00.000Z',
};

function renderWithRouter(
  ui: React.ReactElement,
  { initialEntries = ['/'] }: { initialEntries?: string[] } = {},
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>로그인 페이지</div>} />
        <Route path="/todos" element={<div>할일 목록 페이지</div>} />
        <Route path="/protected" element={ui} />
        <Route path="/public" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
  });

  it('비인증 상태에서 /login으로 리다이렉트한다', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>로그인 페이지</div>} />
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <div>보호된 콘텐츠</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('로그인 페이지')).toBeInTheDocument();
    expect(screen.queryByText('보호된 콘텐츠')).not.toBeInTheDocument();
  });

  it('인증 상태에서 children을 렌더링한다', () => {
    useAuthStore.setState({
      token: 'valid-token',
      user: MOCK_USER,
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>로그인 페이지</div>} />
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <div>보호된 콘텐츠</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('보호된 콘텐츠')).toBeInTheDocument();
    expect(screen.queryByText('로그인 페이지')).not.toBeInTheDocument();
  });
});

describe('PublicRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
  });

  it('비인증 상태에서 children을 렌더링한다', () => {
    render(
      <MemoryRouter initialEntries={['/public']}>
        <Routes>
          <Route path="/todos" element={<div>할일 목록 페이지</div>} />
          <Route
            path="/public"
            element={
              <PublicRoute>
                <div>공개 콘텐츠</div>
              </PublicRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('공개 콘텐츠')).toBeInTheDocument();
    expect(screen.queryByText('할일 목록 페이지')).not.toBeInTheDocument();
  });

  it('인증 상태에서 /todos로 리다이렉트한다', () => {
    useAuthStore.setState({
      token: 'valid-token',
      user: MOCK_USER,
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/public']}>
        <Routes>
          <Route path="/todos" element={<div>할일 목록 페이지</div>} />
          <Route
            path="/public"
            element={
              <PublicRoute>
                <div>공개 콘텐츠</div>
              </PublicRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('할일 목록 페이지')).toBeInTheDocument();
    expect(screen.queryByText('공개 콘텐츠')).not.toBeInTheDocument();
  });
});
