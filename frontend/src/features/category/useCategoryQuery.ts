import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../../api/categoryApi';

export const CATEGORIES_QUERY_KEY = ['categories'] as const;

export function useCategoryQuery() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => categoryApi.getAll(),
  });
}
