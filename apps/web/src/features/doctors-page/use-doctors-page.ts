import { useQuery } from '@tanstack/react-query';
import { publicDoctorsChrome } from '@/features/public-content/public-page-chrome';
import { queryKeys } from '@/lib/query-keys';
import { getPublicDoctors, getPublicPageMedia } from '@/services/public-content';
import { mapDoctorsPage } from '@/services/public-page-mappers';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';

export function useDoctorsPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const [doctors, heroMedia, patientEducation] = await Promise.all([
        getPublicDoctors(language),
        getPublicPageMedia('DOCTORS_HERO', language).catch(() => ({ items: [] })),
        getPublicPageMedia('DOCTORS_PATIENT_EDUCATION', language).catch(() => ({ items: [] })),
      ]);
      return { ...mapDoctorsPage(publicDoctorsChrome(), doctors.doctors), heroMedia: heroMedia.items[0], patientEducation: patientEducation.items };
    },
    queryKey: [...queryKeys.public.doctors(language), queryKeys.public.pageMedia('DOCTORS_HERO', language), queryKeys.public.pageMedia('DOCTORS_PATIENT_EDUCATION', language)],
  });
}
