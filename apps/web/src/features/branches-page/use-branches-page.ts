import { useQuery } from '@tanstack/react-query';
import { publicBranchesChrome } from '@/features/public-content/public-page-chrome';
import { queryKeys } from '@/lib/query-keys';
import { getPublicBranches } from '@/services/public-content';
import { getPublicMediaUrl } from '@/services/media';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';

export function useBranchesPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const response = await getPublicBranches(language);
      return {
        ...publicBranchesChrome(),
        branches: response.branches.map((branch) => ({
          address: branch.address,
          badge: branch.badge ?? branch.name,
          bookingLabel: branch.heroCtaLabel ?? 'Book at this Branch',
          directionsLabel: 'Get Directions',
          directionsUrl: branch.googleMapsUrl ?? '#',
          hoursDays: branch.openingDays ?? '',
          hoursTime: branch.openingHours ?? [branch.openingTime, branch.closingTime].filter(Boolean).join(' - '),
          imageAlt: branch.name,
          imageUrl: getPublicMediaUrl(branch.branchImageKey) ?? '',
          mapLabel: 'View on Map',
          mapUrl: branch.googleMapsUrl ?? '#',
          name: branch.name,
          phoneLabel: 'Call Now',
          phones: [branch.phone, branch.secondaryPhone].filter((phone): phone is string => Boolean(phone)),
        })),
      };
    },
    queryKey: queryKeys.public.branches(language),
  });
}
