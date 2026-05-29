import { useQuery } from '@tanstack/react-query';
import { todoApi } from '../../api/todoApi';
import type { TodoFilters } from '../../types/todo';

export const TODOS_QUERY_KEY = 'todos' as const;

export function todosQueryKey(filters: TodoFilters = {}) {
  return [TODOS_QUERY_KEY, filters] as const;
}

export function useTodosQuery(filters: TodoFilters = {}) {
  return useQuery({
    queryKey: todosQueryKey(filters),
    queryFn: () => todoApi.getAll(filters),
  });
}
