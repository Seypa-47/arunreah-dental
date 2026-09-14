import { useQuery } from '@tanstack/react-query';
import { publicServicesChrome } from '@/features/public-content/public-page-chrome';
import { queryKeys } from '@/lib/query-keys';
import { getPublicServices } from '@/services/public-content';
import { mapServicesPage } from '@/services/public-page-mappers';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';

export function useServicesPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => mapServicesPage(publicServicesChrome(), (await getPublicServices(language)).services),
    queryKey: queryKeys.public.services(language),
  });
}
