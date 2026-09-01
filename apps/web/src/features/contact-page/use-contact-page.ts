import { useQuery } from '@tanstack/react-query';
import { fetchContactPage } from '@/services/landing-page';

export function useContactPageQuery() {
  return useQuery({
    queryFn: fetchContactPage,
    queryKey: ['contact-page'],
  });
}
