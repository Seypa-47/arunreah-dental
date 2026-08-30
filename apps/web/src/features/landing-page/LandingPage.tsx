import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteLayout } from '@/components/layout/site-layout';
import type {
  LandingBranch,
  LandingDoctor,
  LandingFooterLinkGroup,
  LandingPageContent,
  LandingService,
  LandingShowcase,
} from '@/features/landing-page/types';
import { useLandingPageQuery } from './use-landing-page';

const asset = (name: string) => `/assets/landing/${name}`;

function AssetIcon({ alt = '', className, name }: { alt?: string; className: string; name: string }) {
  return <img alt={alt} aria-hidden={alt ? undefined : true} className={className} src={asset(name)} />;
}

function SectionHeader({
  actionLabel,
  align = 'left',
  eyebrow,
  title,
}: {
  align?: 'center' | 'left';
  actionLabel: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] items-end justify-between gap-4 px-4 sm:px-6 lg:px-0">
      <div className={align === 'center' ? 'mx-auto text-center' : undefined}>
        {eyebrow ? (
          <p className="mb-2 text-[12px] font-bold uppercase leading-4 tracking-[3.6px] text-[#3695b9]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-[30px] font-extrabold leading-9 text-[#333]">{title}</h2>
      </div>
      {align === 'left' ? (
        <a
          className="hidden items-center gap-2 text-[13px] font-extrabold text-[#0f628a] transition hover:text-[#35a6c7] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f9fbe] sm:inline-flex"
          href="#"
        >
          {actionLabel}
          <AssetIcon className="size-[14px]" name="arrow-right.svg" />
        </a>
      ) : null}
    </div>
  );
}

function HeroSection({ hero }: { hero: LandingPageContent['hero'] }) {
  return (
    <section aria-label="Clinic introduction" className="relative overflow-hidden bg-[#f7fafc] pb-[75px] pt-4">
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-0">
        <div className="relative">
          <div className="overflow-hidden rounded-[32px] bg-[#dfe9ee] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
            <img
              alt={hero.imageAlt}
              className="h-[392px] w-full object-cover object-center md:h-[620px]"
              src={hero.imageUrl}
            />
            <div aria-hidden="true" className="absolute inset-0 rounded-[32px] bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <Card className="relative mx-3 -mt-[38px] grid min-h-[96px] overflow-hidden rounded-[14px] border-0 bg-[#3696b9] text-white shadow-[0_22px_45px_-11px_rgba(0,0,0,0.25)] md:absolute md:inset-x-[100px] md:-bottom-[38px] md:mx-0 md:mt-0 md:grid-cols-[100px_1.35fr_1.15fr_1fr]">
            <div
              aria-label={hero.qrLabel}
              className="hidden min-h-[96px] place-items-center bg-white px-[21px] py-[14px] md:grid"
              role="img"
            >
              <img alt="" className="size-[57px]" src={hero.qrImageUrl} />
            </div>
            <div className="flex items-center gap-[14px] border-white/20 px-[28px] py-[21px] md:border-r">
              <span className="grid size-[43px] shrink-0 place-items-center rounded-full bg-white/[0.13]">
                <AssetIcon className="h-[18px] w-[14px]" name="hero-location.svg" />
              </span>
              <div className="max-w-[250px]">
                <p className="text-[11px] font-normal leading-[14px] text-white/80">{hero.locationLabel}</p>
                <p className="mt-0.5 text-[13px] font-medium leading-[17px]">{hero.address}</p>
              </div>
            </div>
            <div className="flex items-center justify-center border-t border-white/20 px-[28px] py-[21px] md:border-r md:border-t-0">
              <Button
                className="min-h-[52px] w-full max-w-[234px] rounded-xl border border-[#009fb2] text-[16px] font-bold text-[#3696b9]"
                icon={<AssetIcon className="h-4 w-[14px]" name="hero-calendar.svg" />}
                variant="secondary"
              >
                {hero.appointmentLabel}
              </Button>
            </div>
            <div className="flex items-center gap-[14px] border-t border-white/20 px-[28px] py-[21px] md:border-t-0">
              <span className="grid size-[43px] shrink-0 place-items-center rounded-full bg-white/[0.13]">
                <AssetIcon className="size-[18px]" name="hero-phone.svg" />
              </span>
              <div>
                <p className="mb-0.5 text-[11px] font-normal leading-[14px] text-white/80">{hero.callLabel}</p>
                <div className="text-[16px] font-bold leading-5">
                  {hero.phones.map((phone) => (
                    <a className="block hover:underline" href={`tel:${phone.replaceAll(' ', '')}`} key={phone}>
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ services }: { services: LandingService[] }) {
  return (
    <section className="overflow-hidden bg-white pb-[64px] pt-[96px]" id="services">
      <div className="relative">
        <SectionHeader actionLabel="See All Services" align="center" eyebrow="What We Offer" title="Our Services" />
        <a
          className="absolute right-4 top-[36px] hidden items-center gap-2 text-[14px] font-bold leading-5 text-[#3695b9] transition hover:text-[#2a86a8] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f9fbe] sm:inline-flex lg:right-[120px]"
          href="#"
        >
          See All Services
          <AssetIcon className="size-[14px]" name="arrow-right.svg" />
        </a>
      </div>
      <div className="mx-auto mt-12 flex w-full max-w-[1440px] gap-6 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-20">
        {services.map((service) => (
          <Card
            className="flex h-[318px] min-w-[290px] flex-col items-center rounded-3xl border border-[#009fb2] p-6 text-center shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:min-w-[290px]"
            key={service.name}
          >
            <span className="mb-6 grid size-12 place-items-center rounded-2xl bg-[#f0f9fa]">
              <img alt={service.iconAlt} className="max-h-[22px] max-w-[25px]" src={service.iconUrl} />
            </span>
            <div>
              <h3 className="text-[16px] font-bold leading-6 text-[#3695b9]">{service.khmerName}</h3>
              <p className="mt-1 text-[12px] font-semibold uppercase leading-4 text-[#94a3b8]">{service.name}</p>
            </div>
            <div className="mt-6 grid h-32 w-full place-items-end">
              <img alt={service.imageAlt} className="size-32 object-contain" src={service.imageUrl} />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function DoctorsSection({ doctors }: { doctors: LandingDoctor[] }) {
  return (
    <section className="bg-[#f7fafc] pb-[48px] pt-[56px]" id="doctors">
      <SectionHeader actionLabel="See All Doctors" title="Meet Our Specialists" />
      <div className="mx-auto mt-12 grid w-full max-w-[1280px] gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {doctors.map((doctor) => (
          <Card className="overflow-hidden rounded-lg border-[#edf2f7] shadow-[0_1px_2px_rgba(0,0,0,0.05)]" key={doctor.name}>
            <img alt={doctor.imageAlt} className="h-[240px] w-full bg-[#eaf2f6] object-cover object-top" src={doctor.imageUrl} />
            <div className="min-h-[76px] p-4">
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
    <section className="bg-[#f7fafc] pb-[64px] pt-0" id="branches">
      <SectionHeader actionLabel="See All Branches" title="Branches" />
      <div className="mx-auto mt-[26px] grid w-full max-w-[1280px] gap-6 px-4 sm:px-6 lg:grid-cols-2">
        {branches.map((branch) => (
          <Card className="grid min-h-[246px] overflow-hidden rounded-2xl border-[#f3f4f6] shadow-[0_1px_2px_rgba(0,0,0,0.05)] md:grid-cols-[1.05fr_1fr]" key={branch.name}>
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
                  {branch.hours.split(', ')[0]}
                  <span className="block font-semibold text-[#005687]">{branch.hours.split(', ')[1]}</span>
                </span>
              </p>
            </div>
            <img alt={branch.imageAlt} className="h-[245px] w-full bg-[#e5e7eb] object-cover md:h-full" src={branch.imageUrl} />
          </Card>
        ))}
      </div>
    </section>
  );
}

function ShowcaseSection({ showcase }: { showcase: LandingShowcase[] }) {
  return (
    <section className="bg-[#3695b9] pb-[61px] pt-[59px] text-white" id="showcase">
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

function FooterLinks({ group }: { group: LandingFooterLinkGroup }) {
  return (
    <div>
      <h2 className="mb-6 text-[24px] font-semibold leading-[31px] text-[#3695b9]">{group.title}</h2>
      <ul className="space-y-4">
        {group.links.map((link) => (
          <li key={link.label}>
            <a className="text-[16px] font-normal leading-[26px] text-[#3c494c] underline hover:text-[#209cc2]" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer({
  branchLinks,
  description,
  linkGroups,
  tagline,
}: LandingPageContent['footer']) {
  return (
    <footer className="bg-white pb-20 pt-[53px]" id="about">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 sm:px-6 md:grid-cols-[1.65fr_1fr_1fr_1fr] lg:px-6">
        <div>
          <img alt="Arunreah Dental Clinic" className="mb-6 h-auto w-[337px] max-w-full" src={asset('footer-logo.png')} />
          <p className="mb-2 text-[16px] font-bold leading-[26px] text-[#3c494c]">{tagline}</p>
          <p className="max-w-[315px] text-[13px] font-normal leading-[26px] text-[#3c494c]">{description}</p>
          <div className="mt-8 flex gap-2">
            <a
              aria-label="Visit Arunreah Dental Clinic on Facebook"
              className="grid size-7 place-items-center rounded-full bg-[#2563eb]"
              href="https://www.facebook.com/"
            >
              <img alt="" className="size-4" src={asset('footer-facebook.svg')} />
            </a>
            <a
              aria-label="Contact Arunreah Dental Clinic on Messenger"
              className="grid size-7 place-items-center rounded-full bg-[#08c]"
              href="https://www.messenger.com/"
            >
              <img alt="" className="size-4" src={asset('footer-messenger.svg')} />
            </a>
          </div>
        </div>
        <div>
          <h2 className="mb-6 text-[24px] font-semibold leading-[31px] text-[#3695b9]">Our Branches</h2>
          <ul className="space-y-4">
            {branchLinks.map((link) => (
              <li className="flex items-center gap-4 text-[#3c494c]" key={link.label}>
                <img alt="" aria-hidden="true" className="h-[19px] w-[13px]" src={asset('branch-card-pin.svg')} />
                <a className="text-[16px] font-normal leading-[26px] hover:text-[#209cc2]" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {linkGroups.map((group) => (
          <FooterLinks group={group} key={group.title} />
        ))}
      </div>
    </footer>
  );
}

function LandingPageView({ content }: { content: LandingPageContent }) {
  return (
    <SiteLayout actions={content.actions} navigation={content.navigation}>
      <main>
        <HeroSection hero={content.hero} />
        <ServicesSection services={content.services} />
        <DoctorsSection doctors={content.doctors} />
        <BranchesSection branches={content.branches} />
        <ShowcaseSection showcase={content.showcase} />
      </main>
      <Footer {...content.footer} />
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
