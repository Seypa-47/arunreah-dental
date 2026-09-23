import { useQuery } from '@tanstack/react-query';
import { publicBookingChrome } from '@/features/public-content/public-page-chrome';
import { getPublicBranches, getPublicContact, getPublicDoctors, getPublicPageMedia, getPublicServices } from '@/services/public-content';
import { getPublicMediaUrl } from '@/services/media';
import { mapBookingOptions } from '@/services/public-page-mappers';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';

export function useBookAppointmentPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const [services, doctors, branches, contact, heroMediaResponse] = await Promise.all([
        getPublicServices(language),
        getPublicDoctors(language),
        getPublicBranches(language, 'appointments'),
        getPublicContact(),
        getPublicPageMedia('BOOKING_HERO', language).catch(() => ({ items: [] })),
      ]);
      const content = mapBookingOptions(publicBookingChrome(language), services.services, doctors.doctors, branches.branches, contact, language);
      const heroItem = heroMediaResponse.items[0];
      if (heroItem) {
        return {
          ...content,
          hero: {
            ...content.hero,
            backgroundImageAlt: heroItem.title || content.hero.backgroundImageAlt,
            backgroundImageUrl: heroItem.imageKey ? (getPublicMediaUrl(heroItem.imageKey) ?? '') : content.hero.backgroundImageUrl,
            eyebrow: heroItem.badge || undefined,
            imagePresentation: heroItem.imagePresentation,
            subtitle: heroItem.body || content.hero.subtitle,
            title: heroItem.title || content.hero.title,
          },
        };
      }
      return content;
    },
    queryKey: [...queryKeys.public.bookingOptions(language), queryKeys.public.pageMedia('BOOKING_HERO', language)],
  });
}
