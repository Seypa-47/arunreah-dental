import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

type CmsDomain = 'branches' | 'doctors' | 'services' | 'showcases';

/** Keep admin lists/details and every language-specific public representation coherent. */
export async function invalidateCmsDomain(queryClient: QueryClient, domain: CmsDomain): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['admin', domain] }),
    queryClient.invalidateQueries({ queryKey: ['public', domain] }),
  ]);
}

export async function invalidateCmsSettings(queryClient: QueryClient, setting: 'clinic' | 'contact'): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.admin[setting]() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.public[setting]() }),
  ]);
}
