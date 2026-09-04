import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import type { BranchesPageContent } from '@/features/landing-page/types';
import { useBranchesPageQuery } from './use-branches-page';

const asset = (name: string) => `/assets/landing/${name}`;

const skeletonNavigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/branches', label: 'Branches' },
];

function AssetIcon({ className, name }: { className: string; name: string }) {
  return <img alt="" aria-hidden="true" className={className} src={asset(name)} />;
}

function ArrowIcon() {
  return (
    <span
      aria-hidden="true"
      className="size-[14px] bg-current [mask-image:url('/assets/landing/arrow-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
    />
  );
}

function DirectionIcon({ className = 'size-4' }: { className?: string }) {
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
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}

function MetricLocationIcon() {
  return (
    <svg aria-hidden="true" className="size-[22px]" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 21.2s7-5.95 7-11.75A6.86 6.86 0 0 0 12 2.5a6.86 6.86 0 0 0-7 6.95c0 5.8 7 11.75 7 11.75Z"
        fill="#3695B9"
      />
      <circle cx="12" cy="9.45" fill="white" r="2.25" />
    </svg>
  );
}

function HighlightLocationIcon() {
  return (
    <svg aria-hidden="true" className="size-[15px]" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 21.2s7-5.95 7-11.75A6.86 6.86 0 0 0 12 2.5a6.86 6.86 0 0 0-7 6.95c0 5.8 7 11.75 7 11.75Z"
        fill="#3695B9"
      />
      <circle cx="12" cy="9.45" fill="white" r="2.25" />
    </svg>
  );
}

function CalendarIcon({ className = 'size-[18px]' }: { className?: string }) {
  return <AssetIcon className={`${className} brightness-0 invert`} name="hero-calendar.svg" />;
}

