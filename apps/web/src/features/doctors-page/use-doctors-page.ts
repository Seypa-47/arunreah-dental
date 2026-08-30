import { useQuery } from '@tanstack/react-query';
import { fetchDoctorsPage } from '@/services/landing-page';

export function useDoctorsPageQuery() {
  return useQuery({
    queryFn: fetchDoctorsPage,
    queryKey: ['doctors-page'],
  });
}
