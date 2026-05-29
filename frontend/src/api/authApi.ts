import { apiClient } from './client';
import type { RegisterRequest, LoginRequest, LoginResponse } from '../types/auth';
import type { User } from '../types/user';

export const authApi = {
  register: (body: RegisterRequest): Promise<User> =>
    apiClient.post('/api/auth/register', body),

  login: (body: LoginRequest): Promise<LoginResponse> =>
    apiClient.post('/api/auth/login', body),

  logout: (): Promise<{ message: string }> =>
    apiClient.post('/api/auth/logout', {}),
};
