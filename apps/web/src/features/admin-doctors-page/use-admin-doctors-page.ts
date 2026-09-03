import { useQuery } from '@tanstack/react-query';
import { fetchAdminDoctorsContent } from '@/services/admin-doctors';

export function useAdminDoctorsPageQuery() {
  return useQuery({
    queryFn: fetchAdminDoctorsContent,
    queryKey: ['admin-doctors-page'],
  });
}

