import { useQuery } from '@tanstack/react-query';
import { fetchServicesPage } from '@/services/landing-page';

export function useServicesPageQuery() {
  return useQuery({
    queryFn: fetchServicesPage,
    queryKey: ['services-page'],
  });
}