function BranchesHero({ hero }: { hero: BranchesPageContent['hero'] }) {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#eef5f8] pb-0">
      <div className="relative min-h-[380px] overflow-hidden bg-white sm:min-h-[420px]">
        <img
          alt={hero.backgroundImageAlt}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-75"
          src={hero.backgroundImageUrl}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-white via-white/88 to-white/12" />
        <div className="relative mx-auto flex min-h-[380px] w-full max-w-[1280px] items-center px-4 sm:min-h-[420px] sm:px-6 lg:px-8">
          <div className="max-w-[520px] py-8">
            <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">
              {hero.eyebrow}
            </p>
            <h1 className="mt-4 text-[30px] font-extrabold leading-9 text-[#005687] sm:text-[34px] sm:leading-10">
              {hero.title}
            </h1>
            <p className="mt-3 max-w-[460px] text-[14px] font-normal leading-6 text-[#6b7280]">{hero.subtitle}</p>
            <div className="mt-5 flex flex-wrap gap-6">
              {hero.highlights.map((item) => (
                <div className="flex items-center gap-3" key={item.label}>
                  <span className="grid size-8 place-items-center rounded-full bg-[#eef8fb]">
                    {item.label === '2 Modern Clinics' ? (
                      <HighlightLocationIcon />
                    ) : (
                      <img alt="" aria-hidden="true" className="size-3.5" src={item.iconUrl} />
                    )}
                  </span>
                  <span className="text-[13px] font-bold leading-5 text-[#005687]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Card className="relative z-10 mx-auto -mt-10 grid w-[calc(100%-32px)] max-w-[1280px] gap-4 rounded-xl border-[#edf2f7] px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)] sm:px-8 lg:grid-cols-[1fr_1fr_1fr_220px] lg:items-center">
        {hero.metrics.map((metric) => (
          <div
            className="flex items-center gap-4 border-[#edf2f7] lg:border-r lg:last:border-r-0"
            key={metric.title}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#eef8fb]">
              {metric.title === 'Locations' ? (
                <MetricLocationIcon />
              ) : (
                <img alt="" aria-hidden="true" className="size-[18px]" src={metric.iconUrl} />
              )}
            </span>
            <div>
              <p className="text-[11px] font-medium leading-4 text-[#6b7280]">{metric.label}</p>
              <p className="text-[15px] font-extrabold leading-5 text-[#005687]">{metric.title}</p>
              <p className="text-[11px] font-medium leading-4 text-[#6b7280]">{metric.description}</p>
            </div>
          </div>
        ))}
        <Button
          className="min-h-[46px] rounded-full bg-[#3695B9] px-7 text-[14px] font-bold shadow-[0_8px_18px_rgba(54,149,185,0.20)] hover:bg-[#2c84a5]"
          icon={<CalendarIcon />}
          onClick={() => navigate('/book-appointment')}
        >
          {hero.appointmentLabel}
        </Button>
      </Card>
    </section>
  );
}

function SectionIntro({
  description,
  eyebrow,
  title,
}: {
  description?: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mx-auto max-w-[720px] px-4 text-center sm:px-6">
      <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">{eyebrow}</p>
      <h2 className="mt-3 text-[26px] font-extrabold leading-8 text-[#005687] sm:text-[30px] sm:leading-9">
        {title}
      </h2>
      {description ? <p className="mt-3 text-[14px] font-normal leading-6 text-[#6b7280]">{description}</p> : null}
    </div>
  );
}

function BranchCard({
  branch,
  flipped,
}: {
  branch: BranchesPageContent['branches'][number];
  flipped: boolean;
}) {
  const phoneHref = `tel:${branch.phones[0]?.replaceAll(' ', '') ?? ''}`;

  return (
    <Card className="group overflow-hidden rounded-2xl border-[#edf2f7] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition duration-300 hover:shadow-[0_12px_36px_rgba(15,23,42,0.10)] lg:grid lg:grid-cols-2">
      <div className={`${flipped ? 'lg:order-2' : ''} flex flex-col justify-between p-6 sm:p-8 lg:p-9`}>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf7fb] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#3695B9]">
            <AssetIcon className="size-3" name="branch-card-pin-alt.svg" />
            {branch.badge}
          </span>

          <h3 className="mt-3 text-[22px] font-extrabold leading-tight text-[#005687] sm:text-[24px]">
            {branch.name}
          </h3>

          <div className="mt-6 space-y-4 text-[14px]">
            {/* Address */}
            <div className="flex items-start gap-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#edf7fb] text-[#3695B9]">
                <AssetIcon className="size-4" name="branch-card-pin-alt.svg" />
              </span>
              <div className="pt-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">Address</p>
                <p className="mt-0.5 font-medium leading-5 text-[#4b5563]">{branch.address}</p>
              </div>
            </div>

            {/* Phone numbers */}
            <div className="flex items-start gap-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#edf7fb] text-[#3695B9]">
                <AssetIcon className="size-4" name="branch-card-phone.svg" />
              </span>
              <div className="pt-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">Phone Numbers</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-6 gap-y-1 font-bold text-[#005687]">
                  {branch.phones.map((phone) => (
                    <a
                      className="transition hover:text-[#3695B9]"
                      href={`tel:${phone.replaceAll(' ', '')}`}
                      key={phone}
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Opening hours */}
            <div className="flex items-start gap-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#edf7fb] text-[#3695B9]">
                <AssetIcon className="size-4" name="branch-card-clock.svg" />
              </span>
              <div className="pt-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">Working Hours</p>
                <p className="mt-0.5 text-[14px] text-[#4b5563]">
                  <span className="mr-3 font-medium">{branch.hoursDays}:</span>
                  <span className="font-bold text-[#005687]">{branch.hoursTime}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#f1f5f9] pt-6">
          <Link
            className="inline-flex h-[44px] min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#3695B9] px-6 text-[13px] font-bold text-white shadow-[0_6px_16px_rgba(54,149,185,0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#2c84a5] hover:shadow-[0_8px_20px_rgba(54,149,185,0.28)]"
            to="/book-appointment"
          >
            <CalendarIcon className="size-4" />
            {branch.bookingLabel}
          </Link>
          <a
            className="inline-flex h-[44px] min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#3695B9] bg-white px-5 text-[13px] font-bold text-[#3695B9] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f0f9fa]"
            href={phoneHref}
          >
            <AssetIcon className="size-4" name="branch-card-phone.svg" />
            {branch.phoneLabel}
          </a>
          <a
            className="inline-flex h-[44px] min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#edf7fb] px-5 text-[13px] font-bold text-[#005687] transition duration-200 hover:-translate-y-0.5 hover:bg-[#dfeef5]"
            href={branch.directionsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <DirectionIcon className="size-3.5 text-[#3695B9]" />
            {branch.directionsLabel}
          </a>
        </div>
      </div>

      {/* Right Column: Photo with Sleek Map Badge */}
      <div className={`relative min-h-[300px] overflow-hidden lg:min-h-full ${flipped ? 'lg:order-1' : ''}`}>
        <img
          alt={branch.imageAlt}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={branch.imageUrl}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
        <a
          className="group/map absolute bottom-5 left-5 inline-flex items-center gap-2.5 rounded-full bg-white/95 px-4 py-2.5 text-[12px] font-bold text-[#005687] shadow-[0_8px_20px_rgba(15,23,42,0.14)] backdrop-blur-md transition duration-200 hover:bg-[#3695B9] hover:text-white"
          href={branch.mapUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="grid size-6 place-items-center rounded-full bg-[#edf7fb] text-[#3695B9] transition group-hover/map:bg-white/20 group-hover/map:text-white">
            <AssetIcon className="size-3" name="branch-card-pin-alt.svg" />
          </span>
          <span>{branch.mapLabel}</span>
          <svg
            aria-hidden="true"
            className="size-3.5 opacity-60 transition group-hover/map:translate-x-0.5 group-hover/map:opacity-100"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </a>
      </div>
    </Card>
  );
}

function BranchesList({ content }: { content: BranchesPageContent }) {
  return (
    <section className="bg-[#eef5f8] pb-14 pt-12 sm:pb-16 sm:pt-14">
      <SectionIntro
        description={content.sections.branchesDescription}
        eyebrow={content.sections.branchesEyebrow}
        title={content.sections.branchesTitle}
      />
      <div className="mx-auto mt-10 grid w-full max-w-[1280px] gap-8 px-4 sm:px-6 lg:px-8">
        {content.branches.map((branch, index) => (
          <BranchCard branch={branch} flipped={index % 2 === 1} key={branch.name} />
        ))}
      </div>
    </section>
  );
}

function BenefitsSection({ content }: { content: BranchesPageContent }) {
  return (
    <section className="bg-white py-12 sm:py-14">
      <SectionIntro eyebrow={content.sections.benefitsEyebrow} title={content.sections.benefitsTitle} />
      <div className="mx-auto mt-10 grid w-full max-w-[1280px] gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {content.benefits.map((item) => (
          <Card
            className="min-h-[180px] rounded-xl !border-transparent !bg-[#f7fafc] px-6 py-6 text-center shadow-none transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
            key={item.title}
          >
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-white shadow-[0_6px_14px_rgba(15,23,42,0.08)] ring-1 ring-[#e6eef3]">
              <img alt="" aria-hidden="true" className="max-h-5 max-w-5" src={item.iconUrl} />
            </span>
            <h3 className="mt-4 text-[15px] font-bold leading-5 text-[#005687]">{item.title}</h3>
            <p className="mx-auto mt-2 max-w-[220px] text-[13px] font-normal leading-5 text-[#6b7280]">
              {item.description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function AppointmentCta({ cta }: { cta: BranchesPageContent['cta'] }) {
  const navigate = useNavigate();

  return (
    <section className="bg-white pb-14 pt-4 sm:pb-16">
      <div className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl bg-gradient-to-r from-[#3695B9] to-[#005687] px-6 py-9 text-white sm:px-12">
        <img
          alt={cta.backgroundImageAlt}
          className="absolute inset-y-0 right-0 hidden h-full w-[48%] object-cover opacity-25 md:block"
          src={cta.backgroundImageUrl}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#3695B9]/95 to-[#005687]/95" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white/16">
              <AssetIcon className="size-6 brightness-0 invert" name="hero-calendar.svg" />
            </span>
            <div>
              <p className="text-[12px] font-bold uppercase leading-4 tracking-wider text-white/75">{cta.eyebrow}</p>
              <h2 className="mt-1 text-[24px] font-extrabold leading-8 sm:text-[26px]">{cta.title}</h2>
              <p className="mt-1 text-[13px] font-normal leading-5 text-white/80">{cta.subtitle}</p>
            </div>
          </div>
          <Button
            className="min-h-[46px] rounded-full bg-white px-8 text-[14px] font-bold text-[#3695B9] shadow-none hover:bg-[#eef8fb] hover:text-[#005687] focus-visible:outline-white"
            onClick={() => navigate('/book-appointment')}
            variant="secondary"
          >
            {cta.buttonLabel}
            <ArrowIcon />
          </Button>
        </div>
      </div>
    </section>
  );
}

function BranchesPageView({ content }: { content: BranchesPageContent }) {
  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main>
        <BranchesHero hero={content.hero} />
        <BranchesList content={content} />
        <BenefitsSection content={content} />
        <AppointmentCta cta={content.cta} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function BranchesPageSkeleton() {
  return (
    <SiteLayout actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }} navigation={skeletonNavigation}>
      <main aria-busy="true" aria-label="Loading branches page" className="bg-[#eef5f8]">
        <section className="h-[600px] animate-pulse bg-[#d6ecf3]" />
        <section className="mx-auto max-w-[1440px] space-y-12 py-[96px]">
          {Array.from({ length: 2 }, (_, index) => (
            <div className="h-[420px] animate-pulse rounded-xl bg-[#e8f3f7]" key={index} />
          ))}
        </section>
      </main>
    </SiteLayout>
  );
}

function BranchesPageEmpty() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>No content</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">Branch information is unavailable</h1>
        <p className="mt-3 text-[#6b7280]">Please check the content source and try again.</p>
      </Card>
    </main>
  );
}

function BranchesPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">We could not load the branches page</h1>
        <p className="mt-3 text-[#6b7280]">Try again to refresh the clinic locations.</p>
        <Button className="mt-6" onClick={onRetry} type="button">
          Retry
        </Button>
      </Card>
    </main>
  );
}

function hasBranchesContent(content: BranchesPageContent | undefined): content is BranchesPageContent {
  return Boolean(
    content &&
      content.navigation.length > 0 &&
      content.hero.title &&
      content.hero.metrics.length > 0 &&
      content.branches.length > 0 &&
      content.benefits.length > 0,
  );
}

export function BranchesPage() {
  const { data, isError, isLoading, refetch } = useBranchesPageQuery();

  if (isLoading) {
    return <BranchesPageSkeleton />;
  }

  if (isError) {
    return <BranchesPageError onRetry={() => void refetch()} />;
  }

  if (!hasBranchesContent(data)) {
    return <BranchesPageEmpty />;
  }

  return <BranchesPageView content={data} />;
}
