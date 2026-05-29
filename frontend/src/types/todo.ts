export type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Todo {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  /** API 응답: ISO 8601 datetime (예: "2026-05-28T00:00:00.000Z") */
  start_date: string | null;
  /** API 응답: ISO 8601 datetime (예: "2026-05-28T00:00:00.000Z") */
  end_date: string | null;
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
  /** 요청: YYYY-MM-DD 형식 */
  start_date?: string;
  /** 요청: YYYY-MM-DD 형식, start_date 이상이어야 함 */
  end_date?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  category_id?: string;
  description?: string;
  /** 요청: YYYY-MM-DD 형식 */
  start_date?: string;
  /** 요청: YYYY-MM-DD 형식 */
  end_date?: string;
  status?: TodoStatus;
}
