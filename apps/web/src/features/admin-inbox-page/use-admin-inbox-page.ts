import { useQuery } from '@tanstack/react-query';
import { fetchAdminInboxContent } from '@/services/admin-inbox';

export function useAdminInboxPageQuery() {
  return useQuery({
    queryFn: fetchAdminInboxContent,
    queryKey: ['admin-appointment-inbox'],
  });
}
