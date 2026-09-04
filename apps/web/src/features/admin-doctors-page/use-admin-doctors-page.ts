import { useQuery } from '@tanstack/react-query';
import type { AdminDoctorListQuery } from '@arunreah/shared';
import { queryKeys } from '@/lib/query-keys';
import { fetchAdminDoctorsContent } from '@/services/admin-doctors';

export function useAdminDoctorsPageQuery(query: Partial<AdminDoctorListQuery>) {
  return useQuery({
    queryFn: () => fetchAdminDoctorsContent(query),
    queryKey: queryKeys.admin.doctors(query),
  });
}
