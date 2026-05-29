import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { userApi } from '../api/userApi';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ApiException } from '../api/client';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => userApi.getMe(),
  });

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; form?: string }>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  function validate() {
    const next: typeof errors = {};
    if (!name.trim()) next.name = t('profile.nameRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const mutation = useMutation({
    mutationFn: (data: { name?: string; password?: string }) => userApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      if (token) setAuth(token, updatedUser);
      setPassword('');
      setSuccess(true);
      setErrors({});
    },
    onError: (err) => {
      if (err instanceof ApiException) {
        setErrors({ form: err.message });
      } else {
        setErrors({ form: t('profile.saveError') });
      }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setErrors({});
    if (!validate()) return;

    const data: { name?: string; password?: string } = { name: name.trim() };
    if (password) data.password = password;
    mutation.mutate(data);
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
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('profile.title')}</h2>

          {isLoading && (
            <p className="text-sm text-gray-500 text-center py-8">{t('profile.loading')}</p>
          )}

          {!isLoading && (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-gray-700">{t('profile.emailLabel')}</span>
                <p className="text-sm text-gray-500 px-3.5 py-2.5 bg-gray-50 rounded-md border border-gray-200">
                  {user?.email}
                </p>
              </div>

              <Input
                label={t('profile.nameLabel')}
                value={name}
                onChange={(v) => { setName(v); setSuccess(false); }}
                placeholder={t('profile.namePlaceholder')}
                error={errors.name}
                required
              />

              <Input
                label={t('profile.passwordLabel')}
                type="password"
                value={password}
                onChange={(v) => { setPassword(v); setSuccess(false); }}
                placeholder={t('profile.passwordPlaceholder')}
              />

              {success && (
                <p role="status" className="text-sm text-primary font-medium">
                  {t('profile.saveSuccess')}
                </p>
              )}

              {errors.form && (
                <p role="alert" className="text-sm text-danger">{errors.form}</p>
              )}

              <Button type="submit" loading={mutation.isPending}>
                {t('profile.saveButton')}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
