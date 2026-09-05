import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import type { LandingService, ServiceDetailContent } from '@/features/landing-page/types';
import { useServiceDetailPageQuery } from './use-service-detail-page';

const skeletonNavigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/branches', label: 'Branches' },
];

const serviceSlug = (name: string) => name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '');

type ServiceDetail = NonNullable<ServiceDetailContent['service']>;

function ArrowIcon() {
  return (
    <span
      aria-hidden="true"
      className="size-[13px] bg-current [mask-image:url('/assets/landing/arrow-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
    />
  );
}

function CalendarIcon({ className = 'size-[14px]' }: { className?: string }) {
  return <img alt="" aria-hidden="true" className={className} src="/assets/landing/hero-calendar.svg" />;
}

function DetailIcon({
  className = 'size-[18px]',
  name,
}: {
  className?: string;
  name: ServiceDetail['benefits'][number]['icon'] | ServiceDetail['glance']['items'][number]['icon'];
}) {
  const paths = {
    calendar: (
      <>
        <rect height="14" rx="2" width="14" x="5" y="6" />
        <path d="M8 4v4M16 4v4M5 10h14" />
      </>
    ),
    check: <path d="m5 12 4 4 10-10" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4.4l3 1.6" />
      </>
    ),
    consultation: (
      <>
        <circle cx="12" cy="7" r="3" />
        <path d="M6.5 20c.45-4 2.55-6 5.5-6s5.05 2 5.5 6" />
      </>
    ),
    heart: <path d="M4 12h3.5l2-4.2 3.1 8.4 2-4.2H20" />,
    recovery: (
      <>
        <path d="M5 9h14v8H5z" />
        <path d="M8 9V7h8v2M9 13h6" />
      </>
    ),
    shield: <path d="M12 21s7-3.5 7-10V5l-7-3-7 3v6c0 6.5 7 10 7 10Z" />,
    smile: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M8.8 10h.01M15.2 10h.01M8.8 14.2c1.7 1.7 4.7 1.7 6.4 0" />
      </>
    ),
    star: <path d="m12 3 2.6 5.3 5.8.85-4.2 4.1 1 5.75-5.2-2.72L6.8 19l1-5.75-4.2-4.1 5.8-.85L12 3Z" />,
    utensils: (
      <>
        <path d="M7 3v8M4.5 3v8M9.5 3v8M4.5 11h5L8.7 21H5.3L4.5 11Z" />
        <path d="M16 3c2.2 1.8 3.3 4 3.3 6.7 0 1.9-.72 3.2-2.3 3.8V21h-3V3h2Z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function ServiceHero({ service }: { service: ServiceDetail }) {
  const navigate = useNavigate();

  return (
    <section className="bg-white pb-10 pt-12">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_480px] lg:items-center lg:px-8">
        <div>
          <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">{service.hero.eyebrow}</p>
          <h1 className="mt-4 max-w-[620px] text-[30px] font-extrabold leading-9 text-[#005687] sm:text-[34px] sm:leading-10">
            {service.hero.title}
          </h1>
          <p className="mt-3 max-w-[540px] text-[14px] font-normal leading-6 text-[#6b7280]">{service.hero.subtitle}</p>
          <div className="mt-7 flex flex-col gap-4 sm:flex-row">
            <Button className="min-h-[44px] rounded-full px-7 text-[14px] font-bold shadow-[0_8px_18px_rgba(54,149,185,0.22)]" onClick={() => navigate('/book-appointment')}>
              {service.hero.appointmentLabel}
            </Button>
            <Button
              className="min-h-[44px] rounded-full border border-[#d8e6ee] px-7 text-[14px] font-bold text-[#005687] shadow-none hover:border-[#3695B9]"
              onClick={() => navigate('/contact')}
              variant="secondary"
            >
              {service.hero.consultationLabel}
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border-[6px] border-[#d9edf4] bg-[#edf5f8] shadow-[0_12px_28px_rgba(15,23,42,0.12)]">
          {service.hero.imageUrl ? <img alt={service.hero.imageAlt} className="h-[340px] w-full object-cover" src={service.hero.imageUrl} /> : <div aria-hidden="true" className="h-[340px] w-full" />}
        </div>
      </div>
    </section>
  );
}

