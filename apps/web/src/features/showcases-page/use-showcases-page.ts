import { useQuery } from '@tanstack/react-query';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';
import { publicServicesChrome } from '@/features/public-content/public-page-chrome';
import { getPublicPageMedia, getPublicShowcases } from '@/services/public-content';

export function useShowcasesPageQuery() {
  const { language } = usePublicLanguage();

  return useQuery({
    queryKey: [...queryKeys.public.showcases(language), queryKeys.public.pageMedia('SHOWCASES_HERO', language)],
    queryFn: async () => {
      const [response, heroMediaResponse] = await Promise.all([
        getPublicShowcases(language),
        getPublicPageMedia('SHOWCASES_HERO', language).catch(() => ({ items: [] })),
      ]);
      return {
        chrome: publicServicesChrome(language),
        heroMedia: heroMediaResponse.items[0],
        showcases: response.showcases,
      };
    },
  });
}
