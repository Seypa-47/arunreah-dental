import { useQuery } from '@tanstack/react-query';
import { publicServicesChrome } from '@/features/public-content/public-page-chrome';
import { queryKeys } from '@/lib/query-keys';
import { getPublicPageMedia, getPublicServices } from '@/services/public-content';
import { getPublicMediaUrl } from '@/services/media';
import { mapServicesPage } from '@/services/public-page-mappers';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';

export function useServicesPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const [servicesResponse, heroMediaResponse] = await Promise.all([
        getPublicServices(language),
        getPublicPageMedia('SERVICES_HERO', language).catch(() => ({ items: [] })),
      ]);
      const content = mapServicesPage(publicServicesChrome(), servicesResponse.services);
      const heroItem = heroMediaResponse.items[0];
      if (heroItem) {
        return {
          ...content,
          hero: {
            ...content.hero,
            title: heroItem.title || content.hero.title,
            description: heroItem.body || content.hero.description,
            eyebrow: heroItem.badge || undefined,
            imageUrl: heroItem.imageKey ? getPublicMediaUrl(heroItem.imageKey) : undefined,
            imagePresentation: heroItem.imagePresentation,
          },
        };
      }
      return content;
    },
    queryKey: [...queryKeys.public.services(language), queryKeys.public.pageMedia('SERVICES_HERO', language)],
  });
}
