import { useQuery } from '@tanstack/react-query';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';
import { publicServicesChrome } from '@/features/public-content/public-page-chrome';
import { getPublicShowcases } from '@/services/public-content';

export function useShowcasesPageQuery() {
  const { language } = usePublicLanguage();

  return useQuery({
    queryKey: queryKeys.public.showcases(language),
    queryFn: async () => {
      const response = await getPublicShowcases(language);
      return { chrome: publicServicesChrome(), showcases: response.showcases };
    },
  });
}
