import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AdminShowcaseListQuery } from '@arunreah/shared';
import { queryKeys } from '@/lib/query-keys';
import { fetchAdminShowcaseContent } from '@/services/admin-showcase';

export function useAdminShowcasePageQuery(query: Partial<AdminShowcaseListQuery>) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => fetchAdminShowcaseContent(query),
    queryKey: queryKeys.admin.showcases(query),
  });
}
