import { useQuery } from '@tanstack/react-query';
import { publicAboutContent } from '@/features/public-content/public-page-chrome';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';
import { getPublicClinic } from '@/services/public-content';

export function useAboutPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => publicAboutContent(await getPublicClinic(), language),
    queryKey: [...queryKeys.public.clinic(), language, 'about'],
  });
}
