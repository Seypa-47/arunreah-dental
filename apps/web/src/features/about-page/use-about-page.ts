import { useQuery } from '@tanstack/react-query';
import { publicAboutContent } from '@/features/public-content/public-page-chrome';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';
import { getPublicAboutTimeline, getPublicBranches, getPublicClinic, getPublicContact, getPublicDoctors, getPublicPageMedia, getPublicShowcase } from '@/services/public-content';
import { getPublicMediaUrl } from '@/services/media';

const clinicGalleryShowcaseSlug = 'what-to-expect-during-your-first-visit';

export function useAboutPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const isKm = language === 'km';
      const [clinic, contact, branchResponse, showcase, doctors, pageMedia, advancedFacilities, timeline, aboutHero] = await Promise.all([
        getPublicClinic(),
        getPublicContact().catch(() => ({ primaryPhone: '098 701 302', secondaryPhone: '012 964 200', primaryEmail: 'info@arunreahclinic.com', businessHoursEn: 'Mon - Sun: 8:00 AM - 7:00 PM', businessHoursKm: 'ច័ន្ទ - អាទិត្យ: ៨:០០ ព្រឹក - ៧:០០ ល្ងាច' })),
        getPublicBranches(language).catch(() => ({ branches: [] })),
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

      const phones = [contact.primaryPhone, contact.secondaryPhone].filter((value): value is string => Boolean(value));
      const hours = isKm ? contact.businessHoursKm : contact.businessHoursEn;
      const branches = branchResponse.branches;
      const locationsText = isKm ? `ទីតាំងគ្លីនិកទាំង ${branches.length || 2}` : `${branches.length || 2} clinic locations`;
      const info = [
        phones.length > 0 ? { description: phones.join('\n'), icon: 'phone' as const, label: isKm ? 'ទូរស័ព្ទមកយើង' : 'Call Us', value: phones.join('\n') } : null,
        contact.primaryEmail ? { description: contact.primaryEmail, icon: 'email' as const, label: isKm ? 'អ៊ីមែលមកយើង' : 'Email Us', value: contact.primaryEmail } : null,
        hours ? { description: hours, icon: 'clock' as const, label: isKm ? 'ម៉ោងធ្វើការ' : 'Opening Hours', value: hours } : null,
        { description: locationsText, icon: 'location' as const, label: isKm ? 'មកកាន់យើង' : 'Visit Us', value: locationsText },
      ].filter((item): item is NonNullable<typeof item> => item !== null);

      const hero = heroItem
        ? {
            ...baseContent.hero,
            title: heroItem.title || baseContent.hero.title,
            subtitle: heroItem.body || baseContent.hero.subtitle,
            eyebrow: heroItem.badge || baseContent.hero.eyebrow,
            imageUrl: (heroItem.imageKey ? getPublicMediaUrl(heroItem.imageKey) : null) ?? baseContent.hero.imageUrl,
            imagePresentation: heroItem.imagePresentation,
            info,
          }
        : {
            ...baseContent.hero,
            info,
          };

      return {
        ...baseContent,
        hero,
        professionalMedia: pageMedia.items,
        timeline: timeline.items,
      };
    },
    queryKey: [
      ...queryKeys.public.clinic(),
      ...queryKeys.public.contact(),
      queryKeys.public.branches(language),
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
