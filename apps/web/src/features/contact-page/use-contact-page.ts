import { useQuery } from '@tanstack/react-query';
import { publicContactChrome } from '@/features/public-content/public-page-chrome';
import { queryKeys } from '@/lib/query-keys';
import { getPublicBranches, getPublicContact, getPublicServices } from '@/services/public-content';
import { toLandingService } from '@/services/public-page-mappers';
import { getPublicMediaUrl } from '@/services/media';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { getBranchCoordinates } from '@/features/branches-page/branch-coordinates';

export function useContactPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const isKm = language === 'km';
      const [contact, branchResponse, serviceResponse] = await Promise.all([
        getPublicContact(),
        getPublicBranches(language),
        getPublicServices(language),
      ]);
      const phones = [contact.primaryPhone, contact.secondaryPhone].filter((value): value is string => Boolean(value));
      const hours = isKm ? contact.businessHoursKm : contact.businessHoursEn;
      const branches = branchResponse.branches;
      const locationsText = isKm ? `ទីតាំងគ្លីនិកទាំង ${branches.length}` : `${branches.length} clinic locations`;
      const info = [
        { description: phones.join('\n'), icon: 'phone' as const, label: isKm ? 'ទូរស័ព្ទមកយើង' : 'Call Us', value: phones.join('\n') },
        contact.primaryEmail ? { description: contact.primaryEmail, icon: 'email' as const, label: isKm ? 'អ៊ីមែលមកយើង' : 'Email Us', value: contact.primaryEmail } : null,
        hours ? { description: hours, icon: 'clock' as const, label: isKm ? 'ម៉ោងធ្វើការ' : 'Opening Hours', value: hours } : null,
        { description: locationsText, icon: 'location' as const, label: isKm ? 'មកកាន់យើង' : 'Visit Us', value: locationsText },
      ].filter((item): item is NonNullable<typeof item> => item !== null);
      const chrome = publicContactChrome(language);
      return {
        ...chrome,
        contactCards: info,
        form: { ...chrome.form, branches: branches.map((branch) => branch.name), services: serviceResponse.services.map((service) => service.name) },
        hero: { ...chrome.hero, info },
        maps: branches.map((branch) => {
          const coords = getBranchCoordinates(branch.name ?? branch.slug);
          return {
            address: branch.address,
            badge: branch.badge ?? undefined,
            directionsUrl: branch.googleMapsUrl ?? undefined,
            hours: branch.openingHours ?? undefined,
            imageAlt: branch.name,
            imagePresentation: branch.branchImagePresentation,
            imageUrl: getPublicMediaUrl(branch.branchImageKey) ?? '',
            label: branch.name,
            lat: coords.lat,
            lng: coords.lng,
            name: branch.name,
            phone: [branch.phone, branch.secondaryPhone].filter(Boolean).join(' / '),
          };
        }),
        services: serviceResponse.services.map(toLandingService),
      };
    },
    queryKey: [...queryKeys.public.contact(), language],
  });
}
