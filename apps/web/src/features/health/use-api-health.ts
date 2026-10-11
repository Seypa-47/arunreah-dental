import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getApiHealth } from '@/services/health';

export function useApiHealthQuery() {
  return useQuery({
    queryFn: ({ signal }) => getApiHealth(undefined, signal),
    queryKey: queryKeys.health(),
    retry: false,
  });
}
