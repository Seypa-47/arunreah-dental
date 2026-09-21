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
      const [clinic, contact, services, doctors, branches, showcases, promotions, homeHeroResponse] = await Promise.all([
        getPublicClinic(),
        getPublicContact(),
        getPublicServices(language),
        getPublicDoctors(language),
        getPublicBranches(language, 'landing'),
        getPublicShowcases(language, true),
        getPublicPageMedia('HOME_PROMOTIONS', language).catch(() => ({ items: [] })),
        getPublicPageMedia('HOME_HERO', language).catch(() => ({ items: [] })),
      ]);
      const localizedName = language === 'km' ? clinic.clinicNameKm : clinic.clinicNameEn;
      const localizedTagline = language === 'km' ? clinic.taglineKm : clinic.taglineEn;
      const publicBranches = branches.branches;
      const homepageBranches = publicBranches.filter((branch) => branch.showOnHomepage);
      const heroBranches = publicBranches.filter((branch) => branch.includeInHomepageHero);
      const isKm = language === 'km';
      const heroItem = homeHeroResponse.items[0];
      const cmsHeroSlide = heroItem
        ? {
            address: heroItem.body || (heroBranches[0]?.address ?? clinic.clinicNameEn),
            appointmentLabel: isKm ? 'កក់ការណាត់ជួប' : 'Book Appointment',
            callLabel: isKm ? 'ទូរស័ព្ទមកយើង' : 'Call Us',
            imageAlt: heroItem.title || clinic.clinicNameEn,
            imagePresentation: heroItem.imagePresentation,
            imageUrl: heroItem.imageKey ? (getPublicMediaUrl(heroItem.imageKey) ?? '') : (heroBranches[0]?.heroImageKey ? (getPublicMediaUrl(heroBranches[0].heroImageKey) ?? '') : '/assets/landing/hero-clinic.png'),
            locationLabel: heroItem.badge || (isKm ? 'ទីតាំង' : 'Location'),
            phones: [contact.primaryPhone, contact.secondaryPhone].filter((phone): phone is string => Boolean(phone)),
            qrImageUrl: '/assets/landing/qr-code.png',
            qrLabel: isKm ? 'ព័ត៌មានគ្លីនិក' : 'Clinic information',
          }
        : null;

      const branchHeroes = heroBranches.map((branch) => ({
        address: branch.address,
        appointmentLabel: isKm ? 'កក់ការណាត់ជួប' : 'Book Appointment',
        callLabel: isKm ? 'ទូរស័ព្ទមកយើង' : 'Call Us',
        imageAlt: branch.name,
        imagePresentation: branch.heroImagePresentation,
        imageUrl: getPublicMediaUrl(branch.heroImageKey) ?? getPublicMediaUrl(branch.branchImageKey) ?? '',
        locationLabel: isKm ? 'ទីតាំង' : 'Location',
        phones: [contact.primaryPhone, contact.secondaryPhone].filter((phone): phone is string => Boolean(phone)),
        qrImageUrl: '/assets/landing/qr-code.png',
        qrLabel: isKm ? 'ព័ត៌មានគ្លីនិក' : 'Clinic information',
      }));

      return {
        ...publicLandingChrome(language),
        branches: homepageBranches.map((branch) => ({
          hours: branch.openingHours ?? '',
          imageAlt: branch.name,
          imagePresentation: branch.branchImagePresentation,
          imageUrl: getPublicMediaUrl(branch.branchImageKey) ?? '',
          name: branch.name,
          phones: [branch.phone, branch.secondaryPhone].filter((phone): phone is string => Boolean(phone)),
        })),
        doctors: doctors.doctors.map(toLandingDoctor),
        footer: {
          ...publicLandingChrome(language).footer,
          branchLinks: publicBranches.map((branch) => ({ href: '/branches', label: branch.name })),
          description: isKm ? clinic.shortAboutKm ?? '' : clinic.shortAboutEn ?? '',
          tagline: localizedTagline ?? localizedName,
        },
        heroes: cmsHeroSlide ? [cmsHeroSlide, ...branchHeroes] : branchHeroes,
        promotions: promotions.items
          .map((promotion) => ({
            badge: promotion.badge ?? '',
            benefits: (promotion.benefits ?? '').split('\n').map((benefit) => benefit.trim()).filter(Boolean).slice(0, 3),
            description: promotion.body ?? '',
            imageAlt: promotion.title ?? (language === 'km' ? 'ព័ត៌មានពីគ្លីនិក' : 'Clinic promotion'),
            imageUrl: getPublicMediaUrl(promotion.imageKey) ?? '',
            imagePresentation: promotion.imagePresentation,
            discount: promotion.discount ?? '',
            title: promotion.title ?? '',
            validUntil: promotion.validUntil,
          }))
          .filter((promotion) => Boolean(promotion.imageUrl) && Boolean(promotion.title)),
        services: services.services.map(toLandingService),
        showcase: showcases.showcases.map((showcase) => ({
          imageAlt: showcase.title,
          imagePresentation: showcase.coverImagePresentation,
          imageUrl: getPublicMediaUrl(showcase.coverImageKey) ?? '',
          slug: showcase.slug,
          title: showcase.title,
        })),
      };
    },
    queryKey: [...queryKeys.public.landing(language), queryKeys.public.pageMedia('HOME_PROMOTIONS', language), queryKeys.public.pageMedia('HOME_HERO', language)],
  });
}
