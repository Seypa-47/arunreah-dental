import { useQuery } from '@tanstack/react-query';
import { publicLandingChrome } from '@/features/public-content/public-page-chrome';
import { getPublicBookableDoctors, getPublicBranches, getPublicClinic, getPublicPageMedia, getPublicServices, getPublicShowcases } from '@/services/public-content';
import { getPublicMediaUrl } from '@/services/media';
import { mapLandingBranchHero, toLandingDoctor, toLandingService } from '@/services/public-page-mappers';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';

export function resolveOptionalResult<T>(result: PromiseSettledResult<T>, fallback: T) {
  return result.status === 'fulfilled'
    ? { data: result.value, failed: false }
    : { data: fallback, failed: true };
}
import { queryKeys } from '@/lib/query-keys';
import { formatPublicBranchHours, formatPublicBranchSchedules } from '@/features/public-content/public-branch';

export function useLandingPageQuery() {
  const { language } = usePublicLanguage();
  return useQuery({
    queryFn: async () => {
      const clinic = await getPublicClinic(language);
      const [servicesResult, doctorsResult, branchesResult, showcasesResult, promotionsResult] = await Promise.allSettled([
        getPublicServices(language),
        getPublicBookableDoctors(language),
        getPublicBranches(language, 'landing'),
        getPublicShowcases(language, true),
        getPublicPageMedia('HOME_PROMOTIONS', language),
      ]);
      const servicesState = resolveOptionalResult(servicesResult, { services: [] });
      const doctorsState = resolveOptionalResult(doctorsResult, { doctors: [] });
      const branchesState = resolveOptionalResult(branchesResult, { branches: [] });
      const showcasesState = resolveOptionalResult(showcasesResult, { showcases: [] });
      const promotionsState = resolveOptionalResult(promotionsResult, { items: [] });
      const services = servicesState.data;
      const doctors = doctorsState.data;
      const branches = branchesState.data;
      const showcases = showcasesState.data;
      const promotions = promotionsState.data;
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
        sectionIssues: {
          branches: branchesState.failed,
          doctors: doctorsState.failed,
          promotions: promotionsState.failed,
          services: servicesState.failed,
          showcase: showcasesState.failed,
        },
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
