import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageFrame, PageContainer, PageFeedback, ResilientImage, SectionIntro } from '@/components/layout/public-ui';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import type { LandingService, ServicesPageContent } from '@/features/landing-page/types';
import { publicShell } from '@/features/public-content/public-page-chrome';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { publicUiCopy } from '@/features/public-content/public-ui-copy';
import { useServicesPageQuery } from './use-services-page';
import { usePublicDocumentTitle } from '@/features/public-content/public-document-title';
import {
  PublicListingHeroSkeleton,
  publicListingGridClass,
  publicListingHeroContentClass,
  publicListingHeroMediaClass,
  publicListingHeroSectionClass,
} from '@/components/layout/public-listing-skeleton';
import { SkeletonBlock, SkeletonCard, SkeletonImage, SkeletonSection, SkeletonText } from '@/components/ui/skeleton';

const serviceId = (name: string) =>
  `service-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '')}`;
const serviceSlug = (name: string) => name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '');

function ServicesHero({ hero }: { hero: ServicesPageContent['hero'] }) {
  const servicesCopy = publicUiCopy(usePublicLanguage().language).services;
  const eyebrow = hero.eyebrow || servicesCopy.heroEyebrow;
  return (
    <section className={publicListingHeroSectionClass}>
      <PageContainer>
        {hero.imageUrl ? (
          <div className={publicListingHeroMediaClass}>
            <ResilientImage alt={hero.title} className="absolute inset-0 h-full w-full object-cover object-center" presentation={hero.imagePresentation} src={hero.imageUrl} />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#021827]/90 via-[#021827]/40 to-transparent sm:bg-[linear-gradient(100deg,rgba(2,24,39,0.88)_0%,rgba(2,24,39,0.5)_42%,rgba(2,24,39,0.1)_70%,transparent_100%)]"
            />
            <div className={publicListingHeroContentClass}>
              <div>
                {eyebrow ? (
                  <p className="ui-eyebrow inline-flex w-fit items-center rounded-full bg-[#005687] px-3 py-1 text-[11px] font-extrabold uppercase leading-4 tracking-[0.06em] text-white shadow-sm sm:text-[12px]">
                    {eyebrow}
                  </p>
                ) : null}
                <h1 className={`${eyebrow ? 'mt-3' : ''} text-[28px] font-extrabold leading-[1.18] tracking-[-0.03em] text-white sm:text-[38px] lg:text-[44px]`}>{hero.title}</h1>
                {hero.description ? <p className="mt-3.5 max-w-[600px] text-[15px] font-normal leading-relaxed text-[#e1f0f5] sm:text-[16px] sm:leading-7">{hero.description}</p> : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#d9e9ee] bg-[linear-gradient(120deg,#fafdfe_0%,#edf7fa_100%)] px-5 py-11 text-center shadow-[0_5px_20px_rgba(15,61,84,0.04)] sm:px-8 sm:py-14">
            <div className="mx-auto max-w-[680px] text-center">
              {eyebrow ? (
                <p className="ui-eyebrow inline-flex w-fit items-center rounded-full bg-[#005687] px-3 py-1 text-[11px] font-extrabold uppercase leading-4 tracking-[0.06em] text-white shadow-sm sm:text-[12px]">
                  {eyebrow}
                </p>
              ) : null}
              <h1 className="ui-copy-safe mt-2.5 text-[26px] font-extrabold leading-[1.18] tracking-[-0.03em] text-[#005687] sm:mt-3 sm:text-[34px] sm:tracking-[-0.035em]">{hero.title}</h1>
              {hero.description ? <p className="ui-prose mt-3 text-[#607486]">{hero.description}</p> : null}
            </div>
          </div>
        )}
      </PageContainer>
    </section>
  );
}

function ServiceCard({ service }: { service: LandingService }) {
  const servicesCopy = publicUiCopy(usePublicLanguage().language).services;
  const id = serviceId(service.name);
  const slug = service.slug ?? serviceSlug(service.name);

  return (
    <Card
      className="group overflow-hidden rounded-xl border-[#e4edf2] bg-white shadow-[0_2px_10px_rgba(15,61,84,0.06)] transition duration-200 hover:border-[#b9dce8] hover:shadow-[0_7px_18px_rgba(15,61,84,0.09)]"
      id={id}
    >
      <Link
        aria-label={`${servicesCopy.learnMore}: ${service.name}`}
        className="flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
        to={`/services/${slug}`}
      >
        <ImageFrame alt={service.imageAlt || service.name} className="h-[190px] w-full shrink-0 rounded-none border-0 bg-[#eaf2f6] shadow-none" presentation={service.imagePresentation} src={service.imageUrl} />
        <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
          <div>
            <h2 className="text-[16px] font-bold leading-5 text-[#005687] transition-colors group-hover:text-[#3695B9]">
              {service.name}
            </h2>
            <p className="mt-2 line-clamp-3 text-[14px] font-medium leading-5 text-[#607486] sm:line-clamp-2">
              {service.description}
            </p>
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#3695B9] transition group-hover:text-[#005687]">
            {servicesCopy.learnMore}
            <svg
              aria-hidden="true"
              className="size-3 transition duration-150 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    </Card>
  );
}

function ServicesGrid({ services }: { services: LandingService[] }) {
  return (
    <section className="bg-white py-10 sm:py-14">
      <PageContainer>
        <div className={publicListingGridClass}>
          {services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

function ServicesCta({ cta }: { cta: ServicesPageContent['cta'] }) {
  const navigate = useNavigate();

  return (
    <section className="bg-[#f7fafc] py-12 sm:py-14">
      <PageContainer>
      <Card className="mx-auto max-w-[860px] rounded-xl border-[#dcebf1] bg-white px-5 py-8 text-center shadow-[0_2px_10px_rgba(15,61,84,0.05)] sm:px-12 sm:py-10">
        <SectionIntro align="center" description={cta.description} title={cta.title} />
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            className="min-h-[46px] w-full rounded-full px-8 text-[14px] font-bold shadow-[0_4px_12px_rgba(54,149,185,0.18)] sm:w-auto"
            onClick={() => navigate('/book-appointment')}
            type="button"
          >
            {cta.consultationLabel}
          </Button>
          <Button
            className="min-h-[46px] w-full rounded-full border border-[#d8e6ee] px-8 text-[14px] font-bold text-[#3695B9] shadow-none hover:border-[#3695B9] sm:w-auto"
            onClick={() => navigate('/contact')}
            type="button"
            variant="secondary"
          >
            {cta.contactLabel}
          </Button>
        </div>
      </Card>
      </PageContainer>
    </section>
  );
}

function ServicesPageView({ content }: { content: ServicesPageContent }) {
  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main>
        <ServicesHero hero={content.hero} />
        <ServicesGrid services={content.services} />
        <ServicesCta cta={content.cta} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

export function ServicesPageSkeleton() {
  const { language } = usePublicLanguage();
  const shell = publicShell(language);
  const copy = publicUiCopy(language).services;
  return (
    <SiteLayout actions={shell.actions} navigation={shell.navigation}>
      <main aria-busy="true" className="bg-white">
        <span className="sr-only">{copy.loadingLabel}</span>

        <PublicListingHeroSkeleton />

        <SkeletonSection className="bg-white py-10 sm:py-14" data-skeleton-section="services">
          <PageContainer>
            <div className={publicListingGridClass}>
              {Array.from({ length: 3 }, (_, index) => (
                <SkeletonCard className="min-h-[330px] overflow-hidden rounded-xl" data-skeleton-card="service" key={index}>
                  <SkeletonImage className="h-[190px] w-full rounded-none" />
                  <div className="flex min-h-[140px] flex-col justify-between p-5">
                    <div>
                      <SkeletonBlock className="h-4 w-3/4 rounded-full" />
                      <SkeletonText className="mt-3" lines={2} widths={['100%', '80%']} />
                    </div>
                    <SkeletonBlock className="mt-3 h-3 w-20 rounded-full" />
                  </div>
                </SkeletonCard>
              ))}
            </div>
          </PageContainer>
        </SkeletonSection>

        <SkeletonSection className="bg-[#f7fafc] py-12 sm:py-14" data-skeleton-section="cta">
          <PageContainer>
            <SkeletonCard className="mx-auto max-w-[860px] rounded-xl px-5 py-8 text-center sm:px-12 sm:py-10">
              <SkeletonBlock className="mx-auto h-8 w-56 max-w-full rounded-lg sm:w-72" />
              <SkeletonText className="mx-auto mt-4 max-w-[620px]" lineClassName="mx-auto h-4" lines={2} widths={['82%', '64%']} />
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <SkeletonBlock className="h-[46px] w-full rounded-full sm:w-48" />
                <SkeletonBlock className="h-[46px] w-full rounded-full sm:w-40" />
              </div>
            </SkeletonCard>
          </PageContainer>
        </SkeletonSection>
      </main>
    </SiteLayout>
  );
}

function ServicesPageEmpty() {
  const copy = publicUiCopy(usePublicLanguage().language).services;
  return <PageFeedback body={copy.unavailableBody} title={copy.unavailableTitle} />;
}

function ServicesPageError({ onRetry }: { onRetry: () => void }) {
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language);
  return <PageFeedback action={<Button onClick={onRetry}>{copy.common.retry}</Button>} body={copy.services.errorBody} title={copy.services.errorTitle} />;
}

function hasServicesContent(content: ServicesPageContent | undefined): content is ServicesPageContent {
  return Boolean(content && content.navigation.length > 0 && content.hero.title && content.services.length > 0);
}

export function ServicesPage() {
  const { data, isError, isLoading, refetch } = useServicesPageQuery();
  const { language } = usePublicLanguage();
  usePublicDocumentTitle(
    data?.hero.title ?? (language === 'km' ? 'សេវាកម្មធ្មេញ' : 'Dental Services'),
    data?.hero.description,
    { imageUrl: data?.hero.imageUrl },
  );

  if (isLoading) {
    return <ServicesPageSkeleton />;
  }

  if (isError) {
    return <ServicesPageError onRetry={() => void refetch()} />;
  }

  if (!hasServicesContent(data)) {
    return <ServicesPageEmpty />;
  }

  return <ServicesPageView content={data} />;
}
