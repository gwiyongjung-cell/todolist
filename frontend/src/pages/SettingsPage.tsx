import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useUiStore } from '../stores/uiStore';
import { userApi } from '../api/userApi';
import { Button } from '../components/Button';
import { ApiException } from '../api/client';

type Theme = 'LIGHT' | 'DARK';

export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const theme = useUiStore((s) => s.theme);
  const language = useUiStore((s) => s.language);
  const setTheme = useUiStore((s) => s.setTheme);
  const setLanguage = useUiStore((s) => s.setLanguage);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => userApi.updatePreferences({ theme, language }),
    onSuccess: () => {
      setSuccess(true);
      setError('');
    },
    onError: (err) => {
      if (err instanceof ApiException) {
        setError(err.message);
      } else {
        setError(t('settings.saveError'));
      }
    },
  });

  function handleThemeChange(newTheme: Theme) {
    setTheme(newTheme);
    setSuccess(false);
  }

  function handleLanguageChange(newLanguage: string) {
    setLanguage(newLanguage);
    setSuccess(false);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary">{t('common.appName')}</h1>
          <button
            onClick={() => navigate('/todos')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {t('common.backToList')}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('settings.title')}</h2>

          <div className="flex flex-col gap-6">
            {/* 테마 설정 */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-700">{t('settings.themeLabel')}</label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleThemeChange('LIGHT')}
                  aria-pressed={theme === 'LIGHT'}
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium border transition-colors
                    ${theme === 'LIGHT'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
                    }`}
                >
                  {t('settings.themeLight')}
                </button>
                <button
                  onClick={() => handleThemeChange('DARK')}
                  aria-pressed={theme === 'DARK'}
                  className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium border transition-colors
                    ${theme === 'DARK'
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-900 hover:text-gray-900'
                    }`}
                >
                  {t('settings.themeDark')}
                </button>
              </div>
            </div>

            {/* 언어 설정 */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-700" htmlFor="language-select">
                {t('settings.languageLabel')}
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                aria-label="언어 선택"
                className="w-full px-3.5 py-2.5 rounded-md text-sm text-gray-900 border border-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
              >
                <option value="ko">{t('settings.languageKo')}</option>
                <option value="en">{t('settings.languageEn')}</option>
              </select>
            </div>

            {/* 성공/에러 메시지 */}
            {success && (
              <p role="status" className="text-sm text-primary font-medium">
                {t('settings.saveSuccess')}
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-danger">{error}</p>
            )}

            {/* 저장 버튼 */}
            <Button
              type="button"
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
            >
              {t('settings.saveButton')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
