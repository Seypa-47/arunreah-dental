import { useQuery } from '@tanstack/react-query';
import { publicBranchesChrome } from '@/features/public-content/public-page-chrome';
import { queryKeys } from '@/lib/query-keys';
import { getPublicBranches, getPublicPageMedia } from '@/services/public-content';
import { getPublicMediaUrl } from '@/services/media';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { formatPublicBranchHours, formatPublicBranchSchedules } from '@/features/public-content/public-branch';

export { formatPublicBranchHours as formatBranchHours };

export function useBranchesPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const isKm = language === 'km';
      const [response, heroMediaResponse] = await Promise.all([
        getPublicBranches(language),
        getPublicPageMedia('BRANCHES_HERO', language).catch(() => ({ items: [] })),
      ]);
      const chrome = publicBranchesChrome(language);
      const publicBranches = response.branches;
      const primaryBranch = publicBranches[0];
      const appointmentBranches = publicBranches.filter((branch) => branch.acceptsAppointments);
      const heroItem = heroMediaResponse.items[0];

      return {
        ...chrome,
        branches: publicBranches.map((branch) => {
          const hours = formatPublicBranchHours(branch);
          const hoursSchedules = formatPublicBranchSchedules(branch);

          return {
            address: branch.address,
            badge: branch.badge ?? branch.name,
            bookingLabel: branch.heroCtaLabel ?? (isKm ? 'កក់នៅសាខានេះ' : 'Book at this Branch'),
            directionsLabel: isKm ? 'ស្វែងរកផ្លូវ' : 'Get Directions',
            directionsUrl: branch.googleMapsUrl ?? '#',
            hoursDays: hours.days,
            hoursTime: hours.time,
            hoursSchedules,
            id: branch.id,
            imageAlt: branch.name,
            imagePresentation: branch.branchImagePresentation,
            imageUrl: getPublicMediaUrl(branch.branchImageKey) ?? '',
            mapLabel: isKm ? 'មើលលើផែនទី' : 'View on Map',
            mapUrl: branch.googleMapsUrl ?? '#',
            name: branch.name,
            phoneLabel: isKm ? 'ទូរស័ព្ទឥឡូវ' : 'Call Now',
            phones: [branch.phone, branch.secondaryPhone].filter((phone): phone is string => Boolean(phone)),
          };
        }),
        cta: {
          ...chrome.cta,
          backgroundImageAlt: primaryBranch?.name ?? '',
          backgroundImageUrl: getPublicMediaUrl(primaryBranch?.heroImageKey) ?? '',
        },
        hero: {
          ...chrome.hero,
          backgroundImageAlt: heroItem?.title || primaryBranch?.name || chrome.hero.backgroundImageAlt,
          backgroundImageUrl: heroItem?.imageKey ? (getPublicMediaUrl(heroItem.imageKey) ?? '') : (getPublicMediaUrl(primaryBranch?.heroImageKey) ?? ''),
          imagePresentation: heroItem?.imagePresentation,
          eyebrow: heroItem?.badge || primaryBranch?.badge || chrome.hero.eyebrow,
          title: heroItem?.title || chrome.hero.title,
          metrics: [
            {
              description: isKm ? `ទីតាំងគ្លីនិកទាំង ${publicBranches.length}` : `${publicBranches.length} published clinic location${publicBranches.length === 1 ? '' : 's'}`,
              iconUrl: '',
              label: isKm ? 'សាខា' : 'Locations',
              title: String(publicBranches.length),
            },
            {
              description: isKm ? 'ទទួលយកការស្នើសុំណាត់ជួប' : 'available to receive appointment requests',
              iconUrl: '',
              label: isKm ? 'ការណាត់ជួប' : 'Appointments',
              title: String(appointmentBranches.length),
            },
          ],
          subtitle: heroItem?.body || chrome.hero.subtitle,
        },
      };
    },
    queryKey: [...queryKeys.public.branches(language), queryKeys.public.pageMedia('BRANCHES_HERO', language)],
  });
}
