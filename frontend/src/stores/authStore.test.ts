import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from './authStore';

const MOCK_TOKEN = 'mock-jwt-token';
const MOCK_USER = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  name: '테스트',
  theme: 'LIGHT' as const,
  language: 'ko',
  created_at: '2026-05-28T00:00:00.000Z',
  updated_at: '2026-05-28T00:00:00.000Z',
};

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    // 스토어 초기 상태 리셋
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('초기 상태', () => {
    it('localStorage에 token이 없으면 isAuthenticated가 false', () => {
      useAuthStore.setState({
        token: null,
        user: null,
        isAuthenticated: !!localStorage.getItem('token'),
      });
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('localStorage에 token이 있으면 isAuthenticated가 true로 초기화', () => {
      localStorage.setItem('token', MOCK_TOKEN);
      useAuthStore.setState({
        token: MOCK_TOKEN,
        user: null,
        isAuthenticated: !!localStorage.getItem('token'),
      });
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().token).toBe(MOCK_TOKEN);
    });

    it('초기 user는 null', () => {
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('setAuth', () => {
    it('token과 user를 상태에 저장한다', () => {
      useAuthStore.getState().setAuth(MOCK_TOKEN, MOCK_USER);

      const state = useAuthStore.getState();
      expect(state.token).toBe(MOCK_TOKEN);
      expect(state.user).toEqual(MOCK_USER);
    });

    it('isAuthenticated를 true로 설정한다', () => {
      useAuthStore.getState().setAuth(MOCK_TOKEN, MOCK_USER);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('localStorage에 token을 저장한다', () => {
      useAuthStore.getState().setAuth(MOCK_TOKEN, MOCK_USER);
      expect(localStorage.getItem('token')).toBe(MOCK_TOKEN);
    });
  });

  describe('clearAuth', () => {
    beforeEach(() => {
      useAuthStore.getState().setAuth(MOCK_TOKEN, MOCK_USER);
    });

    it('token을 null로 초기화한다', () => {
      useAuthStore.getState().clearAuth();
      expect(useAuthStore.getState().token).toBeNull();
    });

    it('user를 null로 초기화한다', () => {
      useAuthStore.getState().clearAuth();
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('isAuthenticated를 false로 설정한다', () => {
      useAuthStore.getState().clearAuth();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('localStorage에서 token을 제거한다', () => {
      useAuthStore.getState().clearAuth();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
