import { useQuery } from '@tanstack/react-query';
import { publicAboutContent } from '@/features/public-content/public-page-chrome';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';
import {
  getPublicAboutTimeline,
  getPublicBranches,
  getPublicClinic,
  getPublicDoctors,
  getPublicPageMedia,
  getPublicShowcase,
} from '@/services/public-content';
import { getPublicMediaUrl } from '@/services/media';

const clinicGalleryToulTompoungSlug = 'what-to-expect-during-your-first-visit';
const clinicGalleryPsaChasSlug = 'what-to-expect-during-your-first-visit-psa-chas';

export function useAboutPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const [
        clinic,
        showcaseTtp,
        showcasePsaChas,
        branchesResponse,
        doctors,
        pageMedia,
        advancedFacilities,
        timeline,
        aboutHero,
      ] = await Promise.all([
        getPublicClinic(),
        getPublicShowcase(clinicGalleryToulTompoungSlug, language).catch(() => undefined),
        getPublicShowcase(clinicGalleryPsaChasSlug, language).catch(() => undefined),
        getPublicBranches(language, 'branches').catch(() => ({ branches: [] })),
        getPublicDoctors(language).catch(() => ({ doctors: [] })),
        getPublicPageMedia('ABOUT_PROFESSIONAL_DEVELOPMENT', language).catch(() => ({ items: [] })),
        getPublicPageMedia('ABOUT_ADVANCED_FACILITIES', language).catch(() => ({ items: [] })),
        getPublicAboutTimeline(language).catch(() => ({ items: [] })),
        getPublicPageMedia('ABOUT_HERO', language).catch(() => ({ items: [] })),
      ]);
      // The clinic's leadership portraits: the first two featured doctors, in CMS
      // display order. Who appears is controlled from the admin, never hard-coded.
      const featuredDoctors = doctors.doctors.filter((doctor) => doctor.featured);
      const [featuredDoctor = doctors.doctors[0], secondFeaturedDoctor] = featuredDoctors.length > 0 ? featuredDoctors : doctors.doctors;
      const baseContent = publicAboutContent(
        clinic,
        language,
        showcaseTtp?.showcase,
        featuredDoctor,
        advancedFacilities.items,
        branchesResponse.branches,
        {
          psaChas: showcasePsaChas?.showcase,
          toulTompoung: showcaseTtp?.showcase,
        },
        secondFeaturedDoctor,
      );
      const heroItem = aboutHero.items[0];

      const hero = heroItem
        ? {
            ...baseContent.hero,
            title: heroItem.title || baseContent.hero.title,
            subtitle: heroItem.body || baseContent.hero.subtitle,
            eyebrow: heroItem.badge || baseContent.hero.eyebrow,
            imageUrl: (heroItem.imageKey ? getPublicMediaUrl(heroItem.imageKey) : null) ?? baseContent.hero.imageUrl,
            imagePresentation: heroItem.imagePresentation,
          }
        : baseContent.hero;

      return {
        ...baseContent,
        hero,
        professionalMedia: pageMedia.items,
        timeline: timeline.items,
      };
    },
    queryKey: [
      ...queryKeys.public.clinic(),
      queryKeys.public.branches(language),
      queryKeys.public.doctors(language),
      queryKeys.public.aboutTimeline(language),
      queryKeys.public.pageMedia('ABOUT_ADVANCED_FACILITIES', language),
      queryKeys.public.pageMedia('ABOUT_HERO', language),
      language,
      'about',
      clinicGalleryPsaChasSlug,
      clinicGalleryToulTompoungSlug,
    ],
  });
}
