import { useQuery } from '@tanstack/react-query';
import { fetchBranchesPage } from '@/services/landing-page';

export function useBranchesPageQuery() {
  return useQuery({
    queryFn: fetchBranchesPage,
    queryKey: ['branches-page'],
  });
}
