import { useQuery } from '@tanstack/react-query';
import { fetchLandingPage } from '@/services/landing-page';

export function useLandingPageQuery() {
  return useQuery({
    queryFn: fetchLandingPage,
    queryKey: ['landing-page'],
  });
}
