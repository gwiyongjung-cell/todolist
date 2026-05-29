import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ApiException } from '../api/client';
import LanguageSelect from '../components/LanguageSelect';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!name.trim()) next.name = t('auth.nameRequired');
    if (!email.trim()) next.email = t('auth.emailRequired');
    if (!password.trim()) next.password = t('auth.passwordRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.register({ name, email, password });
      navigate('/login', { replace: true });
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.status === 409) {
          setErrors({ email: err.message });
        } else {
          setErrors({ form: err.message });
        }
      } else {
        setErrors({ form: '회원가입 중 오류가 발생했습니다.' });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-primary text-center mb-1">{t('common.appName')}</h1>
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-6">{t('auth.register')}</h2>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            label={t('auth.name')}
            type="text"
            value={name}
            onChange={setName}
            placeholder={t('auth.namePlaceholder')}
            error={errors.name}
            required
          />
          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder={t('auth.emailPlaceholder')}
            error={errors.email}
            required
          />
          <Input
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder={t('auth.passwordPlaceholder')}
            error={errors.password}
            required
          />

          {errors.form && (
            <p role="alert" className="text-sm text-danger text-center -mt-1">
              {errors.form}
            </p>
          )}

          <Button type="submit" loading={loading} className="mt-2">
            {t('auth.registerButton')}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-5">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {t('auth.loginLink')}
          </Link>
        </p>

        <div className="mt-4 flex justify-center">
          <LanguageSelect />
        </div>
      </div>
    </div>
  );
}
