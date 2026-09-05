import { useQuery } from '@tanstack/react-query';
import { publicContactChrome } from '@/features/public-content/public-page-chrome';
import { queryKeys } from '@/lib/query-keys';
import { getPublicBranches, getPublicContact, getPublicServices } from '@/services/public-content';
import { toLandingService } from '@/services/public-page-mappers';
import { getPublicMediaUrl } from '@/services/media';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';

export function useContactPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const [contact, branchResponse, serviceResponse] = await Promise.all([
        getPublicContact(),
        getPublicBranches(language),
        getPublicServices(language),
      ]);
      const phones = [contact.primaryPhone, contact.secondaryPhone].filter((value): value is string => Boolean(value));
      const hours = language === 'km' ? contact.businessHoursKm : contact.businessHoursEn;
      const branches = branchResponse.branches;
      const info = [
        { description: phones.join('\n'), icon: 'phone' as const, label: 'Call Us', value: phones.join('\n') },
        contact.primaryEmail ? { description: contact.primaryEmail, icon: 'email' as const, label: 'Email Us', value: contact.primaryEmail } : null,
        hours ? { description: hours, icon: 'clock' as const, label: 'Opening Hours', value: hours } : null,
        { description: `${branches.length} clinic locations`, icon: 'location' as const, label: 'Visit Us', value: `${branches.length} clinic locations` },
      ].filter((item): item is NonNullable<typeof item> => item !== null);
      return {
        ...publicContactChrome(),
        contactCards: info,
        form: { ...publicContactChrome().form, branches: branches.map((branch) => branch.name), services: serviceResponse.services.map((service) => service.name) },
        hero: { ...publicContactChrome().hero, info },
        maps: branches.map((branch) => ({
          address: branch.address,
          badge: branch.badge ?? undefined,
          directionsUrl: branch.googleMapsUrl ?? undefined,
          hours: branch.openingHours ?? undefined,
          imageAlt: branch.name,
          imageUrl: getPublicMediaUrl(branch.branchImageKey) ?? '',
          label: branch.name,
          name: branch.name,
          phone: [branch.phone, branch.secondaryPhone].filter(Boolean).join(' / '),
        })),
        services: serviceResponse.services.map(toLandingService),
      };
    },
    queryKey: [...queryKeys.public.contact(), language],
  });
}
