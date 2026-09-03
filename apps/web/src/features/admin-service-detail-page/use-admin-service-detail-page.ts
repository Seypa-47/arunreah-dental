import { useQuery } from '@tanstack/react-query';
import { fetchAdminServiceDetailContent } from '@/services/admin-service-detail';

export function useAdminServiceDetailPageQuery(serviceId: string | undefined) {
  return useQuery({
    queryFn: () => fetchAdminServiceDetailContent(serviceId),
    queryKey: ['admin-service-detail-page', serviceId],
  });
}
