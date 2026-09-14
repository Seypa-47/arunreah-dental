import { useQuery } from '@tanstack/react-query';
import { publicDoctorDetailChrome } from '@/features/public-content/public-page-chrome';
import { queryKeys } from '@/lib/query-keys';
import { getPublicDoctor } from '@/services/public-content';
import { mapDoctorDetail } from '@/services/public-page-mappers';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';

export function useDoctorDetailPageQuery(profileSlug: string | undefined) {
  const { language } = usePublicLanguage();
  return useQuery({
    enabled: Boolean(profileSlug),
    queryFn: async () => mapDoctorDetail(publicDoctorDetailChrome(), (await getPublicDoctor(profileSlug!, language)).doctor),
    queryKey: queryKeys.public.doctor(profileSlug ?? '', language),
  });
}
