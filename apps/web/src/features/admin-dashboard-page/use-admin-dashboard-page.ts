import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getAdminDashboard } from '@/services/dashboard';

export function useAdminDashboardPageQuery() {
  return useQuery({
    queryFn: () => getAdminDashboard(),
    queryKey: queryKeys.dashboard(),
    retry: false,
  });
}
