import { useQuery } from '@tanstack/react-query';
import { fetchAdminShowcaseContent } from '@/services/admin-showcase';

export function useAdminShowcasePageQuery() {
  return useQuery({
    queryFn: fetchAdminShowcaseContent,
    queryKey: ['admin-showcase-page'],
  });
}
