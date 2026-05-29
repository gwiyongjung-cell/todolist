const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export class ApiException extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // 인증 오류: auth 경로가 아닌 경우 자동 로그아웃 처리
  if (response.status === 401 && !path.startsWith('/api/auth/')) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new ApiException(401, '인증이 만료되었습니다. 다시 로그인해 주세요.');
  }

  // 204 No Content — 응답 본문 없음
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiException(response.status, data.message ?? '오류가 발생했습니다.');
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string): Promise<T> => request<T>(path),

  post: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string): Promise<T> =>
    request<T>(path, { method: 'DELETE' }),
};
