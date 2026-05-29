# 프론트엔드 통합 가이드

**버전**: 1.0  
**작성일**: 2026-05-28  
**기반**: 백엔드 API v1.0 (BE-01~07 완료), swagger.json, PRD v1.1, 도메인 정의서 v2.1

---

## 목차

1. [기술 스택 및 프로젝트 설정](#1-기술-스택-및-프로젝트-설정)
2. [디렉토리 구조](#2-디렉토리-구조)
3. [TypeScript 타입 정의](#3-typescript-타입-정의)
4. [API 클라이언트 설정](#4-api-클라이언트-설정)
5. [인증 (Auth)](#5-인증-auth)
6. [Zustand 상태 관리](#6-zustand-상태-관리)
7. [TanStack Query 훅](#7-tanstack-query-훅)
8. [API 함수 레퍼런스](#8-api-함수-레퍼런스)
9. [라우팅 및 가드](#9-라우팅-및-가드)
10. [비즈니스 규칙 (프론트엔드 적용)](#10-비즈니스-규칙-프론트엔드-적용)
11. [날짜 처리](#11-날짜-처리)
12. [에러 처리](#12-에러-처리)
13. [화면별 구현 체크리스트](#13-화면별-구현-체크리스트)

---

## 1. 기술 스택 및 프로젝트 설정

### 기술 스택

| 역할 | 기술 |
|------|------|
| UI 프레임워크 | React 19 + TypeScript |
| 빌드 도구 | Vite |
| 클라이언트 상태 | Zustand |
| 서버 상태 / 캐싱 | TanStack Query (React Query v5) |
| HTTP 클라이언트 | fetch (내장) |
| 다국어 _(v2)_ | react-i18next |

### 프로젝트 초기화

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install zustand @tanstack/react-query
# v2 추가
npm install react-i18next i18next
```

### 환경변수 (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000
```

> CORS 허용 오리진: 백엔드 `CORS_ORIGIN=http://localhost:5173` (Vite 기본 포트)

---

## 2. 디렉토리 구조

```
frontend/src/
├── pages/                  # 라우트 단위 페이지 컴포넌트
│   ├── LoginPage.tsx        # S-01 로그인
│   ├── RegisterPage.tsx     # S-02 회원가입
│   ├── TodoListPage.tsx     # S-03 할일 목록
│   ├── TodoFormPage.tsx     # S-04/S-05 할일 등록/수정
│   ├── CategoryPage.tsx     # S-06 카테고리 관리
│   ├── ProfilePage.tsx      # S-07 내 정보 수정
│   └── SettingsPage.tsx     # S-08 환경설정 (v2)
├── components/              # 도메인 무관 공통 UI
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── DatePicker.tsx
├── features/                # 도메인별 기능 컴포넌트
│   ├── auth/
│   ├── todo/
│   ├── category/
│   └── settings/            # v2
├── stores/                  # Zustand 전역 상태
│   ├── authStore.ts
│   └── uiStore.ts           # v2
├── api/                     # API 호출 함수
│   ├── client.ts            # 공통 fetch 래퍼
│   ├── authApi.ts
│   ├── todoApi.ts
│   ├── categoryApi.ts
│   └── userApi.ts
├── types/                   # TypeScript 타입
│   ├── auth.ts
│   ├── todo.ts
│   ├── category.ts
│   └── user.ts
├── utils/
│   └── dateUtils.ts
├── constants/
│   └── statusConstants.ts
└── App.tsx
```

---

## 3. TypeScript 타입 정의

### `types/user.ts`

```typescript
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
```

### `types/auth.ts`

```typescript
import { User } from './user';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
```

### `types/category.ts`

```typescript
export interface Category {
  id: string;
  user_id: string | null;  // null = 시스템 기본 카테고리
  name: string;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}
```

### `types/todo.ts`

```typescript
export type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Todo {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  start_date: string | null;  // ISO 8601 datetime (예: "2026-05-28T00:00:00.000Z")
  end_date: string | null;    // ISO 8601 datetime (예: "2026-05-31T00:00:00.000Z")
  status: TodoStatus;
  created_at: string;
  updated_at: string;
}

export interface TodoFilters {
  category_id?: string;
  status?: TodoStatus;
  overdue?: boolean;
}

export interface CreateTodoRequest {
  title: string;
  category_id?: string;
  description?: string;
  start_date?: string;  // YYYY-MM-DD 형식으로 전송
  end_date?: string;    // YYYY-MM-DD 형식으로 전송
}

export interface UpdateTodoRequest {
  title?: string;
  category_id?: string;
  description?: string;
  start_date?: string;  // YYYY-MM-DD 형식으로 전송
  end_date?: string;    // YYYY-MM-DD 형식으로 전송
  status?: TodoStatus;
}
```

> **중요**: `start_date`/`end_date`는 **요청 시 `YYYY-MM-DD`** 형식으로 보내지만, **응답은 ISO 8601 datetime 문자열** (`2026-05-28T00:00:00.000Z`)로 옵니다. 화면 표시 시 변환이 필요합니다.

### `constants/statusConstants.ts`

```typescript
export const TODO_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export const TODO_STATUS_LABEL: Record<string, string> = {
  TODO: '대기',
  IN_PROGRESS: '진행중',
  DONE: '완료',
};

export const THEME = {
  LIGHT: 'LIGHT',
  DARK: 'DARK',
} as const;

export const DEFAULT_CATEGORY_ID = '00000000-0000-0000-0000-000000000001';
```

---

## 4. API 클라이언트 설정

### `api/client.ts`

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiError {
  message: string;
}

export class ApiException extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiException(response.status, (data as ApiError).message);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
```

---

## 5. 인증 (Auth)

### 토큰 저장 전략

JWT 토큰은 `localStorage`에 저장합니다.

```typescript
// 저장
localStorage.setItem('token', token);

// 읽기 (api/client.ts 에서 자동 처리)
localStorage.getItem('token');

// 삭제 (로그아웃)
localStorage.removeItem('token');
```

### `api/authApi.ts`

```typescript
import { apiClient } from './client';
import { RegisterRequest, LoginRequest, LoginResponse } from '../types/auth';
import { User } from '../types/user';

export const authApi = {
  register: (body: RegisterRequest): Promise<User> =>
    apiClient.post('/api/auth/register', body),

  login: (body: LoginRequest): Promise<LoginResponse> =>
    apiClient.post('/api/auth/login', body),

  logout: (): Promise<{ message: string }> =>
    apiClient.post('/api/auth/logout', {}),
};
```

### 로그인 흐름

```
1. POST /api/auth/login → { token, user } 수신
2. localStorage.setItem('token', token)
3. authStore에 user 저장
4. /todos 페이지로 이동
```

### 로그아웃 흐름

```
1. POST /api/auth/logout (서버 호출 선택적)
2. localStorage.removeItem('token')
3. authStore 초기화
4. /login 페이지로 이동
```

---

## 6. Zustand 상태 관리

### `stores/authStore.ts`

```typescript
import { create } from 'zustand';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
```

### `stores/uiStore.ts` _(v2)_

```typescript
import { create } from 'zustand';

interface UIState {
  theme: 'LIGHT' | 'DARK';
  language: string;
  setTheme: (theme: 'LIGHT' | 'DARK') => void;
  setLanguage: (language: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'LIGHT',
  language: 'ko',
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
}));
```

---

## 7. TanStack Query 훅

### QueryClient 설정 (`main.tsx`)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60, // 1분
    },
  },
});
```

### 쿼리 키 규칙

```typescript
// constants/queryKeys.ts
export const queryKeys = {
  todos: (filters?: object) => ['todos', filters] as const,
  todo: (id: string) => ['todos', id] as const,
  categories: () => ['categories'] as const,
  me: () => ['me'] as const,
};
```

### 할일 관련 훅

```typescript
// features/todo/useTodos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../../api/todoApi';
import { queryKeys } from '../../constants/queryKeys';
import { TodoFilters, CreateTodoRequest, UpdateTodoRequest } from '../../types/todo';

export function useTodos(filters: TodoFilters = {}) {
  return useQuery({
    queryKey: queryKeys.todos(filters),
    queryFn: () => todoApi.getAll(filters),
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTodoRequest) => todoApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos() });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      todoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos() });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todoApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos() });
    },
  });
}
```

### 카테고리 관련 훅

```typescript
// features/category/useCategories.ts
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: () => categoryApi.getAll(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => categoryApi.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories() });
    },
  });
}
```

---

## 8. API 함수 레퍼런스

### `api/authApi.ts`

| 함수 | 메서드 | 경로 | 인증 |
|------|--------|------|------|
| `register(body)` | POST | `/api/auth/register` | 불필요 |
| `login(body)` | POST | `/api/auth/login` | 불필요 |
| `logout()` | POST | `/api/auth/logout` | 필요 |

**register 요청/응답**

```
요청: { email, password, name }
응답 201: User 객체 (password 제외)
에러 400: "이메일, 비밀번호, 이름은 필수 입력값입니다."
에러 409: "이미 사용 중인 이메일입니다."
```

**login 요청/응답**

```
요청: { email, password }
응답 200: { token: string, user: User }
에러 400: "이메일과 비밀번호는 필수 입력값입니다."
에러 401: "이메일 또는 비밀번호가 올바르지 않습니다."
```

---

### `api/userApi.ts`

| 함수 | 메서드 | 경로 | 인증 |
|------|--------|------|------|
| `getMe()` | GET | `/api/users/me` | 필요 |
| `updateProfile(body)` | PATCH | `/api/users/me` | 필요 |
| `updatePreferences(body)` | PATCH | `/api/users/me/preferences` | 필요 |

**updateProfile 요청/응답**

```
요청: { name?: string, password?: string }  ← 하나 이상 필수
응답 200: User 객체
에러 400: "수정할 항목이 없습니다."
```

**updatePreferences 요청/응답** _(v2)_

```
요청: { theme?: 'LIGHT' | 'DARK', language?: string }
응답 200: User 객체
에러 400: "유효하지 않은 테마값입니다."
```

```typescript
export const userApi = {
  getMe: (): Promise<User> =>
    apiClient.get('/api/users/me'),

  updateProfile: (body: UpdateProfileRequest): Promise<User> =>
    apiClient.patch('/api/users/me', body),

  updatePreferences: (body: UpdatePreferencesRequest): Promise<User> =>
    apiClient.patch('/api/users/me/preferences', body),
};
```

---

### `api/categoryApi.ts`

| 함수 | 메서드 | 경로 | 인증 |
|------|--------|------|------|
| `getAll()` | GET | `/api/categories` | 필요 |
| `create(body)` | POST | `/api/categories` | 필요 |
| `update(id, body)` | PATCH | `/api/categories/:id` | 필요 |
| `delete(id)` | DELETE | `/api/categories/:id` | 필요 |

**getAll 응답**

```
응답 200: Category[]
— 시스템 기본 카테고리 (user_id: null) 포함
— created_at 오름차순 정렬
```

**create 요청/응답**

```
요청: { name: string }
응답 201: Category
에러 400: "카테고리 이름은 필수입니다."
```

**update/delete 에러**

```
에러 403: "기본 카테고리는 수정할 수 없습니다." | "기본 카테고리는 삭제할 수 없습니다."
에러 403: "카테고리 수정 권한이 없습니다." | "카테고리 삭제 권한이 없습니다."
에러 404: "카테고리를 찾을 수 없습니다."
```

```typescript
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
```

---

### `api/todoApi.ts`

| 함수 | 메서드 | 경로 | 인증 |
|------|--------|------|------|
| `getAll(filters?)` | GET | `/api/todos` | 필요 |
| `create(body)` | POST | `/api/todos` | 필요 |
| `update(id, body)` | PATCH | `/api/todos/:id` | 필요 |
| `delete(id)` | DELETE | `/api/todos/:id` | 필요 |

**getAll 쿼리 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `category_id` | string (UUID) | 특정 카테고리 필터 |
| `status` | `'TODO' \| 'IN_PROGRESS' \| 'DONE'` | 상태 필터 |
| `overdue` | boolean | true = 기한 초과 미완료만 조회 |

**create 요청/응답**

```
요청: {
  title: string,           ← 필수
  category_id?: string,    ← 미지정 시 기본 카테고리 자동 적용
  description?: string,
  start_date?: string,     ← "YYYY-MM-DD" 형식
  end_date?: string        ← "YYYY-MM-DD" 형식, start_date 이상이어야 함
}
응답 201: Todo
에러 400: "할일 제목은 필수입니다."
에러 400: "종료일은 시작일보다 이전일 수 없습니다."
```

**update 에러**

```
에러 400: "완료된 할일의 상태는 변경할 수 없습니다."
에러 400: "종료일은 시작일보다 이전일 수 없습니다."
에러 403: "할일 수정 권한이 없습니다."
에러 404: "할일을 찾을 수 없습니다."
```

**delete 에러**

```
에러 403: "할일 삭제 권한이 없습니다."
에러 404: "할일을 찾을 수 없습니다."
```

```typescript
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
```

---

## 9. 라우팅 및 가드

### 라우트 구조 (`App.tsx`)

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/todos" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* 보호 라우트 */}
        <Route path="/todos" element={<PrivateRoute><TodoListPage /></PrivateRoute>} />
        <Route path="/todos/new" element={<PrivateRoute><TodoFormPage /></PrivateRoute>} />
        <Route path="/todos/:id/edit" element={<PrivateRoute><TodoFormPage /></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><CategoryPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

        {/* 기본 리다이렉트 */}
        <Route path="/" element={<Navigate to="/todos" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 네비게이션 흐름

```
/login, /register  ←→  /todos (메인 허브)
                          ├── /todos/new
                          ├── /todos/:id/edit
                          ├── /categories
                          ├── /profile
                          └── /settings
```

---

## 10. 비즈니스 규칙 (프론트엔드 적용)

### 10.1 할일 상태 전이 규칙

UI에서 상태 선택 옵션을 현재 상태에 따라 제한해야 합니다.

```typescript
// utils/statusUtils.ts
export function getAllowedStatuses(currentStatus: TodoStatus): TodoStatus[] {
  switch (currentStatus) {
    case 'TODO':
      return ['TODO', 'IN_PROGRESS'];
    case 'IN_PROGRESS':
      return ['TODO', 'IN_PROGRESS', 'DONE'];
    case 'DONE':
      return ['DONE']; // 변경 불가 — 선택 UI 비활성화
    default:
      return ['TODO'];
  }
}

export function isStatusChangeable(currentStatus: TodoStatus): boolean {
  return currentStatus !== 'DONE';
}
```

**S-05 할일 수정 화면 적용 예:**

```tsx
const statusOptions = getAllowedStatuses(todo.status);
// DONE인 경우 select 비활성화
<select disabled={!isStatusChangeable(todo.status)}>
  {statusOptions.map(s => <option key={s}>{TODO_STATUS_LABEL[s]}</option>)}
</select>
```

### 10.2 날짜 유효성 검사

폼 제출 전 프론트엔드에서도 검증합니다 (API 에러 방지용).

```typescript
export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return true;
  return new Date(endDate) >= new Date(startDate);
}
```

### 10.3 기본 카테고리 보호

`user_id === null`인 카테고리는 수정/삭제 버튼을 비활성화합니다.

```tsx
const isDefaultCategory = (category: Category) => category.user_id === null;

<button disabled={isDefaultCategory(category)}>수정</button>
<button disabled={isDefaultCategory(category)}>삭제</button>
```

### 10.4 기한 초과 표시

```typescript
// utils/dateUtils.ts
export function isOverdue(todo: Todo): boolean {
  if (!todo.end_date || todo.status === 'DONE') return false;
  return new Date(todo.end_date) < new Date();
}
```

---

## 11. 날짜 처리

> **핵심**: API 응답의 `start_date`/`end_date`는 PostgreSQL DATE 타입이 ISO 8601 datetime으로 반환됩니다.

### 응답 파싱 예시

```
API 응답: "2026-05-28T00:00:00.000Z"
→ 서버 timezone 영향으로 실제 날짜와 다를 수 있음
→ UTC 기준 날짜 파싱 필요
```

```typescript
// utils/dateUtils.ts

/** ISO datetime → YYYY-MM-DD (UTC 기준) */
export function toDateString(isoString: string | null): string {
  if (!isoString) return '';
  return isoString.split('T')[0];
}

/** ISO datetime → 화면 표시용 (YYYY.MM.DD) */
export function formatDate(isoString: string | null): string {
  if (!isoString) return '-';
  const date = isoString.split('T')[0];
  return date.replace(/-/g, '.');
}

/** Date 객체 → YYYY-MM-DD (API 전송용) */
export function toApiDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
```

### 사용 예

```tsx
// 화면에 표시
<span>{formatDate(todo.end_date)}</span>  // "2026.05.31"

// DatePicker 초기값 설정
defaultValue={toDateString(todo.start_date)}  // "2026-05-28"

// API 전송
await todoApi.update(id, {
  start_date: toApiDate(selectedDate),  // "2026-05-28"
});
```

---

## 12. 에러 처리

### ApiException 처리 패턴

```typescript
import { ApiException } from '../api/client';

try {
  await authApi.login(credentials);
} catch (error) {
  if (error instanceof ApiException) {
    switch (error.status) {
      case 400: setError(error.message); break;
      case 401: setError('이메일 또는 비밀번호를 확인해주세요.'); break;
      case 403: setError('접근 권한이 없습니다.'); break;
      case 404: setError('리소스를 찾을 수 없습니다.'); break;
      case 409: setError(error.message); break;
      default:  setError('오류가 발생했습니다. 다시 시도해주세요.'); break;
    }
  }
}
```

### TanStack Query onError 처리

```typescript
const { mutate: createTodo } = useMutation({
  mutationFn: todoApi.create,
  onSuccess: () => navigate('/todos'),
  onError: (error) => {
    if (error instanceof ApiException) {
      setFormError(error.message);
    }
  },
});
```

### 401 자동 로그아웃 (client.ts 확장)

```typescript
if (response.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login';
  throw new ApiException(401, data.message);
}
```

---

## 13. 화면별 구현 체크리스트

### S-01. 로그인 화면 (`LoginPage.tsx`)

- [ ] 이메일 / 비밀번호 입력 폼
- [ ] `POST /api/auth/login` 호출
- [ ] 성공 시 token + user → authStore 저장 → `/todos` 이동
- [ ] 에러 메시지 표시 (401: 잘못된 이메일/비밀번호)
- [ ] "회원가입" 링크 → `/register`
- [ ] 이미 로그인된 경우 `/todos`로 리다이렉트

### S-02. 회원가입 화면 (`RegisterPage.tsx`)

- [ ] 이름 / 이메일 / 비밀번호 입력 폼
- [ ] `POST /api/auth/register` 호출
- [ ] 성공 시 `/login` 이동
- [ ] 에러 메시지 표시 (409: 중복 이메일)
- [ ] "로그인" 링크 → `/login`

### S-03. 할일 목록 화면 (`TodoListPage.tsx`)

- [ ] `GET /api/categories` — 카테고리 드롭다운
- [ ] `GET /api/todos?...` — 필터 적용 목록 조회
- [ ] 카테고리 필터 (category_id)
- [ ] 상태 필터 버튼 (TODO / IN_PROGRESS / DONE)
- [ ] 기한 초과 필터 토글 (overdue=true)
- [ ] 기한 초과 항목 시각적 강조 (isOverdue 유틸 활용)
- [ ] 할일 항목별 수정 → `/todos/:id/edit`, 삭제 → `DELETE /api/todos/:id`
- [ ] [+ 새 할일] → `/todos/new`
- [ ] 로그아웃 버튼 → clearAuth() → `/login`

### S-04. 할일 등록 화면 (`TodoFormPage.tsx` - 신규)

- [ ] `GET /api/categories` — 카테고리 선택 드롭다운
- [ ] 제목 입력 (필수)
- [ ] 카테고리 선택 (미선택 시 기본 카테고리 자동 적용 — category_id 생략)
- [ ] 시작일자 / 종료일자 DatePicker
- [ ] 날짜 유효성: `endDate >= startDate` 클라이언트 검증
- [ ] 상세 내용 텍스트 입력
- [ ] `POST /api/todos` 호출
- [ ] 성공 시 `/todos` 이동

### S-05. 할일 수정 화면 (`TodoFormPage.tsx` - 수정)

- [ ] 기존 값으로 폼 초기화 (날짜: `toDateString()` 변환)
- [ ] 상태 선택: `getAllowedStatuses(currentStatus)` 기반 옵션 제한
- [ ] DONE 상태인 경우 상태 선택 UI 비활성화
- [ ] `PATCH /api/todos/:id` 호출
- [ ] 성공 시 `/todos` 이동

### S-06. 카테고리 관리 화면 (`CategoryPage.tsx`)

- [ ] `GET /api/categories` — 목록 표시
- [ ] 기본 카테고리 (`user_id === null`) 수정/삭제 버튼 비활성화
- [ ] 카테고리 이름 입력 → `POST /api/categories`
- [ ] 수정: `PATCH /api/categories/:id`
- [ ] 삭제: `DELETE /api/categories/:id`

### S-07. 내 정보 수정 화면 (`ProfilePage.tsx`)

- [ ] `GET /api/users/me` — 현재 이름 표시
- [ ] 이름 변경 입력
- [ ] 새 비밀번호 입력 (선택)
- [ ] `PATCH /api/users/me` — `{ name?, password? }` (하나 이상 필수)
- [ ] 성공 메시지 표시

### S-08. 환경설정 화면 (`SettingsPage.tsx`) _(v2)_

- [ ] `GET /api/users/me` — 현재 theme/language 로드
- [ ] 테마 토글 (LIGHT ↔ DARK)
- [ ] 언어 선택 드롭다운 (ko / en)
- [ ] `PATCH /api/users/me/preferences` — `{ theme?, language? }`
- [ ] 저장 성공 시 uiStore 업데이트 → UI 즉시 반영

---

## 빠른 참조

### API 엔드포인트 요약

| 화면 | 사용 API |
|------|---------|
| 로그인 | `POST /api/auth/login` |
| 회원가입 | `POST /api/auth/register` |
| 할일 목록 | `GET /api/todos`, `GET /api/categories` |
| 할일 등록 | `POST /api/todos`, `GET /api/categories` |
| 할일 수정 | `PATCH /api/todos/:id`, `GET /api/categories` |
| 할일 삭제 | `DELETE /api/todos/:id` |
| 카테고리 관리 | `GET/POST /api/categories`, `PATCH/DELETE /api/categories/:id` |
| 내 정보 수정 | `GET /api/users/me`, `PATCH /api/users/me` |
| 환경설정 | `GET /api/users/me`, `PATCH /api/users/me/preferences` |
| 로그아웃 | `POST /api/auth/logout` |

### HTTP 상태 코드 요약

| 코드 | 의미 | 프론트 처리 |
|------|------|------------|
| 200 | 성공 | 정상 처리 |
| 201 | 생성 성공 | 목록 갱신 (invalidateQueries) |
| 204 | 삭제 성공 | 목록 갱신 |
| 400 | 입력 오류 | `error.message` 폼에 표시 |
| 401 | 인증 실패/만료 | 토큰 삭제 후 `/login` 이동 |
| 403 | 권한 없음 | `error.message` 표시 |
| 404 | 리소스 없음 | `error.message` 표시 |
| 409 | 중복 충돌 | `error.message` 표시 (이메일 중복 등) |

### Swagger UI

개발 중 API 스펙 확인: **http://localhost:3000/api-docs/**
