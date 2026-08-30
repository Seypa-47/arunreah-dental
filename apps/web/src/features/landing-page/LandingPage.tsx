import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import type {
  LandingBranch,
  LandingDoctor,
  LandingPageContent,
  LandingService,
  LandingShowcase,
} from '@/features/landing-page/types';
import { useLandingPageQuery } from './use-landing-page';

const asset = (name: string) => `/assets/landing/${name}`;
const serviceId = (name: string) => `service-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '')}`;

function AssetIcon({ alt = '', className, name }: { alt?: string; className: string; name: string }) {
  return <img alt={alt} aria-hidden={alt ? undefined : true} className={className} src={asset(name)} />;
}

function ArrowIcon() {
  return (
    <span
      aria-hidden="true"
      className="size-[14px] bg-current [mask-image:url('/assets/landing/arrow-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
    />
  );
}

function CarouselArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d={direction === 'left' ? 'M15 18L9 12L15 6' : 'M9 6L15 12L9 18'}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.75"
      />
    </svg>
  );
}

function HeroArrowButton({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  return (
    <button
      aria-label={direction === 'left' ? 'Previous branch' : 'Next branch'}
      className="grid size-12 place-items-center rounded-full border border-[#3695B9] bg-white/95 text-[#3695B9] shadow-[0_8px_20px_rgba(15,23,42,0.14)] transition hover:bg-[#3695B9] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
      onClick={onClick}
      type="button"
    >
      <CarouselArrowIcon direction={direction} />
    </button>
  );
}

function SectionHeader({
  actionHref = '#',
  actionLabel,
  align = 'left',
  eyebrow,
  title,
}: {
  align?: 'center' | 'left';
  actionHref?: string;
  actionLabel: string;
  eyebrow?: string;
  title: string;
}) {
  const titleColor = 'text-[#005687]';

  return (
    <div className="mx-auto flex w-full max-w-[1280px] items-end justify-between gap-4 px-4 sm:px-6 lg:px-0">
      <div className={align === 'center' ? 'mx-auto text-center' : undefined}>
        {eyebrow ? (
          <p className="mb-4 text-[12px] font-bold uppercase leading-4 tracking-[3.6px] text-[#3695b9]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className={`text-[30px] font-extrabold leading-9 ${titleColor}`}>{title}</h2>
      </div>
      {align === 'left' ? (
        <a
          className="hidden items-center gap-2 text-[14px] font-bold leading-5 text-[#005687] transition hover:text-[#35a6c7] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f9fbe] sm:inline-flex"
          href={actionHref}
        >
          {actionLabel}
          <ArrowIcon />
        </a>
      ) : null}
    </div>
  );
}

function HeroSlide({ hero }: { hero: LandingPageContent['heroes'][number] }) {
  return (
    <article className="w-full shrink-0 snap-center">
      <div className="relative mx-auto w-full max-w-[1120px] px-4 pb-10 pt-5 sm:px-6 md:h-[610px] md:px-0 md:pb-0">
        <div className="relative h-full">
          <div className="relative h-[340px] overflow-hidden rounded-[32px] bg-[#dfe9ee] shadow-[0_14px_28px_rgba(15,23,42,0.10)] md:absolute md:inset-x-0 md:top-4 md:h-[510px]">
            <img alt={hero.imageAlt} className="h-full w-full object-cover object-center" src={hero.imageUrl} />
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[32px] bg-gradient-to-t from-black/20 to-transparent"
            />
          </div>
          <div className="relative mx-3 -mt-[38px] grid min-h-[96px] overflow-hidden rounded-[14px] bg-[#3695b9] text-white shadow-[0_14px_28px_rgba(15,23,42,0.16)] md:absolute md:left-1/2 md:top-[482px] md:mx-0 md:mt-0 md:w-[900px] md:-translate-x-1/2 md:grid-cols-[88px_270px_270px_272px]">
            <div
              aria-label={hero.qrLabel}
              className="hidden min-h-[96px] place-items-center bg-white px-[21px] py-[14px] md:grid"
              role="img"
            >
              <img alt="" className="size-[57px]" src={hero.qrImageUrl} />
            </div>
            <div className="flex items-center gap-[14px] border-white/20 bg-[#3695b9] px-[28.5px] py-[21px] md:border-r">
              <span className="grid size-[43px] shrink-0 place-items-center rounded-full bg-white/[0.13]">
                <AssetIcon className="h-[18px] w-[14px]" name="hero-location.svg" />
              </span>
              <div className="max-w-[192px]">
                <p className="text-[11px] font-normal leading-[14px] text-white/70">{hero.locationLabel}</p>
                <p className="mt-0.5 text-[12px] font-medium leading-[17px] text-white">{hero.address}</p>
              </div>
            </div>
            <div className="flex items-center justify-center border-t border-white/20 bg-[#3695b9] px-[28.5px] py-[21px] md:border-r md:border-t-0">
              <Button
                className="min-h-[50px] w-full max-w-[234px] rounded-xl border border-[#009fb2] text-[16px] font-bold text-[#3696b9]"
                icon={<AssetIcon className="h-4 w-[14px]" name="hero-calendar.svg" />}
                variant="secondary"
              >
                {hero.appointmentLabel}
              </Button>
            </div>
            <div className="flex items-center gap-[14px] border-t border-white/20 bg-[#3695b9] px-[28.5px] py-[21px] md:border-t-0">
              <span className="grid size-[43px] shrink-0 place-items-center rounded-full bg-white/[0.13]">
                <AssetIcon className="size-[18px]" name="hero-phone.svg" />
              </span>
              <div>
                <p className="mb-0.5 text-[11px] font-normal leading-[14px] text-white/70">{hero.callLabel}</p>
                <div className="text-[16px] font-bold leading-5">
                  {hero.phones.map((phone) => (
                    <a className="block hover:underline" href={`tel:${phone.replaceAll(' ', '')}`} key={phone}>
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function HeroSection({ heroes }: { heroes: LandingPageContent['heroes'] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const scrollToHero = (index: number) => {
    const carousel = carouselRef.current;
    const nextIndex = Math.min(Math.max(index, 0), heroes.length - 1);

    if (!carousel) {
      return;
    }

    setActiveHeroIndex(nextIndex);
    carousel.scrollTo({
      behavior: 'smooth',
      left: carousel.clientWidth * nextIndex,
    });
  };

  const scrollToBranch = (direction: -1 | 1) => {
    scrollToHero(activeHeroIndex + direction);
  };

  const syncActiveHero = () => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    setActiveHeroIndex(Math.round(carousel.scrollLeft / carousel.clientWidth));
  };

  return (
    <section aria-label="Clinic branches" className="relative bg-[#f7fafc]">
      <div
        className="hero-carousel flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={syncActiveHero}
        ref={carouselRef}
      >
        {heroes.map((hero) => (
          <HeroSlide hero={hero} key={hero.address} />
        ))}
      </div>
      {heroes.length > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-[190px] mx-auto flex w-full max-w-[1180px] items-center justify-between px-3 sm:top-[276px] sm:px-6 md:top-[270px]">
            <div className="pointer-events-auto">
              <HeroArrowButton direction="left" onClick={() => scrollToBranch(-1)} />
            </div>
            <div className="pointer-events-auto">
              <HeroArrowButton direction="right" onClick={() => scrollToBranch(1)} />
            </div>
          </div>
          <div
            aria-label="Hero branch slides"
            className="absolute left-1/2 top-[590px] hidden -translate-x-1/2 items-center gap-3 rounded-full bg-white/95 px-3 py-2 shadow-[0_8px_18px_rgba(15,23,42,0.10)] md:flex"
          >
            {heroes.map((hero, index) => (
              <button
                aria-label={`Go to ${hero.address}`}
                className={`size-2 rounded-full transition ${
                  activeHeroIndex === index ? 'bg-[#3695B9]' : 'bg-[#cbd5e1]'
                }`}
                key={hero.address}
                onClick={() => scrollToHero(index)}
                type="button"
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

function ServicesSection({ services }: { services: LandingService[] }) {
  return (
    <section className="mt-[55px] overflow-hidden bg-white pb-[64px] pt-[64px]" id="services">
      <div className="relative">
        <SectionHeader actionLabel="See All Services" align="center" eyebrow="What We Offer" title="Our Services" />
        <a
          className="absolute right-4 top-[36px] hidden items-center gap-2 text-[14px] font-bold leading-5 text-[#005687] transition hover:text-[#2a86a8] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f9fbe] sm:inline-flex lg:right-20"
          href="#"
        >
          See All Services
          <ArrowIcon />
        </a>
      </div>
      <div className="service-marquee mx-auto mt-12 w-full max-w-[1440px] overflow-hidden px-4 sm:px-6 lg:px-20">
        <div className="service-marquee-track flex w-max gap-[50px]">
          {[0, 1].map((copyIndex) => (
            <div aria-hidden={copyIndex === 1} className="flex gap-[50px]" key={copyIndex}>
              {services.map((service) => (
                <Card
                  className="flex h-[340px] min-w-[290px] flex-col items-center rounded-[24px] border-2 !border-[#3695B9] px-6 py-6 text-center shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                  id={copyIndex === 0 ? serviceId(service.name) : undefined}
                  key={`${copyIndex}-${service.name}`}
                >
                  <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-[#f0f9fa]">
                    <img alt={service.iconAlt} className="max-h-[22px] max-w-[25px]" src={service.iconUrl} />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-bold leading-5 text-[#00a6ba]">{service.name}</h3>
                    <p className="mx-auto mt-4 min-h-[54px] max-w-[220px] text-[13px] font-normal leading-[18px] text-[#7c8798]">
                      {service.description}
                    </p>
                  </div>
                  <div className="mt-auto grid h-[118px] w-full place-items-center">
                    <img
                      alt={service.imageAlt}
                      className="max-h-[118px] max-w-[150px] object-contain"
                      src={service.imageUrl}
                    />
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DoctorsSection({ doctors }: { doctors: LandingDoctor[] }) {
  return (
    <section className="bg-[#f7fafc] pb-[48px] pt-[56px]" id="doctors">
      <SectionHeader actionHref="/doctors" actionLabel="See All Doctors" title="Meet Our Specialists" />
      <div className="mx-auto mt-[60px] grid w-full max-w-[1192px] gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-0">
        {doctors.map((doctor) => (
          <Card
            className="h-[354px] overflow-hidden rounded-lg border-[#edf2f7] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            key={doctor.name}
          >
            <img
              alt={doctor.imageAlt}
              className="h-[256px] w-full bg-[#eaf2f6] object-cover object-top"
              src={doctor.imageUrl}
            />
            <div className="flex h-[76px] flex-col justify-center px-4 py-3">
              <h3 className="text-[14px] font-semibold leading-5 text-[#0c2243]">{doctor.name}</h3>
              <p className="mt-1 text-[12px] font-medium leading-4 text-[#3695b9]">{doctor.specialty}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function BranchesSection({ branches }: { branches: LandingBranch[] }) {
  return (
    <section className="bg-[#f7fafc] pb-[64px] pt-[22px]" id="branches">
      <SectionHeader actionLabel="See All Branches" title="Branches" />
      <div className="mx-auto mt-[26px] grid w-full max-w-[1440px] gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-20">
        {branches.map((branch) => {
          const [days, time] = branch.hours.split(', ');

          return (
            <Card
              className="grid min-h-[246px] overflow-hidden rounded-2xl border-[#f3f4f6] shadow-[0_1px_2px_rgba(0,0,0,0.05)] md:grid-cols-[345px_1fr]"
              key={branch.name}
            >
              <div className="p-6">
                <h3 className="mb-6 flex items-center gap-3 text-[18px] font-semibold leading-[18px] text-[#005687]">
                  <img alt="" aria-hidden="true" className="size-6" src={asset('branch-card-pin.svg')} />
                  {branch.name}
                </h3>
                <div className="space-y-4 border-b border-[#f3f4f6] pb-[18px]">
                  {branch.phones.map((phone) => (
                    <a
                      className="flex items-center gap-3 text-[14px] font-semibold leading-5 text-[#005687] hover:underline"
                      href={`tel:${phone.replaceAll(' ', '')}`}
                      key={phone}
                    >
                      <img alt="" aria-hidden="true" className="size-5" src={asset('branch-card-phone.svg')} />
                      {phone}
                    </a>
                  ))}
                </div>
                <p className="mt-4 flex items-start gap-3 text-[12px] leading-4 text-[#6b7280]">
                  <img alt="" aria-hidden="true" className="size-5" src={asset('branch-card-clock.svg')} />
                  <span>
                    {days}
                    <span className="block font-semibold text-[#005687]">{time}</span>
                  </span>
                </p>
              </div>
              <img
                alt={branch.imageAlt}
                className="h-[245px] w-full bg-[#e5e7eb] object-cover md:h-full"
                src={branch.imageUrl}
              />
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function ShowcaseSection({ showcase }: { showcase: LandingShowcase[] }) {
  return (
    <section className="mt-[33px] bg-[#3695b9] pb-[54px] pt-[59px] text-white" id="showcase">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-20">
        <div className="mb-[35px] flex items-end justify-between border-b border-white/30 pb-4">
          <div>
            <h2 className="text-[32px] font-bold leading-10">Latest Showcase</h2>
            <div className="mt-2 h-0.5 w-[200px] rounded-full bg-white" />
          </div>
          <a
            className="hidden items-center gap-2 text-[16px] font-semibold leading-6 hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:inline-flex"
            href="#"
          >
            View Show Cases
            <AssetIcon className="h-3 w-[8px]" name="showcase-chevron.svg" />
          </a>
        </div>
        <div className="grid gap-[40px] md:grid-cols-3">
          {showcase.map((item) => (
            <article key={item.title}>
              <img alt={item.imageAlt} className="h-[320px] w-full rounded-t-3xl object-cover" src={item.imageUrl} />
              <h3 className="mt-6 text-[24px] font-bold leading-[33px]">{item.title}</h3>
            </article>
          ))}
        </div>
        <div aria-hidden="true" className="mt-[35px] flex justify-center gap-3">
          <span className="size-2.5 rounded-full bg-white" />
          <span className="size-2.5 rounded-full bg-white/40" />
        </div>
      </div>
    </section>
  );
}

function LandingPageView({ content }: { content: LandingPageContent }) {
  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main>
        <HeroSection heroes={content.heroes} />
        <ServicesSection services={content.services} />
        <DoctorsSection doctors={content.doctors} />
        <BranchesSection branches={content.branches} />
        <ShowcaseSection showcase={content.showcase} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function LandingPageSkeleton() {
  return (
    <SiteLayout
      actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }}
      navigation={[
        { href: '/', label: 'Home' },
        { href: '#services', label: 'Services' },
        { href: '#doctors', label: 'Doctors' },
      ]}
    >
      <main aria-busy="true" aria-label="Loading landing page" className="bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 lg:px-0">
          <div className="h-[420px] animate-pulse rounded-[30px] bg-[#dceaf0] md:h-[600px]" />
        </div>
        <div className="mx-auto grid max-w-[1280px] gap-8 bg-white px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-0">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="h-[318px] animate-pulse rounded-[20px] border-2 border-[#d6ecf3] bg-white" key={index} />
          ))}
        </div>
      </main>
    </SiteLayout>
  );
}

function LandingPageEmpty() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>No content</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#075a82]">Landing page content is unavailable</h1>
        <p className="mt-3 text-[#62798b]">Please check the content source and try again.</p>
      </Card>
    </main>
  );
}

function LandingPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#075a82]">We could not load the landing page</h1>
        <p className="mt-3 text-[#62798b]">Try again to refresh the clinic content.</p>
        <Button className="mt-6" onClick={onRetry}>
          Retry
        </Button>
      </Card>
    </main>
  );
}

function hasLandingContent(content: LandingPageContent | undefined): content is LandingPageContent {
  return Boolean(
      content &&
      content.navigation.length > 0 &&
      content.heroes.length > 0 &&
      content.services.length > 0 &&
      content.doctors.length > 0 &&
      content.branches.length > 0 &&
      content.showcase.length > 0,
  );
}

export function LandingPage() {
  const { data, isError, isLoading, refetch } = useLandingPageQuery();

  if (isLoading) {
    return <LandingPageSkeleton />;
  }

  if (isError) {
    return <LandingPageError onRetry={() => void refetch()} />;
  }

  if (!hasLandingContent(data)) {
    return <LandingPageEmpty />;
  }

  return <LandingPageView content={data} />;
}
