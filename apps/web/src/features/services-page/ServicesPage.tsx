import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    <section className="bg-white pb-[70px] pt-[96px] text-center">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto inline-block">
          <h1 className="relative z-10 text-[38px] font-extrabold leading-[46px] text-[#3695b9] sm:text-[48px] sm:leading-[56px]">
            {hero.title}
          </h1>
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 h-[18px] w-[196px] -translate-x-1/2 rounded-full bg-[#d9edf4]"
          />
        </div>
        <p className="mx-auto mt-5 max-w-[640px] text-[18px] font-medium leading-8 text-[#6b7280]">{hero.description}</p>
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: LandingService }) {
  const id = serviceId(service.name);
  const slug = serviceSlug(service.name);

  return (
    <Card
      className="group flex h-full flex-col overflow-hidden rounded-lg border-[#edf2f7] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
      id={id}
    >
      <Link
        aria-label={`View ${service.name}`}
        className="flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
        to={`/services/${slug}`}
      >
        <img
          alt={service.imageAlt}
          className="h-[210px] w-full bg-[#eaf2f6] object-cover object-center"
          src={service.imageUrl}
        />
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <h2 className="text-[15px] font-semibold leading-5 text-[#005687] transition-colors group-hover:text-[#3695B9]">
              {service.name}
            </h2>
            <p className="mt-2 text-[13px] font-medium leading-[20px] text-[#6b7280]">
              {service.description}
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#3695B9] transition group-hover:text-[#005687]">
            Learn More
            <svg
              aria-hidden="true"
              className="size-3.5 transition duration-150 group-hover:translate-x-1"
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
    <section className="bg-white pb-[96px] pt-4">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesCta({ cta }: { cta: ServicesPageContent['cta'] }) {
  const navigate = useNavigate();

  return (
    <section className="bg-[#f7fafc] px-4 py-[88px] sm:px-6">
      <Card className="mx-auto max-w-[960px] rounded-[22px] border-[#edf2f7] bg-white px-6 py-[56px] text-center shadow-[0_2px_6px_rgba(15,23,42,0.04)] sm:px-12">
        <h2 className="text-[30px] font-extrabold leading-9 text-[#005687]">{cta.title}</h2>
        <p className="mx-auto mt-5 max-w-[680px] text-[18px] font-medium leading-8 text-[#6b7280]">{cta.description}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            className="min-h-[56px] w-full rounded-xl px-9 text-[15px] shadow-[0_10px_22px_rgba(54,149,185,0.22)] sm:w-auto"
            onClick={() => navigate('/book-appointment')}
            type="button"
          >
            {cta.consultationLabel}
          </Button>
          <Button
            className="min-h-[56px] w-full rounded-xl border border-[#d8e6ee] px-9 text-[15px] text-[#3695B9] shadow-none hover:border-[#3695B9] sm:w-auto"
            onClick={() => navigate('/contact')}
            type="button"
            variant="secondary"
          >
            {cta.contactLabel}
          </Button>
        </div>
      </Card>
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
        <section className="px-4 py-[72px] text-center">
          <div className="mx-auto h-12 w-72 animate-pulse rounded-full bg-[#d6ecf3]" />
          <div className="mx-auto mt-5 h-16 w-full animate-pulse rounded bg-[#edf5f8]" />
        </section>
        <section className="pb-[96px]">
          <div className="mx-auto grid max-w-[1280px] gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {Array.from({ length: 8 }, (_, index) => (
              <div className="h-[354px] animate-pulse rounded-lg bg-[#edf5f8]" key={index} />
            ))}
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

function ServicesPageEmpty() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>No content</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">Service information is unavailable</h1>
        <p className="mt-3 text-[#62798b]">Please check the content source and try again.</p>
      </Card>
    </main>
  );
}

function ServicesPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">We could not load the services page</h1>
        <p className="mt-3 text-[#62798b]">Try again to refresh the service list.</p>
        <Button className="mt-6" onClick={onRetry} type="button">
          Retry
        </Button>
      </Card>
    </main>
  );
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
