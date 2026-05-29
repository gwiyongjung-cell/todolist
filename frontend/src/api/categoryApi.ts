import { apiClient } from './client';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category';

export const categoryApi = {
  getAll: (): Promise<Category[]> =>
    apiClient.get('/api/categories'),

  create: (body: CreateCategoryRequest): Promise<Category> =>
    apiClient.post('/api/categories', body),

  update: (id: string, body: UpdateCategoryRequest): Promise<Category> =>
    apiClient.patch(`/api/categories/${id}`, body),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/categories/${id}`),
};
