import { useQuery } from '@tanstack/react-query';
import { publicContactChrome } from '@/features/public-content/public-page-chrome';
import { formatPublicBranchHours, formatPublicBranchSchedules } from '@/features/public-content/public-branch';
import { queryKeys } from '@/lib/query-keys';
import { getPublicBranches, getPublicContact, getPublicPageMedia, getPublicServices } from '@/services/public-content';
import { toLandingService } from '@/services/public-page-mappers';
import { getPublicMediaUrl } from '@/services/media';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { getBranchCoordinates, getBranchDefaultMapUrl } from '@/features/branches-page/branch-coordinates';

export function useContactPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const isKm = language === 'km';
      const [contact, branchResponse, serviceResponse, heroMediaResponse] = await Promise.all([
        getPublicContact(),
        getPublicBranches(language),
        getPublicServices(language),
        getPublicPageMedia('CONTACT_HERO', language).catch(() => ({ items: [] })),
      ]);
      const heroItem = heroMediaResponse.items[0];
      const branches = branchResponse.branches;
      const primaryBranch = branches[0];
      const primaryBranchHours = primaryBranch ? formatPublicBranchHours(primaryBranch) : { days: '', time: '' };
      const fallbackBranchHours = [primaryBranchHours.days, primaryBranchHours.time].filter(Boolean).join(': ');
      const configuredPhones = [contact.primaryPhone, contact.secondaryPhone].filter((value): value is string => Boolean(value && value.trim()));
      const fallbackPhones = primaryBranch ? [primaryBranch.phone, primaryBranch.secondaryPhone].filter((value): value is string => Boolean(value && value.trim())) : [];
      const phones = configuredPhones.length > 0 ? configuredPhones : fallbackPhones;
      const defaultHours = (isKm ? contact.businessHoursKm || contact.businessHoursEn : contact.businessHoursEn || contact.businessHoursKm) || fallbackBranchHours;
      const configuredAddress = isKm ? contact.addressKm || contact.addressEn : contact.addressEn || contact.addressKm;
      const locationsCountText = isKm ? `ទីតាំងគ្លីនិកទាំង ${branches.length}` : `${branches.length} clinic location${branches.length === 1 ? '' : 's'}`;
      const locationsText = configuredAddress?.trim() || primaryBranch?.address?.trim() || locationsCountText;

      const branchContacts = branches.map((branch) => {
        const schedules = formatPublicBranchSchedules(branch);
        const scheduleLines = schedules
          .map((item) => (item.days && item.time ? `${item.days}: ${item.time}` : item.days || item.time))
          .filter(Boolean)
          .join('\n');
        const singleHours = formatPublicBranchHours(branch);
        const singleFormatted = [singleHours.days, singleHours.time].filter(Boolean).join(': ');
        const branchHours = scheduleLines || singleFormatted || branch.openingHours || defaultHours;
        const branchPhones = [branch.phone, branch.secondaryPhone].filter((value): value is string => Boolean(value && value.trim()));
        const effectivePhones = branchPhones.length > 0 ? branchPhones : phones;
        const effectiveAddress = branch.address?.trim() || configuredAddress?.trim() || locationsCountText;
        const resolvedDirectionsUrl = getBranchDefaultMapUrl(branch.slug || branch.name, branch.googleMapsUrl);

        const branchInfo = [
          effectivePhones.length > 0
            ? {
                description: branch.name,
                icon: 'phone' as const,
                label: isKm ? 'ទូរស័ព្ទមកយើង' : 'Call Us',
                value: effectivePhones.join('\n'),
              }
            : null,
          contact.primaryEmail
            ? {
                description: contact.primaryEmail,
                icon: 'email' as const,
                label: isKm ? 'អ៊ីមែលមកយើង' : 'Email Us',
                value: contact.primaryEmail,
              }
            : null,
          branchHours
            ? {
                description: branch.name,
                icon: 'clock' as const,
                label: isKm ? 'ម៉ោងធ្វើការ' : 'Opening Hours',
                value: branchHours,
              }
            : null,
          {
            description: branch.name,
            icon: 'location' as const,
            label: isKm ? 'មកកាន់យើង' : 'Visit Us',
            value: effectiveAddress,
          },
        ].filter((item): item is NonNullable<typeof item> => item !== null);

        return {
          address: effectiveAddress,
          badge: branch.badge ?? undefined,
          directionsUrl: resolvedDirectionsUrl,
          hours: branchHours,
          id: branch.id,
          info: branchInfo,
          name: branch.name,
          phones: effectivePhones,
          slug: branch.slug,
        };
      });

      const info =
        branchContacts[0]?.info ??
        [
          phones.length > 0 ? { description: phones.join('\n'), icon: 'phone' as const, label: isKm ? 'ទូរស័ព្ទមកយើង' : 'Call Us', value: phones.join('\n') } : null,
          contact.primaryEmail ? { description: contact.primaryEmail, icon: 'email' as const, label: isKm ? 'អ៊ីមែលមកយើង' : 'Email Us', value: contact.primaryEmail } : null,
          defaultHours ? { description: defaultHours, icon: 'clock' as const, label: isKm ? 'ម៉ោងធ្វើការ' : 'Opening Hours', value: defaultHours } : null,
          { description: configuredAddress?.trim() ? locationsCountText : locationsText, icon: 'location' as const, label: isKm ? 'មកកាន់យើង' : 'Visit Us', value: locationsText },
        ].filter((item): item is NonNullable<typeof item> => item !== null);

      const chrome = publicContactChrome(language);
      return {
        ...chrome,
        branchContacts,
        contactCards: info,
        form: { ...chrome.form, branches: branches.map((branch) => branch.name), services: serviceResponse.services.map((service) => service.name) },
        hero: {
          ...chrome.hero,
          backgroundImageAlt: heroItem?.title || chrome.hero.backgroundImageAlt,
          backgroundImageUrl: heroItem?.imageKey ? (getPublicMediaUrl(heroItem.imageKey) ?? '') : chrome.hero.backgroundImageUrl,
          imagePresentation: heroItem?.imagePresentation,
          eyebrow: heroItem?.badge || chrome.hero.eyebrow,
          info,
          subtitle: heroItem?.body || chrome.hero.subtitle,
          title: heroItem?.title || chrome.hero.title,
        },
        maps: branches.map((branch) => {
          const coords = getBranchCoordinates(branch.slug || branch.name, branch.googleMapsUrl);
          const resolvedDirectionsUrl = getBranchDefaultMapUrl(branch.slug || branch.name, branch.googleMapsUrl);
          const schedules = formatPublicBranchSchedules(branch);
          const scheduleSummary = schedules
            .map((item) => (item.days && item.time ? `${item.days}: ${item.time}` : item.days || item.time))
            .filter(Boolean)
            .join(' | ');
          const branchHours = formatPublicBranchHours(branch);
          const formattedHours = scheduleSummary || [branchHours.days, branchHours.time].filter(Boolean).join(': ') || branch.openingHours || undefined;
          return {
            address: branch.address,
            badge: branch.badge ?? undefined,
            directionsUrl: resolvedDirectionsUrl,
            hours: formattedHours,
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
    queryKey: [
      ...queryKeys.public.contact(),
      queryKeys.public.branches(language),
      queryKeys.public.pageMedia('CONTACT_HERO', language),
      language,
    ],
  });
}


