import { useNavigate } from 'react-router-dom';
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

function DirectionIcon() {
  return (
    <svg aria-hidden="true" className="size-[24px]" fill="none" viewBox="0 0 32 32">
      <path
        d="M5.55 11.75 11.2 9.2v17.18l-5.03 2.24A1.55 1.55 0 0 1 4 27.2V13.17c0-.62.37-1.18 1.55-1.42Z"
        fill="currentColor"
      />
      <path
        d="m12.95 9.1 6.1 2.02v17.2l-6.1-2.02V9.1ZM20.8 11.1l5.03-2.25A1.55 1.55 0 0 1 28 10.27V24.3c0 .62-.37 1.18-.94 1.43l-6.26 2.8V11.1Z"
        fill="currentColor"
      />
      <path
        d="M16 .45A7.35 7.35 0 0 0 8.65 7.8C8.65 13.3 16 20.75 16 20.75s7.35-7.45 7.35-12.95A7.35 7.35 0 0 0 16 .45Z"
        fill="currentColor"
      />
      <circle cx="16" cy="7.8" fill="#3695B9" r="2.1" />
    </svg>
  );
}

function MetricLocationIcon() {
  return (
    <svg aria-hidden="true" className="size-[22px]" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 21.2s7-5.95 7-11.75A6.86 6.86 0 0 0 12 2.5a6.86 6.86 0 0 0-7 6.95c0 5.8 7 11.75 7 11.75Z"
        fill="#167fb0"
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
        fill="#167fb0"
      />
      <circle cx="12" cy="9.45" fill="white" r="2.25" />
    </svg>
  );
}

function CalendarIcon({ className = 'size-[18px]' }: { className?: string }) {
  return <AssetIcon className={`${className} brightness-0 invert`} name="hero-calendar.svg" />;
}

function ActionLink({
  children,
  href,
  icon,
  primary = false,
  variant,
}: {
  children: string;
  href: string;
  icon?: string;
  primary?: boolean;
  variant?: 'primary' | 'soft' | 'outline';
}) {
  const style = variant ?? (primary ? 'primary' : 'outline');
  const styles = {
    outline: 'border border-[#d8e6ee] bg-white text-[#3695b9] hover:-translate-y-0.5 hover:border-[#c4dfeb] hover:bg-[#f9fcfd]',
    primary: 'bg-[#3695b9] text-white shadow-[0_10px_18px_rgba(54,149,185,0.20)] hover:-translate-y-0.5 hover:bg-[#2f8cad] hover:shadow-[0_12px_20px_rgba(54,149,185,0.24)]',
    soft: 'bg-[#f1f6fa] text-[#3695b9] hover:-translate-y-0.5 hover:bg-[#e9f1f6]',
  };

  return (
    <a
      className={`inline-flex min-h-[54px] items-center justify-center gap-3 whitespace-nowrap rounded-full px-5 text-[15px] font-extrabold leading-5 transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3695B9] ${styles[style]}`}
      href={href}
    >
      {style === 'primary' ? (
        <DirectionIcon />
      ) : (
        <img alt="" aria-hidden="true" className="size-[20px]" src={icon} />
      )}
      {children}
    </a>
  );
}

