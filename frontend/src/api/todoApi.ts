import { apiClient } from './client';
import type { Todo, TodoFilters, CreateTodoRequest, UpdateTodoRequest } from '../types/todo';

export const todoApi = {
  getAll: (filters: TodoFilters = {}): Promise<Todo[]> => {
    const params = new URLSearchParams();
    if (filters.category_id) params.set('category_id', filters.category_id);
    if (filters.status) params.set('status', filters.status);
    if (filters.overdue !== undefined) params.set('overdue', String(filters.overdue));
    const query = params.toString();
    return apiClient.get(`/api/todos${query ? `?${query}` : ''}`);
  },

  create: (body: CreateTodoRequest): Promise<Todo> =>
    apiClient.post('/api/todos', body),

  update: (id: string, body: UpdateTodoRequest): Promise<Todo> =>
    apiClient.patch(`/api/todos/${id}`, body),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/todos/${id}`),
};
