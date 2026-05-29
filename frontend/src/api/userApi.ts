import { apiClient } from './client';
import type { User, UpdateProfileRequest, UpdatePreferencesRequest } from '../types/user';

export const userApi = {
  getMe: (): Promise<User> =>
    apiClient.get('/api/users/me'),

  updateProfile: (body: UpdateProfileRequest): Promise<User> =>
    apiClient.patch('/api/users/me', body),

  updatePreferences: (body: UpdatePreferencesRequest): Promise<User> =>
    apiClient.patch('/api/users/me/preferences', body),
};