function GlanceCard({ glance }: { glance: ServiceDetail['glance'] }) {
  const navigate = useNavigate();

  return (
    <Card className="rounded-xl border-[#edf2f7] bg-white p-6 shadow-none">
      <h2 className="flex items-center gap-3 text-[18px] font-extrabold leading-6 text-[#005687]">
        <CalendarIcon className="size-4" />
        {glance.title}
      </h2>
      <div className="mt-5 space-y-4">
        {glance.items.map((item) => (
          <div className="flex items-start gap-3.5" key={item.label}>
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#eef8fb] text-[#3695B9]">
              <DetailIcon className="size-3.5" name={item.icon} />
            </span>
            <div>
              <p className="text-[13px] font-bold leading-5 text-[#005687]">{item.label}</p>
              <p className="text-[12px] font-normal leading-4 text-[#6b7280]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      <Button className="mt-6 min-h-[44px] w-full rounded-full text-[14px] font-bold shadow-[0_8px_18px_rgba(54,149,185,0.22)]" onClick={() => navigate('/book-appointment')}>
        {glance.actionLabel}
      </Button>
    </Card>
  );
}

function AboutService({ service }: { service: ServiceDetail }) {
  return (
    <section className="bg-[#f7fafc] py-12 sm:py-14">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <article>
          <h2 className="text-[26px] font-extrabold leading-8 text-[#005687] sm:text-[28px]">{service.about.title}</h2>
          <div className="mt-5 space-y-4 text-[14px] font-normal leading-6 text-[#6b7280]">
            {service.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {service.about.imageUrl ? <img alt={service.about.imageAlt} className="mt-8 h-[280px] w-full rounded-xl object-cover" src={service.about.imageUrl} /> : null}
        </article>
        <aside>
          <GlanceCard glance={service.glance} />
        </aside>
      </div>
    </section>
  );
}

function BenefitsSection({ benefits, title }: Pick<ServiceDetail, 'benefits'> & { title: string }) {
  return (
    <section className="bg-white py-12 text-center sm:py-14">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <h2 className="text-[26px] font-extrabold leading-8 text-[#005687] sm:text-[28px]">Benefits of {title}</h2>
        <p className="mx-auto mt-2 max-w-[580px] text-[13px] font-normal leading-5 text-[#6b7280]">
          Discover why this treatment is trusted for improving oral health, comfort, and confidence.
        </p>
        <div className="mt-8 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card className="min-h-[160px] rounded-xl border-[#edf2f7] bg-white p-6 shadow-none" key={benefit.title}>
              <span className="grid size-10 place-items-center rounded-lg bg-[#eef8fb] text-[#3695B9]">
                <DetailIcon className="size-4" name={benefit.icon} />
              </span>
              <h3 className="mt-4 text-[15px] font-bold leading-5 text-[#005687]">{benefit.title}</h3>
              <p className="mt-2 text-[13px] font-normal leading-5 text-[#6b7280]">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function OtherServiceCard({ service }: { service: LandingService }) {
  return (
    <Card className="flex h-[354px] flex-col overflow-hidden rounded-lg border-[#edf2f7] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
      {service.imageUrl ? <img alt={service.imageAlt} className="h-[210px] w-full bg-[#eaf2f6] object-cover" src={service.imageUrl} /> : <div aria-hidden="true" className="h-[210px] w-full bg-[#eaf2f6]" />}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="text-[14px] font-semibold leading-5 text-[#005687]">{service.name}</h3>
          <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-[18px] text-[#6b7280]">{service.description}</p>
        </div>
        <Link
          className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#3695B9] hover:text-[#005687] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
          to={`/services/${serviceSlug(service.name)}`}
        >
          View Service
          <ArrowIcon />
        </Link>
      </div>
    </Card>
  );
}

function OtherServices({ services }: { services: LandingService[] }) {
  return (
    <section className="bg-[#f7fafc] py-12 sm:py-14">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[26px] font-extrabold leading-8 text-[#005687] sm:text-[28px]">Explore Other Services</h2>
            <p className="mt-1 text-[13px] font-normal leading-5 text-[#6b7280]">Complementary treatments to enhance your oral health.</p>
          </div>
          <Link className="hidden text-[13px] font-bold text-[#3695B9] hover:text-[#005687] sm:inline-flex" to="/services">
            All Services
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 3).map((service) => (
            <OtherServiceCard key={service.name} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCta({ cta }: { cta: ServiceDetail['cta'] }) {
  const navigate = useNavigate();

  return (
    <section className="bg-white px-4 py-[92px] sm:px-6">
      <div className="mx-auto max-w-[860px] rounded-[32px] bg-[#3695b9] px-6 py-[58px] text-center text-white sm:px-12">
        <h2 className="text-[30px] font-extrabold leading-9">{cta.title}</h2>
        <p className="mx-auto mt-6 max-w-[580px] text-[15px] font-medium leading-7 text-white/80">{cta.description}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            className="min-h-[52px] w-full rounded-lg bg-white px-8 text-[13px] text-[#3695b9] shadow-none hover:bg-[#eef8fb] sm:w-auto"
            onClick={() => navigate('/book-appointment')}
            variant="secondary"
          >
            {cta.appointmentLabel}
          </Button>
          <Button
            className="min-h-[52px] w-full rounded-lg border border-white bg-transparent px-8 text-[13px] text-white shadow-none hover:bg-white/10 sm:w-auto"
            onClick={() => navigate('/contact')}
            variant="ghost"
          >
            {cta.contactLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}

function ServiceDetailView({ content }: { content: ServiceDetailContent & { service: ServiceDetail } }) {
  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main>
        <ServiceHero service={content.service} />
        <AboutService service={content.service} />
        <BenefitsSection benefits={content.service.benefits} title={content.service.name} />
        <OtherServices services={content.otherServices} />
        <ServiceCta cta={content.service.cta} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function ServiceDetailSkeleton() {
  return (
    <SiteLayout actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }} navigation={skeletonNavigation}>
      <main aria-busy="true" aria-label="Loading service detail page">
        <section className="bg-white py-[64px]">
          <div className="mx-auto grid max-w-[1280px] gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="py-12">
              <div className="h-5 w-40 animate-pulse rounded bg-[#d6ecf3]" />
              <div className="mt-8 h-32 w-full max-w-[560px] animate-pulse rounded bg-[#d6ecf3]" />
              <div className="mt-6 h-20 w-full max-w-[520px] animate-pulse rounded bg-[#edf5f8]" />
            </div>
            <div className="h-[420px] animate-pulse rounded-[32px] bg-[#d6ecf3]" />
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

function ServiceDetailEmpty() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>No content</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">Service detail is unavailable</h1>
        <p className="mt-3 text-[#6b7280]">Please return to the services page and choose another treatment.</p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3695B9] px-5 text-sm font-extrabold text-white hover:bg-[#2c84a5]"
          to="/services"
        >
          Back to Services
        </Link>
      </Card>
    </main>
  );
}

function ServiceDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">We could not load this service</h1>
        <p className="mt-3 text-[#6b7280]">Try again to refresh the treatment information.</p>
        <Button className="mt-6" onClick={onRetry} type="button">
          Retry
        </Button>
      </Card>
    </main>
  );
}

export function ServiceDetailPage() {
  const { serviceSlug: serviceSlugParam } = useParams();
  const { data, isError, isLoading, refetch } = useServiceDetailPageQuery(serviceSlugParam);

  if (isLoading) {
    return <ServiceDetailSkeleton />;
  }

  if (isError) {
    return <ServiceDetailError onRetry={() => void refetch()} />;
  }

  if (!data?.service) {
    return <ServiceDetailEmpty />;
  }

  return <ServiceDetailView content={{ ...data, service: data.service }} />;
}
