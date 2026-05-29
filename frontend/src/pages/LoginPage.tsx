import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ApiException } from '../api/client';
import LanguageSelect from '../components/LanguageSelect';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const syncFromUser = useUiStore((s) => s.syncFromUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('auth.emptyFieldsError'));
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await authApi.login({ email, password });
      setAuth(token, user);
      syncFromUser(user.theme, user.language);
      navigate('/todos', { replace: true });
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message);
      } else {
        setError(t('auth.loginFailed'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-primary text-center mb-1">{t('common.appName')}</h1>
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-6">{t('auth.login')}</h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder={t('auth.emailPlaceholder')}
            required
          />
          <Input
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder={t('auth.passwordPlaceholder')}
            required
          />

          {error && (
            <p role="alert" className="text-sm text-danger text-center -mt-1">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="mt-2">
            {t('auth.login')}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-5">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            {t('auth.registerLink')}
          </Link>
        </p>

        <div className="mt-4 flex justify-center">
          <LanguageSelect />
        </div>
      </div>
    </div>
  );
}
