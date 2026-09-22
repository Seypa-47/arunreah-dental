import { useQuery } from '@tanstack/react-query';
import { publicAboutContent } from '@/features/public-content/public-page-chrome';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';
import { getPublicAboutTimeline, getPublicClinic, getPublicDoctors, getPublicPageMedia, getPublicShowcase } from '@/services/public-content';
import { getPublicMediaUrl } from '@/services/media';

const clinicGalleryShowcaseSlug = 'what-to-expect-during-your-first-visit';

export function useAboutPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const [clinic, showcase, doctors, pageMedia, advancedFacilities, timeline, aboutHero] = await Promise.all([
        getPublicClinic(),
        getPublicShowcase(clinicGalleryShowcaseSlug, language).catch(() => undefined),
        getPublicDoctors(language).catch(() => ({ doctors: [] })),
        getPublicPageMedia('ABOUT_PROFESSIONAL_DEVELOPMENT', language).catch(() => ({ items: [] })),
        getPublicPageMedia('ABOUT_ADVANCED_FACILITIES', language).catch(() => ({ items: [] })),
        getPublicAboutTimeline(language).catch(() => ({ items: [] })),
        getPublicPageMedia('ABOUT_HERO', language).catch(() => ({ items: [] })),
      ]);
      const featuredDoctor = doctors.doctors.find((doctor) => doctor.featured) ?? doctors.doctors[0];
      const baseContent = publicAboutContent(clinic, language, showcase?.showcase, featuredDoctor, advancedFacilities.items);
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
      queryKeys.public.doctors(language),
      queryKeys.public.aboutTimeline(language),
      queryKeys.public.pageMedia('ABOUT_ADVANCED_FACILITIES', language),
      queryKeys.public.pageMedia('ABOUT_HERO', language),
      language,
      'about',
      clinicGalleryShowcaseSlug,
    ],
  });
}
