export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}
