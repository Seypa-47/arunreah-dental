import { useQuery } from '@tanstack/react-query';
import { publicDoctorsChrome } from '@/features/public-content/public-page-chrome';
import { queryKeys } from '@/lib/query-keys';
import { getPublicDoctors } from '@/services/public-content';
import { mapDoctorsPage } from '@/services/public-page-mappers';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';

export function useDoctorsPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => mapDoctorsPage(publicDoctorsChrome(), (await getPublicDoctors(language)).doctors),
    queryKey: queryKeys.public.doctors(language),
  });
}
