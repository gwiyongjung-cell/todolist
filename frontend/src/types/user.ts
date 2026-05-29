export interface User {
  id: string;
  email: string;
  name: string;
  theme: 'LIGHT' | 'DARK';
  language: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  name?: string;
  password?: string;
}

export interface UpdatePreferencesRequest {
  theme?: 'LIGHT' | 'DARK';
  language?: string;
}
