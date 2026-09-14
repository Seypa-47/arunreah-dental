import { useQuery } from '@tanstack/react-query';
import { publicAboutContent } from '@/features/public-content/public-page-chrome';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';
import { getPublicAboutTimeline, getPublicClinic, getPublicDoctors, getPublicPageMedia, getPublicShowcase } from '@/services/public-content';

const clinicGalleryShowcaseSlug = 'what-to-expect-during-your-first-visit';

export function useAboutPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const [clinic, showcase, doctors, pageMedia, advancedFacilities, timeline] = await Promise.all([
        getPublicClinic(),
        getPublicShowcase(clinicGalleryShowcaseSlug, language).catch(() => undefined),
        getPublicDoctors(language).catch(() => ({ doctors: [] })),
        getPublicPageMedia('ABOUT_PROFESSIONAL_DEVELOPMENT', language).catch(() => ({ items: [] })),
        getPublicPageMedia('ABOUT_ADVANCED_FACILITIES', language).catch(() => ({ items: [] })),
        getPublicAboutTimeline(language).catch(() => ({ items: [] })),
      ]);
      const featuredDoctor = doctors.doctors.find((doctor) => doctor.featured) ?? doctors.doctors[0];
      return {
        ...publicAboutContent(clinic, language, showcase?.showcase, featuredDoctor, advancedFacilities.items),
        professionalMedia: pageMedia.items,
        timeline: timeline.items,
      };
    },
    queryKey: [
      ...queryKeys.public.clinic(),
      queryKeys.public.doctors(language),
      queryKeys.public.aboutTimeline(language),
      queryKeys.public.pageMedia('ABOUT_ADVANCED_FACILITIES', language),
      language,
      'about',
      clinicGalleryShowcaseSlug,
    ],
  });
}
