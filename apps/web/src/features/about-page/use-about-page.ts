import { useQuery } from '@tanstack/react-query';
import { fetchAboutPage } from '@/services/landing-page';

export function useAboutPageQuery() {
  return useQuery({
    queryFn: fetchAboutPage,
    queryKey: ['about-page'],
  });
}
