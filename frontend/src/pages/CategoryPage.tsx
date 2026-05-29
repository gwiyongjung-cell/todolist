import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCategoryQuery } from '../features/category/useCategoryQuery';
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../features/category/useCategoryMutations';
import { Button } from '../components/Button';
import { ApiException } from '../api/client';
import { DEFAULT_CATEGORY_ID } from '../constants/statusConstants';

export default function CategoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: categories = [], isLoading } = useCategoryQuery();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [newName, setNewName] = useState('');
  const [newNameError, setNewNameError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editError, setEditError] = useState('');

  const [actionError, setActionError] = useState('');

  async function handleCreate() {
    setNewNameError('');
    if (!newName.trim()) {
      setNewNameError(t('category.nameRequired'));
      return;
    }
    try {
      await createMutation.mutateAsync(newName.trim());
      setNewName('');
    } catch (err) {
      if (err instanceof ApiException) {
        setNewNameError(err.message);
      }
    }
  }

  function startEdit(id: string, name: string) {
    setEditingId(id);
    setEditingName(name);
    setEditError('');
    setActionError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName('');
    setEditError('');
  }

  async function handleUpdate(id: string) {
    setEditError('');
    if (!editingName.trim()) {
      setEditError(t('category.nameRequired'));
      return;
    }
    try {
      await updateMutation.mutateAsync({ id, name: editingName.trim() });
      cancelEdit();
    } catch (err) {
      if (err instanceof ApiException) {
        setEditError(err.message);
      }
    }
  }

  async function handleDelete(id: string) {
    setActionError('');
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      if (err instanceof ApiException) {
        setActionError(err.message);
      }
    }
  }

  const isDefaultCategory = (categoryId: string) => categoryId === DEFAULT_CATEGORY_ID;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-5">{t('category.title')}</h2>

          {/* 새 카테고리 추가 */}
          <div className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder={t('category.inputPlaceholder')}
                  aria-label={t('category.inputPlaceholder')}
                  className={`w-full px-3.5 py-2.5 rounded-md text-sm border outline-none transition-all
                    ${newNameError
                      ? 'border-danger focus:ring-2 focus:ring-red-100'
                      : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary-light'
                    }`}
                />
                {newNameError && (
                  <p role="alert" className="text-xs text-danger mt-1">{newNameError}</p>
                )}
              </div>
              <Button
                onClick={handleCreate}
                loading={createMutation.isPending}
                className="!w-auto px-4"
              >
                {t('category.addButton')}
              </Button>
            </div>
          </div>

          {/* 전역 에러 */}
          {actionError && (
            <p role="alert" className="text-sm text-danger mb-4">{actionError}</p>
          )}

          {/* 카테고리 목록 */}
          {isLoading ? (
            <p className="text-sm text-gray-500">{t('category.loading')}</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-500">{t('category.empty')}</p>
          ) : (
            <ul className="flex flex-col gap-2" role="list">
              {categories.map((cat) => {
                const isDefault = isDefaultCategory(cat.id);
                const isEditing = editingId === cat.id;

                return (
                  <li
                    key={cat.id}
                    className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-md bg-gray-50"
                  >
                    {isEditing ? (
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdate(cat.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            aria-label={t('category.editInputLabel')}
                            className="flex-1 px-3 py-1.5 text-sm text-gray-500 border border-primary rounded outline-none focus:ring-2 focus:ring-primary-light"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdate(cat.id)}
                            disabled={updateMutation.isPending}
                            className="text-sm text-primary font-medium hover:underline disabled:opacity-50"
                          >
                            {t('category.saveEdit')}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-sm text-gray-500 hover:underline"
                          >
                            {t('category.cancelEdit')}
                          </button>
                        </div>
                        {editError && (
                          <p role="alert" className="text-xs text-danger">{editError}</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 text-sm text-gray-900">{cat.name}</span>
                        {isDefault && (
                          <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full">
                            {t('category.defaultBadge')}
                          </span>
                        )}
                        <button
                          onClick={() => isDefault ? setActionError(t('category.defaultModifyError')) : startEdit(cat.id, cat.name)}
                          disabled={isDefault}
                          aria-label={`${cat.name} 수정`}
                          className="text-sm text-gray-500 hover:text-info disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => isDefault ? setActionError(t('category.defaultDeleteError')) : handleDelete(cat.id)}
                          disabled={isDefault || deleteMutation.isPending}
                          aria-label={`${cat.name} 삭제`}
                          className="text-sm text-gray-500 hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {t('common.delete')}
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
