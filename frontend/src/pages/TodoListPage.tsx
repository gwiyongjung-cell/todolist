import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTodosQuery } from '../features/todo/useTodosQuery';
import { useDeleteTodo } from '../features/todo/useTodoMutations';
import { useCategoryQuery } from '../features/category/useCategoryQuery';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/authApi';
import { formatDate, isOverdue } from '../utils/dateUtils';
import { TODO_STATUS } from '../constants/statusConstants';
import type { TodoFilters, TodoStatus } from '../types/todo';

const STATUS_BADGE: Record<string, string> = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-50 text-info',
  DONE: 'bg-primary-light text-primary',
};

export default function TodoListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [filters, setFilters] = useState<TodoFilters>({});

  const { data: todos = [], isLoading } = useTodosQuery(filters);
  const { data: categories = [] } = useCategoryQuery();
  const deleteMutation = useDeleteTodo();

  const FILTER_STATUSES: Array<{ value: TodoStatus | ''; label: string }> = [
    { value: '', label: t('todo.filterAll') },
    { value: TODO_STATUS.TODO, label: t('status.TODO') },
    { value: TODO_STATUS.IN_PROGRESS, label: t('status.IN_PROGRESS') },
    { value: TODO_STATUS.DONE, label: t('status.DONE') },
  ];

  async function handleLogout() {
    try { await authApi.logout(); } catch {}
    clearAuth();
    navigate('/login', { replace: true });
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`"${title}" 할일을 삭제할까요?`)) return;
    await deleteMutation.mutateAsync(id);
  }

  function setStatusFilter(status: TodoStatus | '') {
    setFilters((prev) => ({
      ...prev,
      status: status || undefined,
      overdue: undefined,
    }));
  }

  function toggleOverdue() {
    setFilters((prev) => ({
      ...prev,
      status: undefined,
      overdue: prev.overdue ? undefined : true,
    }));
  }

  function setCategoryFilter(categoryId: string) {
    setFilters((prev) => ({
      ...prev,
      category_id: categoryId || undefined,
    }));
  }

  const activeStatus = filters.status ?? '';
  const isOverdueActive = !!filters.overdue;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary">{t('common.appName')}</h1>
          <nav className="flex items-center gap-2">
            <button
              onClick={() => navigate('/categories')}
              className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1"
            >
              {t('nav.categories')}
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1"
            >
              {t('nav.profile')}
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1"
            >
              {t('nav.settings')}
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-danger px-2 py-1"
              aria-label={t('auth.logout')}
            >
              {t('auth.logout')}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
        {/* 필터 + 등록 버튼 */}
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col gap-3">
          {/* 카테고리 필터 */}
          <div className="flex items-center gap-2">
            <label htmlFor="category-filter" className="text-sm text-gray-500 whitespace-nowrap">
              {t('todo.categoryLabel')}
            </label>
            <select
              id="category-filter"
              value={filters.category_id ?? ''}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1.5 outline-none focus:border-primary"
              aria-label="카테고리 필터"
            >
              <option value="">{t('todo.filterAll')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* 상태 필터 칩 */}
          <div className="flex items-center gap-2 flex-wrap">
            {FILTER_STATUSES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                aria-pressed={activeStatus === value && !isOverdueActive}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                  ${activeStatus === value && !isOverdueActive
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
                  }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={toggleOverdue}
              aria-pressed={isOverdueActive}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${isOverdueActive
                  ? 'bg-danger text-white border-danger'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-danger hover:text-danger'
                }`}
            >
              {t('todo.filterOverdue')}
            </button>
          </div>

          {/* 새 할일 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={() => navigate('/todos/new')}
              className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
            >
              {t('todo.newButton')}
            </button>
          </div>
        </div>

        {/* 할일 목록 */}
        {isLoading ? (
          <p className="text-center text-sm text-gray-500 py-8">{t('common.loading')}</p>
        ) : todos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">{t('todo.emptyMessage')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('todo.emptySubMessage')}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2" role="list">
            {todos.map((todo) => {
              const overdue = isOverdue(todo.end_date, todo.status);
              const categoryName = categories.find((c) => c.id === todo.category_id)?.name ?? '';

              return (
                <li
                  key={todo.id}
                  className={`bg-white rounded-md border p-4 flex items-start gap-3 cursor-pointer hover:shadow-sm transition-shadow
                    ${overdue ? 'border-l-4 border-l-danger border-y-gray-200 border-r-gray-200' : 'border-gray-200'}`}
                  onClick={() => navigate(`/todos/${todo.id}/edit`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold text-gray-900 truncate ${todo.status === 'DONE' ? 'line-through text-gray-400' : ''}`}>
                      {todo.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {categoryName && (
                        <span className="text-xs text-gray-400">{categoryName}</span>
                      )}
                      {(todo.start_date || todo.end_date) && (
                        <span className={`text-xs ${overdue ? 'text-danger font-medium' : 'text-gray-400'}`}>
                          {formatDate(todo.start_date)} ~ {formatDate(todo.end_date)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[todo.status]}`}>
                      {t(`status.${todo.status}`)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(todo.id, todo.title);
                      }}
                      aria-label={`${todo.title} 삭제`}
                      className="text-xs text-gray-400 hover:text-danger px-1"
                    >
                      {t('todo.deleteButton')}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
