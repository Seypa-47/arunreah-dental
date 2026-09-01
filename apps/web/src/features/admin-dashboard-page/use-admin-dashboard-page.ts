import { useQuery } from '@tanstack/react-query';
import { fetchAdminDashboardContent } from '@/services/admin-dashboard';

export function useAdminDashboardPageQuery() {
  return useQuery({
    queryFn: fetchAdminDashboardContent,
    queryKey: ['admin-dashboard-page'],
  });
}
