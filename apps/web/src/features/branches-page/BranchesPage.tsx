import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { MobileHeroMedia, ResilientImage } from '@/components/layout/public-ui';
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
  const imageUrl = hero.backgroundImageUrl || '/assets/landing/figma-branches/image2_183_4173.png';

  return (
    <section className="relative bg-[#f7fafc] pb-0 pt-5 sm:pt-7">
      <div className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl border border-[#d9e9ee] bg-white sm:min-h-[340px]">
        <MobileHeroMedia alt={hero.backgroundImageAlt} fallbackSrc="/assets/landing/figma-branches/image2_183_4173.png" src={hero.backgroundImageUrl} />
        <ResilientImage
          alt={hero.backgroundImageAlt}
          className="absolute inset-y-0 right-0 hidden h-full w-[60%] object-cover object-center sm:block"
          fallbackSrc="/assets/landing/figma-branches/image2_183_4173.png"
          src={imageUrl}
        />
        <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[43%] bg-white sm:block" />
        <div aria-hidden="true" className="absolute inset-y-0 left-[39%] hidden w-[23%] bg-[linear-gradient(90deg,#fff_0%,rgba(255,255,255,0.82)_52%,rgba(255,255,255,0)_100%)] sm:block" />
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[61%] bg-[linear-gradient(90deg,rgba(5,84,111,0.05),rgba(5,84,111,0.2))] sm:block" />
        <div className="relative mx-auto flex w-full max-w-[1280px] items-center px-4 sm:min-h-[340px] sm:px-6 lg:px-8">
          <div className="max-w-[560px] py-7">
            <p className="text-[11px] font-extrabold uppercase leading-4 tracking-[3px] text-[#3695B9] sm:text-[12px] sm:tracking-[3.6px]">
              {hero.eyebrow}
            </p>
            <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687] sm:mt-3 sm:text-[38px]">
              {hero.title}
            </h1>
            <p className="mt-3 max-w-[500px] text-[16px] font-normal leading-7 text-[#64748b]">{hero.subtitle}</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
              {hero.highlights.map((item) => (
                <div className="flex items-center gap-3" key={item.label}>
                  <span className="grid size-8 place-items-center rounded-full bg-[#eef8fb]">
                    {item.label === '2 Modern Clinics' ? (
                      <HighlightLocationIcon />
                    ) : (
                      <img alt="" aria-hidden="true" className="size-3.5" src={item.iconUrl} />
                    )}
                  </span>
                  <span className="text-[14px] font-bold leading-5 text-[#005687]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Card className="relative z-10 -mt-5 grid w-full gap-4 rounded-xl border-[#dfecef] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(15,23,42,0.05)] sm:px-6 lg:grid-cols-[1fr_1fr_1fr_220px] lg:items-center">
          {hero.metrics.map((metric) => (
            <div
              className="flex items-center gap-3 border-[#e7eff3] lg:border-r lg:last:border-r-0"
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
                <p className="text-[12px] font-medium leading-4 text-[#64748b]">{metric.label}</p>
                <p className="text-[15px] font-extrabold leading-5 text-[#005687]">{metric.title}</p>
                <p className="text-[12px] font-medium leading-4 text-[#64748b]">{metric.description}</p>
              </div>
            </div>
          ))}
          <Button
            className="min-h-11 rounded-full bg-[#3695B9] px-6 text-[14px] font-bold shadow-none hover:bg-[#2c84a5]"
            icon={<CalendarIcon />}
            onClick={() => navigate('/book-appointment')}
          >
            {hero.appointmentLabel}
          </Button>
        </Card>
      </div>
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
      <p className="text-[11px] font-extrabold uppercase leading-4 tracking-[3px] text-[#3695B9] sm:text-[12px] sm:tracking-[3.6px]">{eyebrow}</p>
      <h2 className="mt-2 text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[32px]">
        {title}
      </h2>
      {description ? <p className="mt-3 text-[16px] font-normal leading-7 text-[#64748b]">{description}</p> : null}
    </div>
  );
}

const branchCoordinates: Record<string, { lat: number; lng: number }> = {
  'Arunreah Dental Clinic - TTP': { lat: 11.53982, lng: 104.91421 },
  'Arunreah Dental Clinic - Psa Chas': { lat: 11.57351, lng: 104.92552 },
};

function BranchCard({
  branch,
  flipped,
}: {
  branch: BranchesPageContent['branches'][number];
  flipped: boolean;
}) {
  const [viewMode, setViewMode] = useState<'photo' | 'satellite'>('photo');
  const phoneHref = `tel:${branch.phones[0]?.replaceAll(' ', '') ?? ''}`;
  const coords = branchCoordinates[branch.name] ?? { lat: 11.53982, lng: 104.91421 };
  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim();
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${coords.lat},${coords.lng}&maptype=satellite&zoom=17`
    : `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=k&z=17&ie=UTF8&iwloc=&output=embed`;

  return (
    <Card className="grid overflow-hidden rounded-xl border-[#e1ebef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition duration-200 hover:border-[#cfe4ec] hover:shadow-[0_8px_20px_rgba(15,23,42,0.07)] lg:h-[360px] lg:grid-cols-2">
      <div className={`${flipped ? 'lg:order-2' : ''} flex flex-col justify-between p-5 sm:p-6`}>
        <div>
          <Badge className="gap-1.5 !bg-[#3695B9] px-3 py-1 text-[10px] !text-white">
            <AssetIcon className="size-[10px] brightness-0 invert" name="branch-card-pin-alt.svg" />
            {branch.badge}
          </Badge>
          <h3 className="mt-3 text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[24px]">
            {branch.name}
          </h3>

          <dl className="mt-5 space-y-3 text-[14px] font-medium leading-6 text-[#64748b]">
            <div className="flex items-start gap-3.5">
              <dt className="shrink-0">
                <span className="sr-only">Address</span>
                <AssetIcon className="mt-1 size-4" name="branch-card-pin-alt.svg" />
              </dt>
              <dd className="max-w-[480px]">{branch.address}</dd>
            </div>
            <div className="flex items-center gap-3.5">
              <dt className="shrink-0">
                <span className="sr-only">Phone</span>
                <AssetIcon className="size-4" name="branch-card-phone.svg" />
              </dt>
              <dd className="flex flex-wrap gap-x-6 gap-y-1 font-extrabold text-[#005687]">
                {branch.phones.map((phone) => (
                  <a className="hover:text-[#3695B9] hover:underline" href={`tel:${phone.replaceAll(' ', '')}`} key={phone}>
                    {phone}
                  </a>
                ))}
              </dd>
            </div>
            <div className="flex items-center gap-3.5">
              <dt className="shrink-0">
                <span className="sr-only">Opening hours</span>
                <AssetIcon className="size-4" name="branch-card-clock.svg" />
              </dt>
              <dd>
                <span className="mr-4 text-[#64748b]">{branch.hoursDays}</span>
                <span className="font-extrabold text-[#005687]">{branch.hoursTime}</span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
          <a
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#3695B9] px-5 text-[13px] font-bold text-white shadow-none transition hover:bg-[#2c84a5]"
            href={branch.directionsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <AssetIcon className="size-3.5 brightness-0 invert" name="branch-card-pin-alt.svg" />
            {branch.directionsLabel}
          </a>
          <a
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#f1f6fa] px-5 text-[13px] font-bold text-[#3695B9] transition hover:bg-[#e4eff5]"
            href={phoneHref}
          >
            <AssetIcon className="size-3.5" name="branch-card-phone.svg" />
            {branch.phoneLabel}
          </a>
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#d8e6ee] bg-white px-5 text-[13px] font-bold text-[#3695B9] transition hover:border-[#3695B9] hover:bg-[#f9fcfd]"
            to="/book-appointment"
          >
            <AssetIcon className="size-3.5" name="hero-calendar.svg" />
            {branch.bookingLabel}
          </Link>
        </div>
      </div>

      <div className={`relative min-h-[250px] bg-[#eaf2f6] lg:min-h-full ${flipped ? 'lg:order-1' : ''}`}>
        {viewMode === 'photo' ? (
          branch.imageUrl ? <img alt={branch.imageAlt || branch.name} className="absolute inset-0 h-full w-full object-cover" src={branch.imageUrl} /> : <div aria-hidden="true" className="absolute inset-0 bg-[#eaf2f6]" />
        ) : (
          <iframe
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={embedUrl}
            title={`Google Maps Satellite - ${branch.name}`}
          />
        )}

        {/* View Mode Toggle: Clinic Photo / Google Satellite */}
        <div className="absolute right-3 top-3 z-10 flex items-center rounded-full border border-[#e3edf1] bg-white/95 p-1 shadow-[0_2px_8px_rgba(15,23,42,0.08)] backdrop-blur">
          <button
            className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
              viewMode === 'photo' ? 'bg-[#3695B9] text-white shadow-sm' : 'text-[#6b7280] hover:text-[#005687]'
            }`}
            onClick={() => setViewMode('photo')}
            type="button"
          >
            Photo
          </button>
          <button
            className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
              viewMode === 'satellite' ? 'bg-[#3695B9] text-white shadow-sm' : 'text-[#6b7280] hover:text-[#005687]'
            }`}
            onClick={() => setViewMode('satellite')}
            type="button"
          >
            Satellite Map
          </button>
        </div>

        {/* Floating Google Maps Link Button */}
        <a
          className="group/map absolute bottom-4 left-4 z-10 inline-flex h-10 items-center overflow-hidden rounded-full bg-white shadow-[0_3px_10px_rgba(15,23,42,0.10)] backdrop-blur transition duration-200 hover:bg-[#f8fcfd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3695B9]"
          href={branch.mapUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="grid size-10 place-items-center bg-[#edf7fb] transition-colors group-hover/map:bg-[#3695B9]">
            <AssetIcon className="size-[16px] transition group-hover/map:brightness-0 group-hover/map:invert" name="branch-card-pin-alt.svg" />
          </span>
          <span className="px-4 text-[12.5px] font-bold text-[#005687] transition-colors group-hover/map:text-[#3695B9]">
            {branch.mapLabel}
          </span>
        </a>
      </div>
    </Card>
  );
}

function BranchesList({ content }: { content: BranchesPageContent }) {
  return (
    <section className="bg-white pb-10 pt-10 sm:pb-14 sm:pt-12">
      <SectionIntro
        description={content.sections.branchesDescription}
        eyebrow={content.sections.branchesEyebrow}
        title={content.sections.branchesTitle}
      />
      <div className="mx-auto mt-7 grid w-full max-w-[1280px] gap-6 px-4 sm:mt-8 sm:px-6 lg:px-8">
        {content.branches.map((branch, index) => (
          <BranchCard branch={branch} flipped={index % 2 === 1} key={branch.name} />
        ))}
      </div>
    </section>
  );
}

function BenefitsSection({ content }: { content: BranchesPageContent }) {
  if (content.benefits.length === 0) return null;

  return (
    <section className="border-y border-[#e7eff3] bg-[#f7fafc] py-10 sm:py-12">
      <SectionIntro eyebrow={content.sections.benefitsEyebrow} title={content.sections.benefitsTitle} />
      <div className="mx-auto mt-7 grid w-full max-w-[1280px] gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {content.benefits.map((item) => (
          <Card
            className="min-h-[168px] rounded-xl !border-transparent !bg-white px-5 py-5 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(15,23,42,0.06)]"
            key={item.title}
          >
            <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#f7fafc] shadow-none ring-1 ring-[#e6eef3]">
              <img alt="" aria-hidden="true" className="max-h-5 max-w-5" src={item.iconUrl} />
            </span>
            <h3 className="mt-4 text-[15px] font-bold leading-5 text-[#005687]">{item.title}</h3>
            <p className="mx-auto mt-2 max-w-[220px] text-[13px] font-normal leading-5 text-[#64748b]">
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
    <section className="bg-white pb-10 pt-8 sm:pb-14">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#3695B9] to-[#005687] px-5 py-7 text-white sm:px-8 sm:py-8">
        <img
          alt={cta.backgroundImageAlt}
          className="absolute inset-y-0 right-0 hidden h-full w-[48%] object-cover opacity-25 md:block"
          src={cta.backgroundImageUrl}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#3695B9]/95 to-[#005687]/95" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/16">
              <AssetIcon className="size-6 brightness-0 invert" name="hero-calendar.svg" />
            </span>
            <div>
              <p className="text-[12px] font-bold uppercase leading-4 tracking-wider text-white/75">{cta.eyebrow}</p>
              <h2 className="mt-1 text-[23px] font-extrabold leading-tight sm:text-[26px]">{cta.title}</h2>
              <p className="mt-1 text-[14px] font-normal leading-6 text-white/80">{cta.subtitle}</p>
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
      <main aria-busy="true" aria-label="Loading clinic locations" className="bg-white">
        <span className="sr-only">Loading clinic locations</span>

        <section className="relative min-h-[300px] overflow-hidden bg-[#f7fafc] sm:min-h-[340px]" aria-hidden="true">
          <div className="absolute inset-y-0 right-0 hidden w-[47%] bg-[linear-gradient(135deg,#dceef3_0%,#eff7f9_100%)] lg:block" />
          <div className="relative mx-auto flex min-h-[300px] max-w-[1280px] items-center px-5 sm:min-h-[340px] sm:px-8 lg:px-10">
            <div className="w-full max-w-[590px] space-y-4 animate-pulse">
              <div className="h-3 w-28 rounded-full bg-[#d8e8ed]" />
              <div className="h-10 w-full max-w-[440px] rounded-lg bg-[#d4e7ed] sm:h-12" />
              <div className="h-4 w-full max-w-[520px] rounded-full bg-[#e2eef1]" />
              <div className="h-4 w-[72%] rounded-full bg-[#e2eef1]" />
            </div>
          </div>
        </section>

        <section aria-hidden="true" className="relative z-10 mx-auto -mt-5 max-w-[1280px] px-5 sm:px-8 lg:px-10">
          <div className="grid overflow-hidden rounded-xl border border-[#dcebef] bg-white shadow-[0_10px_28px_rgba(14,77,111,0.08)] sm:grid-cols-[1fr_1fr_1.1fr]">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="flex min-h-[82px] items-center gap-3 border-b border-[#e6f0f2] px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0" key={index}>
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[#d8ecf1]" />
                <div className="min-w-0 flex-1 space-y-2 animate-pulse">
                  <div className="h-3 w-20 rounded-full bg-[#d9e8ec]" />
                  <div className="h-4 w-full max-w-[150px] rounded-full bg-[#e6f0f2]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-5 pb-10 pt-10 sm:px-8 sm:pb-14 sm:pt-12 lg:px-10" aria-hidden="true">
          <div className="mx-auto mb-8 max-w-[540px] space-y-3 text-center animate-pulse sm:mb-10">
            <div className="mx-auto h-3 w-24 rounded-full bg-[#dcebef]" />
            <div className="mx-auto h-9 w-64 max-w-full rounded-lg bg-[#d4e7ed]" />
            <div className="mx-auto h-4 w-full max-w-[440px] rounded-full bg-[#e6f0f2]" />
          </div>

          <div className="space-y-5 sm:space-y-6">
            {Array.from({ length: 2 }, (_, index) => (
              <article className="grid overflow-hidden rounded-xl border border-[#e1ecef] bg-white lg:min-h-[360px] lg:grid-cols-2" key={index}>
                <div className="space-y-5 p-6 sm:p-8 lg:p-10 animate-pulse">
                  <div className="h-7 w-56 max-w-full rounded-lg bg-[#d6e8ed]" />
                  <div className="space-y-3">
                    <div className="h-4 w-[84%] rounded-full bg-[#e5f0f2]" />
                    <div className="h-4 w-[68%] rounded-full bg-[#e5f0f2]" />
                  </div>
                  <div className="space-y-3 border-t border-[#edf3f4] pt-5">
                    <div className="h-4 w-44 rounded-full bg-[#dfecef]" />
                    <div className="h-4 w-36 rounded-full bg-[#dfecef]" />
                    <div className="h-4 w-52 rounded-full bg-[#dfecef]" />
                  </div>
                </div>
                <div className="min-h-[210px] bg-[linear-gradient(135deg,#e2f0f3_0%,#f5f9fa_100%)] lg:min-h-0" />
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#f7fafc] px-5 py-10 sm:px-8 sm:py-12 lg:px-10" aria-hidden="true">
          <div className="mx-auto max-w-[1280px] rounded-xl bg-[#0f87ad] px-6 py-8 sm:px-10 sm:py-9 animate-pulse">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="space-y-3">
                <div className="h-7 w-60 max-w-full rounded-lg bg-white/25" />
                <div className="h-4 w-80 max-w-full rounded-full bg-white/20" />
              </div>
              <div className="h-11 w-44 rounded-lg bg-white/90" />
            </div>
          </div>
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
  return Boolean(content && content.navigation.length > 0 && content.hero.title && content.branches.length > 0);
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
