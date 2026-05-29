import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCategoryQuery } from '../features/category/useCategoryQuery';
import { useTodosQuery } from '../features/todo/useTodosQuery';
import { useCreateTodo, useUpdateTodo } from '../features/todo/useTodoMutations';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { DatePicker } from '../components/DatePicker';
import { ApiException } from '../api/client';
import { DEFAULT_CATEGORY_ID, TODO_STATUS } from '../constants/statusConstants';
import { isValidDateRange, toDateString } from '../utils/dateUtils';
import type { TodoStatus } from '../types/todo';

const STATUS_OPTIONS: TodoStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

function getAllowedStatuses(current: TodoStatus): TodoStatus[] {
  switch (current) {
    case 'TODO': return ['TODO', 'IN_PROGRESS'];
    case 'IN_PROGRESS': return ['TODO', 'IN_PROGRESS', 'DONE'];
    case 'DONE': return ['DONE'];
  }
}

export default function TodoFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: categories = [] } = useCategoryQuery();
  const { data: todos = [] } = useTodosQuery();

  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<TodoStatus>('TODO');
  const [errors, setErrors] = useState<{ title?: string; date?: string; form?: string }>({});
  const [initialized, setInitialized] = useState(false);

  // 수정 모드: 기존 데이터로 폼 초기화
  useEffect(() => {
    if (!isEdit || initialized) return;
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    setTitle(todo.title);
    setCategoryId(todo.category_id);
    setDescription(todo.description ?? '');
    setStartDate(toDateString(todo.start_date));
    setEndDate(toDateString(todo.end_date));
    setStatus(todo.status);
    setInitialized(true);
  }, [id, isEdit, todos, initialized]);

  function validate() {
    const next: typeof errors = {};
    if (!title.trim()) next.title = t('todo.titleRequired');
    if (!isValidDateRange(startDate || null, endDate || null)) {
      next.date = t('todo.dateError');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;

    const resolvedCategoryId = categoryId || DEFAULT_CATEGORY_ID;

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({
          id,
          data: {
            title: title.trim(),
            category_id: resolvedCategoryId,
            description: description.trim() || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            status,
          },
        });
      } else {
        await createMutation.mutateAsync({
          title: title.trim(),
          category_id: resolvedCategoryId,
          description: description.trim() || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        });
      }
      navigate('/todos', { replace: true });
    } catch (err) {
      if (err instanceof ApiException) {
        setErrors({ form: err.message });
      } else {
        setErrors({ form: t('todo.saveError') });
      }
    }
  }

  const allowedStatuses = getAllowedStatuses(status);
  const isStatusDisabled = status === TODO_STATUS.DONE;
  const isPending = createMutation.isPending || updateMutation.isPending;

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
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {isEdit ? t('todo.editFormTitle') : t('todo.newFormTitle')}
          </h2>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* 제목 */}
            <Input
              label={t('todo.titleLabel')}
              value={title}
              onChange={setTitle}
              placeholder={t('todo.titlePlaceholder')}
              error={errors.title}
              required
            />

            {/* 카테고리 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="category-select">
                {t('todo.categoryLabel')}
              </label>
              <select
                id="category-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md text-sm text-gray-900 border border-gray-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
                aria-label="카테고리 선택"
              >
                <option value="">{t('todo.categoryDefault')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* 날짜 */}
            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                label={t('todo.startDate')}
                value={startDate}
                onChange={setStartDate}
                max={endDate || undefined}
              />
              <DatePicker
                label={t('todo.endDate')}
                value={endDate}
                onChange={setEndDate}
                min={startDate || undefined}
                error={errors.date}
              />
            </div>

            {/* 상세 내용 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="description">
                {t('todo.descriptionLabel')}
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('todo.descriptionPlaceholder')}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-md text-sm text-gray-900 border border-gray-300 outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary-light"
              />
            </div>

            {/* 상태 (수정 모드에서만) */}
            {isEdit && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="status-select">
                  {t('todo.statusLabel')}
                  {isStatusDisabled && (
                    <span className="ml-2 text-xs text-gray-400">{t('todo.statusDoneNote')}</span>
                  )}
                </label>
                <select
                  id="status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TodoStatus)}
                  disabled={isStatusDisabled}
                  aria-label="상태 선택"
                  className="w-full px-3.5 py-2.5 rounded-md text-sm text-gray-900 border border-gray-300 outline-none focus:border-primary disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option
                      key={s}
                      value={s}
                      disabled={!allowedStatuses.includes(s)}
                    >
                      {t(`status.${s}`)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 폼 전체 에러 */}
            {errors.form && (
              <p role="alert" className="text-sm text-danger">{errors.form}</p>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/todos')}
                className="!w-auto flex-1"
              >
                {t('todo.cancelButton')}
              </Button>
              <Button
                type="submit"
                loading={isPending}
                className="flex-1"
              >
                {isEdit ? t('todo.saveButton') : t('todo.registerButton')}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
