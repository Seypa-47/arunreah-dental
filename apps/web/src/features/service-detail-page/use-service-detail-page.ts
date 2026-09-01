import { useQuery } from '@tanstack/react-query';
import { fetchServiceDetail } from '@/services/landing-page';

export function useServiceDetailPageQuery(serviceSlug: string | undefined) {
  return useQuery({
    queryFn: () => fetchServiceDetail(serviceSlug),
    queryKey: ['service-detail-page', serviceSlug],
  });
}
