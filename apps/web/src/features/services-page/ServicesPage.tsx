import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageFrame, PageContainer, PageFeedback, SectionIntro } from '@/components/layout/public-ui';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import type { LandingService, ServicesPageContent } from '@/features/landing-page/types';
import { useServicesPageQuery } from './use-services-page';

const skeletonNavigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/branches', label: 'Branches' },
];

const serviceId = (name: string) =>
  `service-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '')}`;
const serviceSlug = (name: string) => name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '');

function ServicesHero({ hero }: { hero: ServicesPageContent['hero'] }) {
  return (
    <section className="border-b border-[#e7eff3] bg-[#f7fafc] py-5 sm:py-7">
      <PageContainer>
        <div className="rounded-2xl border border-[#d9e9ee] bg-[linear-gradient(120deg,#fafdfe_0%,#edf7fa_100%)] px-5 py-11 text-center shadow-[0_5px_20px_rgba(15,61,84,0.04)] sm:px-8 sm:py-14">
          <SectionIntro align="center" as="h1" description={hero.description} eyebrow="Our Treatments" title={hero.title} />
        </div>
      </PageContainer>
    </section>
  );
}

function ServiceCard({ service }: { service: LandingService }) {
  const id = serviceId(service.name);
  const slug = service.slug ?? serviceSlug(service.name);

  return (
    <Card
      className="group overflow-hidden rounded-xl border-[#e4edf2] bg-white shadow-[0_2px_10px_rgba(15,61,84,0.06)] transition duration-200 hover:border-[#b9dce8] hover:shadow-[0_7px_18px_rgba(15,61,84,0.09)] sm:h-[330px]"
      id={id}
    >
      <Link
        aria-label={`View ${service.name}`}
        className="flex min-h-[192px] h-full flex-row focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9] sm:flex-col"
        to={`/services/${slug}`}
      >
        <ImageFrame alt={service.imageAlt} className="h-[192px] w-[42%] shrink-0 rounded-none border-0 bg-[#eaf2f6] shadow-none sm:h-[190px] sm:w-full" fallbackSrc="/assets/landing/hero-clinic.png" src={service.imageUrl} />
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            <h2 className="text-[16px] font-bold leading-5 text-[#005687] transition-colors group-hover:text-[#3695B9]">
              {service.name}
            </h2>
            <p className="mt-2 line-clamp-3 text-[14px] font-medium leading-5 text-[#607486] sm:line-clamp-2">
              {service.description}
            </p>
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#3695B9] transition group-hover:text-[#005687]">
            Learn More
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
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
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

function ServicesPageSkeleton() {
  return (
    <SiteLayout actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }} navigation={skeletonNavigation}>
      <main aria-busy="true" aria-label="Loading services page" className="bg-white">
        <span className="sr-only">Loading treatments</span>

        <section aria-hidden="true" className="border-b border-[#e7eff3] bg-[#f7fafc] px-4 py-12 text-center sm:px-6 sm:py-14">
          <div className="mx-auto max-w-[620px]">
            <div className="mx-auto h-3 w-28 animate-pulse rounded-full bg-[#dcebf0]" />
            <div className="mx-auto mt-3 h-9 w-56 max-w-full animate-pulse rounded-lg bg-[#d1e6ee] sm:w-72" />
            <div className="mx-auto mt-4 h-4 w-[88%] animate-pulse rounded-full bg-[#e5f0f4] sm:w-[72%]" />
            <div className="mx-auto mt-2 h-4 w-[70%] animate-pulse rounded-full bg-[#e5f0f4] sm:w-[56%]" />
          </div>
        </section>

        <section aria-hidden="true" className="py-10 sm:py-14">
          <div className="mx-auto grid max-w-[1280px] gap-4 px-4 sm:grid-cols-2 sm:gap-5 sm:px-6 lg:grid-cols-4 lg:px-8">
            {Array.from({ length: 8 }, (_, index) => (
              <div className="flex min-h-[192px] overflow-hidden rounded-xl border border-[#e3edf1] bg-white sm:block sm:h-[330px]" key={index}>
                <div className="h-[192px] w-[42%] shrink-0 animate-pulse bg-[#e3eef2] sm:h-[190px] sm:w-full" />
                <div className="flex flex-1 flex-col justify-center space-y-3 p-4 sm:h-[140px] sm:justify-start sm:p-5">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#dcebf0]" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-[#edf4f6]" />
                  <div className="h-3 w-4/5 animate-pulse rounded-full bg-[#edf4f6]" />
                  <div className="h-3 w-20 animate-pulse rounded-full bg-[#dcebf0]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-hidden="true" className="border-t border-[#e7eff3] bg-[#f7fafc] px-4 py-10 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-[860px] rounded-xl border border-[#e1ebef] bg-white px-5 py-8 text-center sm:px-12 sm:py-10">
            <div className="mx-auto h-8 w-56 max-w-full animate-pulse rounded-lg bg-[#d1e6ee] sm:w-72" />
            <div className="mx-auto mt-4 h-4 w-[82%] animate-pulse rounded-full bg-[#edf4f6] sm:w-[64%]" />
            <div className="mx-auto mt-2 h-4 w-[68%] animate-pulse rounded-full bg-[#edf4f6] sm:w-[48%]" />
            <div className="mx-auto mt-6 h-11 w-48 animate-pulse rounded-full bg-[#dcebf0]" />
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

function ServicesPageEmpty() {
  return <PageFeedback body="Please check the content source and try again." title="Service information is unavailable" />;
}

function ServicesPageError({ onRetry }: { onRetry: () => void }) {
  return <PageFeedback action={<Button onClick={onRetry}>Retry</Button>} body="Try again to refresh the service list." title="We could not load the services page" />;
}

function hasServicesContent(content: ServicesPageContent | undefined): content is ServicesPageContent {
  return Boolean(content && content.navigation.length > 0 && content.hero.title && content.services.length > 0);
}

export function ServicesPage() {
  const { data, isError, isLoading, refetch } = useServicesPageQuery();

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
