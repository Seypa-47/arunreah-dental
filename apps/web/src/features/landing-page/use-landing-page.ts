import { useQuery } from '@tanstack/react-query';
import { publicLandingChrome } from '@/features/public-content/public-page-chrome';
import { getPublicBranches, getPublicClinic, getPublicContact, getPublicDoctors, getPublicPageMedia, getPublicServices, getPublicShowcases } from '@/services/public-content';
import { getPublicMediaUrl } from '@/services/media';
import { toLandingDoctor, toLandingService } from '@/services/public-page-mappers';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';

export function useLandingPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const [clinic, contact, services, doctors, branches, showcases, promotions] = await Promise.all([
        getPublicClinic(),
        getPublicContact(),
        getPublicServices(language),
        getPublicDoctors(language),
        getPublicBranches(language),
        getPublicShowcases(language, true),
        getPublicPageMedia('HOME_PROMOTIONS', language).catch(() => ({ items: [] })),
      ]);
      const localizedName = language === 'km' ? clinic.clinicNameKm : clinic.clinicNameEn;
      const localizedTagline = language === 'km' ? clinic.taglineKm : clinic.taglineEn;
      const publicBranches = branches.branches;
      return {
        ...publicLandingChrome(language),
        branches: publicBranches.map((branch) => ({
          hours: branch.openingHours ?? '',
          imageAlt: branch.name,
          imageUrl: getPublicMediaUrl(branch.branchImageKey) ?? '',
          name: branch.name,
          phones: [branch.phone, branch.secondaryPhone].filter((phone): phone is string => Boolean(phone)),
        })),
        doctors: doctors.doctors.map(toLandingDoctor),
        footer: {
          ...publicLandingChrome(language).footer,
          branchLinks: publicBranches.map((branch) => ({ href: '/branches', label: branch.name })),
          description: language === 'km' ? clinic.shortAboutKm ?? '' : clinic.shortAboutEn ?? '',
          tagline: localizedTagline ?? localizedName,
        },
        heroes: publicBranches.map((branch) => ({
          address: branch.address,
          appointmentLabel: 'Book Appointment',
          callLabel: 'Call Us',
          imageAlt: branch.name,
          imageUrl: getPublicMediaUrl(branch.heroImageKey) ?? getPublicMediaUrl(branch.branchImageKey) ?? '',
          locationLabel: 'Location',
          phones: [contact.primaryPhone, contact.secondaryPhone].filter((phone): phone is string => Boolean(phone)),
          qrImageUrl: '/assets/landing/qr-code.png',
          qrLabel: 'Clinic information',
        })),
        promotions: promotions.items
          .map((promotion) => ({
            badge: promotion.badge ?? '',
            benefits: (promotion.benefits ?? '').split('\n').map((benefit) => benefit.trim()).filter(Boolean).slice(0, 3),
            description: promotion.body ?? '',
            imageAlt: promotion.title ?? (language === 'km' ? 'ព័ត៌មានពីគ្លីនិក' : 'Clinic promotion'),
            imageUrl: getPublicMediaUrl(promotion.imageKey) ?? '',
            discount: promotion.discount ?? '',
            title: promotion.title ?? '',
            validUntil: promotion.validUntil,
          }))
          .filter((promotion) => Boolean(promotion.imageUrl) && Boolean(promotion.title)),
        services: services.services.map(toLandingService),
        showcase: showcases.showcases.map((showcase) => ({
          imageAlt: showcase.title,
          imageUrl: getPublicMediaUrl(showcase.coverImageKey) ?? '',
          slug: showcase.slug,
          title: showcase.title,
        })),
      };
    },
    queryKey: [...queryKeys.public.landing(language), queryKeys.public.pageMedia('HOME_PROMOTIONS', language)],
  });
}