function BranchesHero({ hero }: { hero: BranchesPageContent['hero'] }) {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#eef5f8] pb-0">
      <div className="relative min-h-[505px] overflow-hidden bg-white">
        <img
          alt={hero.backgroundImageAlt}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-75"
          src={hero.backgroundImageUrl}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-white via-white/88 to-white/12" />
        <div className="relative mx-auto flex min-h-[505px] w-full max-w-[1280px] items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-[520px] pt-4">
            <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[5px] text-[#3695b9]">
              {hero.eyebrow}
            </p>
            <h1 className="mt-6 text-[46px] font-extrabold leading-[54px] text-[#3695b9] sm:text-[58px] sm:leading-[66px]">
              {hero.title}
            </h1>
            <p className="mt-4 max-w-[420px] text-[19px] font-medium leading-8 text-[#6b7280]">{hero.subtitle}</p>
            <div className="mt-5 flex flex-wrap gap-7">
              {hero.highlights.map((item) => (
                <div className="flex items-center gap-3" key={item.label}>
                  <span className="grid size-[36px] place-items-center rounded-full bg-[#eef8fb]">
                    {item.label === '2 Modern Clinics' ? (
                      <HighlightLocationIcon />
                    ) : (
                      <img alt="" aria-hidden="true" className="size-[14px]" src={item.iconUrl} />
                    )}
                  </span>
                  <span className="text-[14px] font-extrabold leading-5 text-[#005687]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Card className="relative z-10 mx-auto -mt-[64px] grid w-[calc(100%-32px)] max-w-[1280px] gap-5 rounded-xl border-[#edf2f7] px-6 py-7 shadow-[0_16px_38px_rgba(15,23,42,0.08)] sm:px-8 lg:grid-cols-[1fr_1fr_1fr_240px] lg:items-center">
        {hero.metrics.map((metric) => (
          <div
            className="flex items-center gap-5 border-[#edf2f7] lg:border-r lg:last:border-r-0"
            key={metric.title}
          >
            <span className="grid size-[45px] shrink-0 place-items-center rounded-md bg-[#eef8fb]">
              {metric.title === 'Locations' ? (
                <MetricLocationIcon />
              ) : (
                <img alt="" aria-hidden="true" className="size-[19px]" src={metric.iconUrl} />
              )}
            </span>
            <div>
              <p className="text-[12px] font-medium leading-4 text-[#6b7280]">{metric.label}</p>
              <p className="text-[16px] font-extrabold leading-5 text-[#005687]">{metric.title}</p>
              <p className="text-[11px] font-medium leading-4 text-[#6b7280]">{metric.description}</p>
            </div>
          </div>
        ))}
        <Button
          className="min-h-[62px] rounded-[14px] bg-[#3695B9] px-9 text-[16px] shadow-[0_10px_22px_rgba(54,149,185,0.20)] hover:bg-[#2c84a5]"
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
      <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[4px] text-[#3695b9]">{eyebrow}</p>
      <h2 className="mt-5 text-[34px] font-extrabold leading-[42px] text-[#005687] sm:text-[40px] sm:leading-[48px]">
        {title}
      </h2>
      {description ? <p className="mt-6 text-[14px] font-medium leading-6 text-[#6b7280]">{description}</p> : null}
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
    <Card className="grid overflow-hidden rounded-xl border-[#edf2f7] shadow-[0_2px_4px_rgba(15,23,42,0.04)] lg:h-[402px] lg:grid-cols-2">
      <div className={`${flipped ? 'lg:order-2' : ''} px-6 py-8 sm:px-[46px] sm:py-[42px]`}>
        <Badge className="gap-1.5 !bg-[#3695b9] px-3 py-1 text-[10px] !text-white">
          <AssetIcon className="size-[10px] brightness-0 invert" name="branch-card-pin-alt.svg" />
          {branch.badge}
        </Badge>
        <h3 className="mt-[18px] text-[27px] font-extrabold leading-9 text-[#005687] sm:text-[32px] sm:leading-10">
          {branch.name}
        </h3>

        <dl className="mt-[30px] space-y-[18px] text-[14px] font-medium leading-6 text-[#6b7280]">
          <div className="flex gap-4">
            <dt>
              <span className="sr-only">Address</span>
              <AssetIcon className="mt-1 size-[18px]" name="branch-card-pin-alt.svg" />
            </dt>
            <dd className="max-w-[560px]">{branch.address}</dd>
          </div>
          <div className="flex gap-4">
            <dt>
              <span className="sr-only">Phone</span>
              <AssetIcon className="mt-1 size-[18px]" name="branch-card-phone.svg" />
            </dt>
            <dd className="flex flex-wrap gap-x-8 gap-y-1 font-extrabold text-[#005687]">
              {branch.phones.map((phone) => (
                <a className="hover:text-[#3695B9] hover:underline" href={`tel:${phone.replaceAll(' ', '')}`} key={phone}>
                  {phone}
                </a>
              ))}
            </dd>
          </div>
          <div className="flex gap-4">
            <dt>
              <span className="sr-only">Opening hours</span>
              <AssetIcon className="mt-1 size-[18px]" name="branch-card-clock.svg" />
            </dt>
            <dd>
              <span className="mr-5 text-[#6b7280]">{branch.hoursDays}</span>
              <span className="font-extrabold text-[#005687]">{branch.hoursTime}</span>
            </dd>
          </div>
        </dl>

        <div className="mt-[38px] grid gap-4 md:grid-cols-[185px_140px_225px]">
          <ActionLink href={branch.directionsUrl} primary>
            {branch.directionsLabel}
          </ActionLink>
          <ActionLink href={phoneHref} icon={asset('branch-card-phone.svg')} variant="soft">
            {branch.phoneLabel}
          </ActionLink>
          <ActionLink href="/book-appointment" icon={asset('hero-calendar.svg')}>
            {branch.bookingLabel}
          </ActionLink>
        </div>
      </div>
      <div className={`relative min-h-[320px] lg:min-h-full ${flipped ? 'lg:order-1' : ''}`}>
        <img alt={branch.imageAlt} className="absolute inset-0 h-full w-full object-cover" src={branch.imageUrl} />
        <a
          className={`absolute bottom-[26px] left-[28px] inline-flex min-h-[58px] items-center overflow-hidden rounded-md bg-white text-[13px] font-extrabold text-[#005687] shadow-[0_12px_26px_rgba(15,23,42,0.14)] transition hover:text-[#3695B9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3695B9] ${
            flipped ? '' : 'lg:left-8'
          }`}
          href={branch.mapUrl}
        >
          <span className="grid h-[58px] w-[58px] place-items-center bg-[#eef8fb]">
            <AssetIcon className="size-[22px]" name="branch-card-pin-alt.svg" />
          </span>
          <span className="px-[22px]">{branch.mapLabel}</span>
        </a>
      </div>
    </Card>
  );
}

function BranchesList({ content }: { content: BranchesPageContent }) {
  return (
    <section className="bg-[#eef5f8] pb-[96px] pt-16">
      <SectionIntro
        description={content.sections.branchesDescription}
        eyebrow={content.sections.branchesEyebrow}
        title={content.sections.branchesTitle}
      />
      <div className="mx-auto mt-[66px] grid w-full max-w-[1280px] gap-[62px] px-4 sm:px-6 lg:px-8">
        {content.branches.map((branch, index) => (
          <BranchCard branch={branch} flipped={index % 2 === 1} key={branch.name} />
        ))}
      </div>
    </section>
  );
}

function BenefitsSection({ content }: { content: BranchesPageContent }) {
  return (
    <section className="bg-white py-[96px]">
      <SectionIntro eyebrow={content.sections.benefitsEyebrow} title={content.sections.benefitsTitle} />
      <div className="mx-auto mt-[70px] grid w-full max-w-[1280px] gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {content.benefits.map((item) => (
          <Card
            className="min-h-[226px] rounded-xl !border-transparent !bg-[#f7fafc] px-8 py-[30px] text-center shadow-none transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
            key={item.title}
          >
            <span className="mx-auto grid size-[56px] place-items-center rounded-full bg-white shadow-[0_8px_16px_rgba(15,23,42,0.12)] ring-1 ring-[#e6eef3]">
              <img alt="" aria-hidden="true" className="max-h-[25px] max-w-[25px]" src={item.iconUrl} />
            </span>
            <h3 className="mt-[30px] text-[18px] font-extrabold leading-6 text-[#005687]">{item.title}</h3>
            <p className="mx-auto mt-[13px] max-w-[230px] text-[16px] font-medium leading-6 text-[#6b7280]">
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
    <section className="bg-white">
      <div className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-xl bg-gradient-to-r from-[#3695B9] to-[#005687] px-6 py-11 text-white sm:px-16">
        <img
          alt={cta.backgroundImageAlt}
          className="absolute inset-y-0 right-0 hidden h-full w-[48%] object-cover opacity-25 md:block"
          src={cta.backgroundImageUrl}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#3695B9]/95 to-[#005687]/95" />
        <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-7">
            <span className="grid size-[78px] shrink-0 place-items-center rounded-full bg-white/16">
              <AssetIcon className="size-[28px] brightness-0 invert" name="hero-calendar.svg" />
            </span>
            <div>
              <p className="text-[13px] font-bold leading-5 text-white/70">{cta.eyebrow}</p>
              <h2 className="text-[30px] font-extrabold leading-9">{cta.title}</h2>
              <p className="mt-1 text-[13px] font-medium leading-5 text-white/70">{cta.subtitle}</p>
            </div>
          </div>
          <Button
            className="min-h-[58px] rounded-full bg-white px-12 text-[15px] text-[#3695B9] shadow-none hover:bg-[#eef8fb] hover:text-[#005687] focus-visible:outline-white"
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
