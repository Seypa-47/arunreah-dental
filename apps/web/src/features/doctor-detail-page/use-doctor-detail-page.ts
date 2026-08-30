import { useQuery } from '@tanstack/react-query';
import { fetchDoctorDetail } from '@/services/landing-page';

export function useDoctorDetailPageQuery(profileSlug: string | undefined) {
  return useQuery({
    queryFn: () => fetchDoctorDetail(profileSlug),
    queryKey: ['doctor-detail', profileSlug],
  });
}
