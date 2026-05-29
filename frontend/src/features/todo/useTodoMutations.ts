import { useMutation, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../../api/todoApi';
import { TODOS_QUERY_KEY } from './useTodosQuery';
import type { CreateTodoRequest, UpdateTodoRequest } from '../../types/todo';

function invalidateTodos(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [TODOS_QUERY_KEY] });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTodoRequest) => todoApi.create(data),
    onSuccess: () => invalidateTodos(queryClient),
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      todoApi.update(id, data),
    onSuccess: () => invalidateTodos(queryClient),
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todoApi.delete(id),
    onSuccess: () => invalidateTodos(queryClient),
  });
}
