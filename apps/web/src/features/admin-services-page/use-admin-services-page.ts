import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ServiceListQuery } from '@arunreah/shared';
import { queryKeys } from '@/lib/query-keys';
import { fetchAdminServicesContent } from '@/services/admin-services';

export function useAdminServicesPageQuery(query: Partial<ServiceListQuery>) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => fetchAdminServicesContent(query),
    queryKey: queryKeys.admin.services(query),
  });
}
