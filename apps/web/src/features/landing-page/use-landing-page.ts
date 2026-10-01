import { useQuery } from '@tanstack/react-query';
import { publicLandingChrome } from '@/features/public-content/public-page-chrome';
import { getPublicBranches, getPublicClinic, getPublicDoctors, getPublicPageMedia, getPublicServices, getPublicShowcases } from '@/services/public-content';
import { getPublicMediaUrl } from '@/services/media';
import { mapLandingBranchHero, toLandingDoctor, toLandingService } from '@/services/public-page-mappers';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { queryKeys } from '@/lib/query-keys';
import { formatPublicBranchHours, formatPublicBranchSchedules } from '@/features/public-content/public-branch';

export function useLandingPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const [clinic, services, doctors, branches, showcases, promotions] = await Promise.all([
        getPublicClinic(),
        getPublicServices(language),
        getPublicDoctors(language),
        getPublicBranches(language, 'landing'),
        getPublicShowcases(language, true),
        getPublicPageMedia('HOME_PROMOTIONS', language).catch(() => ({ items: [] })),
      ]);
      const localizedName = language === 'km' ? clinic.clinicNameKm : clinic.clinicNameEn;
      const localizedTagline = language === 'km' ? clinic.taglineKm : clinic.taglineEn;
      const publicBranches = branches.branches;
      const homepageBranches = publicBranches.filter((branch) => branch.showOnHomepage);
      const heroBranches = publicBranches.filter((branch) => branch.includeInHomepageHero);
      const isKm = language === 'km';
      const branchHeroes = heroBranches.map((branch) => mapLandingBranchHero(branch, language));

      return {
        ...publicLandingChrome(language),
        branches: homepageBranches.map((branch) => {
          const hours = formatPublicBranchHours(branch);
          const hoursSchedules = formatPublicBranchSchedules(branch);
          return {
            hoursDays: hours.days,
            hoursTime: hours.time,
            hoursSchedules,
            imageAlt: branch.name,
            imagePresentation: branch.branchImagePresentation,
            imageUrl: getPublicMediaUrl(branch.branchImageKey) ?? '',
            name: branch.name,
            phones: [branch.phone, branch.secondaryPhone].filter((phone): phone is string => Boolean(phone)),
          };
        }),
        doctors: doctors.doctors.map((doctor) => toLandingDoctor(doctor, language)),
        footer: {
          ...publicLandingChrome(language).footer,
          branchLinks: publicBranches.map((branch) => ({ href: '/branches', label: branch.name })),
          description: isKm
            ? (clinic.footerDescriptionKm || clinic.shortAboutKm?.split(/\n\s*\n/)[0] || '')
            : (clinic.footerDescriptionEn || clinic.shortAboutEn?.split(/\n\s*\n/)[0] || ''),
          tagline: localizedTagline ?? localizedName,
        },
        heroes: branchHeroes,
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
    queryKey: [
      ...queryKeys.public.landing(language),
      queryKeys.public.pageMedia('HOME_PROMOTIONS', language),
    ],
  });
}
