import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUiStore } from './uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    // 스토어 초기화
    useUiStore.setState({ theme: 'LIGHT', language: 'ko' });
  });

  describe('초기 상태', () => {
    it('기본 theme은 LIGHT이다', () => {
      expect(useUiStore.getState().theme).toBe('LIGHT');
    });

    it('기본 language는 ko이다', () => {
      expect(useUiStore.getState().language).toBe('ko');
    });
  });

  describe('setTheme', () => {
    it('DARK로 변경하면 theme 상태가 DARK가 된다', () => {
      useUiStore.getState().setTheme('DARK');
      expect(useUiStore.getState().theme).toBe('DARK');
    });

    it('DARK로 변경하면 document에 data-theme="dark"가 설정된다', () => {
      useUiStore.getState().setTheme('DARK');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('LIGHT로 변경하면 document에 data-theme="light"가 설정된다', () => {
      useUiStore.getState().setTheme('LIGHT');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('localStorage에 theme을 저장한다', () => {
      useUiStore.getState().setTheme('DARK');
      expect(localStorage.getItem('theme')).toBe('DARK');
    });
  });

  describe('setLanguage', () => {
    it('en으로 변경하면 language 상태가 en이 된다', () => {
      useUiStore.getState().setLanguage('en');
      expect(useUiStore.getState().language).toBe('en');
    });

    it('localStorage에 language를 저장한다', () => {
      useUiStore.getState().setLanguage('en');
      expect(localStorage.getItem('language')).toBe('en');
    });
  });

  describe('syncFromUser', () => {
    it('theme과 language를 동시에 동기화한다', () => {
      useUiStore.getState().syncFromUser('DARK', 'en');
      expect(useUiStore.getState().theme).toBe('DARK');
      expect(useUiStore.getState().language).toBe('en');
    });

    it('localStorage에 모두 저장한다', () => {
      useUiStore.getState().syncFromUser('DARK', 'en');
      expect(localStorage.getItem('theme')).toBe('DARK');
      expect(localStorage.getItem('language')).toBe('en');
    });

    it('document data-theme을 업데이트한다', () => {
      useUiStore.getState().syncFromUser('DARK', 'en');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });
});
