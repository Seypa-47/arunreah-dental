import { useQuery } from '@tanstack/react-query';
import { publicAboutContent } from '@/features/public-content/public-page-chrome';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';
import {
  getPublicAboutTimeline,
  getPublicBookableDoctors,
  getPublicBranches,
  getPublicClinic,
  getPublicPageMedia,
} from '@/services/public-content';
import { getPublicMediaUrl } from '@/services/media';

export function useAboutPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const [
        clinic,
        psaChasGallery,
        toulTompoungGallery,
        branchesResponse,
        doctors,
        pageMedia,
        advancedFacilities,
        timeline,
        aboutHero,
      ] = await Promise.all([
        getPublicClinic(language),
        getPublicPageMedia('ABOUT_CLINIC_GALLERY_PSA_CHAS', language).catch(() => ({ items: [] })),
        getPublicPageMedia('ABOUT_CLINIC_GALLERY_TOUL_TOMPOUNG', language).catch(() => ({ items: [] })),
        getPublicBranches(language, 'branches').catch(() => ({ branches: [] })),
        getPublicBookableDoctors(language).catch(() => ({ doctors: [] })),
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
        featuredDoctor,
        advancedFacilities.items,
        branchesResponse.branches,
        {
          psaChas: psaChasGallery,
          toulTompoung: toulTompoungGallery,
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
      queryKeys.public.pageMedia('ABOUT_CLINIC_GALLERY_PSA_CHAS', language),
      queryKeys.public.pageMedia('ABOUT_CLINIC_GALLERY_TOUL_TOMPOUNG', language),
      queryKeys.public.pageMedia('ABOUT_HERO', language),
      language,
      'about',
    ],
  });
}
