import { useTranslation } from 'react-i18next';
import { useUiStore } from '../stores/uiStore';

export default function LanguageSelect() {
  const { t } = useTranslation();
  const language = useUiStore((s) => s.language);
  const setLanguage = useUiStore((s) => s.setLanguage);

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      aria-label="언어 선택"
      className="text-sm text-gray-500 border border-gray-200 rounded px-3 py-2 outline-none focus:border-primary"
    >
      <option value="ko">{t('settings.languageKo')}</option>
      <option value="en">{t('settings.languageEn')}</option>
    </select>
  );
}
