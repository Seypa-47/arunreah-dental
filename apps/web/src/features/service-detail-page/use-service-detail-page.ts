import { useQuery } from '@tanstack/react-query';
import { publicServiceDetailChrome } from '@/features/public-content/public-page-chrome';
import { queryKeys } from '@/lib/query-keys';
import { getPublicService } from '@/services/public-content';
import { mapServiceDetail } from '@/services/public-page-mappers';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';

export function useServiceDetailPageQuery(serviceSlug: string | undefined) {
  const { language } = usePublicLanguage();
  return useQuery({
    enabled: Boolean(serviceSlug),
    queryFn: async () => mapServiceDetail(publicServiceDetailChrome(), (await getPublicService(serviceSlug!, language)).service),
    queryKey: queryKeys.public.service(serviceSlug ?? '', language),
  });
}
