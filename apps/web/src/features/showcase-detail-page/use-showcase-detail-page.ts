import { useQuery } from '@tanstack/react-query';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';
import { publicServicesChrome } from '@/features/public-content/public-page-chrome';
import { getPublicShowcase } from '@/services/public-content';

export function useShowcaseDetailPageQuery(slug: string | undefined) {
  const { language } = usePublicLanguage();

  return useQuery({
    queryKey: queryKeys.public.showcase(slug ?? '', language),
    enabled: Boolean(slug),
    queryFn: async () => {
      const response = await getPublicShowcase(slug!, language);
      return { chrome: publicServicesChrome(), showcase: response.showcase };
    },
  });
}
