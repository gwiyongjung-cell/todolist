import { create } from 'zustand';
import i18n from '../i18n';

type Theme = 'LIGHT' | 'DARK';

interface UiState {
  theme: Theme;
  language: string;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: string) => void;
  syncFromUser: (theme: Theme, language: string) => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme === 'DARK' ? 'dark' : 'light');
}

const storedTheme = (localStorage.getItem('theme') as Theme) || 'LIGHT';
const storedLanguage = localStorage.getItem('language') || 'ko';

export const useUiStore = create<UiState>((set) => ({
  theme: storedTheme,
  language: storedLanguage,

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    set({ theme });
  },

  setLanguage: (language) => {
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
    set({ language });
  },

  syncFromUser: (theme, language) => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('language', language);
    applyTheme(theme);
    i18n.changeLanguage(language);
    set({ theme, language });
  },
}));

// 앱 시작 시 저장된 테마 적용
applyTheme(storedTheme);
