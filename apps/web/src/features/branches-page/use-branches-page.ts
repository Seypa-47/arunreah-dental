import { useQuery } from '@tanstack/react-query';
import { publicBranchesChrome } from '@/features/public-content/public-page-chrome';
import { queryKeys } from '@/lib/query-keys';
import { getPublicBranches } from '@/services/public-content';
import { getPublicMediaUrl } from '@/services/media';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';

function formatBranchHours(openingDays: string | null | undefined, openingHours: string | null | undefined, openingTime: string | null | undefined, closingTime: string | null | undefined) {
  const days = openingDays?.trim() ?? '';
  const hours = openingHours?.trim() ?? [openingTime, closingTime].filter(Boolean).join(' - ');

  if (!days || !hours.toLocaleLowerCase().startsWith(days.toLocaleLowerCase())) {
    return { days, hours };
  }

  return { days, hours: hours.slice(days.length).replace(/^[:\s-]+/, '') };
}

export function useBranchesPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const response = await getPublicBranches(language);
      const chrome = publicBranchesChrome();
      const publicBranches = response.branches;
      const primaryBranch = publicBranches[0];
      const appointmentBranches = publicBranches.filter((branch) => branch.acceptsAppointments);

      return {
        ...chrome,
        branches: publicBranches.map((branch) => {
          const hours = formatBranchHours(branch.openingDays, branch.openingHours, branch.openingTime, branch.closingTime);

          return {
            address: branch.address,
            badge: branch.badge ?? branch.name,
            bookingLabel: branch.heroCtaLabel ?? 'Book at this Branch',
            directionsLabel: 'Get Directions',
            directionsUrl: branch.googleMapsUrl ?? '#',
            hoursDays: hours.days,
            hoursTime: hours.hours,
            imageAlt: branch.name,
            imageUrl: getPublicMediaUrl(branch.branchImageKey) ?? '',
            mapLabel: 'View on Map',
            mapUrl: branch.googleMapsUrl ?? '#',
            name: branch.name,
            phoneLabel: 'Call Now',
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
          backgroundImageAlt: primaryBranch?.name ?? '',
          backgroundImageUrl: getPublicMediaUrl(primaryBranch?.heroImageKey) ?? '',
          eyebrow: primaryBranch?.badge ?? '',
          metrics: [
            {
              description: `${publicBranches.length} published clinic location${publicBranches.length === 1 ? '' : 's'}`,
              iconUrl: '',
              label: 'Locations',
              title: String(publicBranches.length),
            },
            {
              description: 'available to receive appointment requests',
              iconUrl: '',
              label: 'Appointments',
              title: String(appointmentBranches.length),
            },
          ],
          subtitle: primaryBranch?.heroSupportingText ?? chrome.hero.subtitle,
        },
      };
    },
    queryKey: queryKeys.public.branches(language),
  });
}
