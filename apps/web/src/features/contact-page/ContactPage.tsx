import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { MobileHeroMedia, ResilientImage } from '@/components/layout/public-ui';
import type { ContactPageContent } from '@/features/landing-page/types';
import { GoogleSatelliteMap } from './GoogleSatelliteMap';
import { useContactPageQuery } from './use-contact-page';

const skeletonNavigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/branches', label: 'Branches' },
];

type ContactIconName = ContactPageContent['contactCards'][number]['icon'];

function ContactIcon({ className = 'size-[18px]', name }: { className?: string; name: ContactIconName }) {
  const iconPath = {
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.8v4.45l3 1.75" />
      </>
    ),
    email: (
      <>
        <path d="M4 7h16v10H4z" />
        <path d="m5 8 7 5 7-5" />
      </>
    ),
    location: (
      <>
        <path
          d="M12 21s7-5.92 7-11.7A6.86 6.86 0 0 0 12 2.4a6.86 6.86 0 0 0-7 6.9C5 15.08 12 21 12 21Z"
          fill="currentColor"
          stroke="none"
        />
        <circle cx="12" cy="9.3" fill="white" r="2.1" stroke="none" />
      </>
    ),
    phone: (
      <path
        d="M7.25 4.25 9.6 3.7l2 4.65-1.9 1.25a9.75 9.75 0 0 0 4.7 4.7l1.25-1.9 4.65 2-0.55 2.35a2 2 0 0 1-2.25 1.52C10.8 17.3 6.7 13.2 5.73 6.5a2 2 0 0 1 1.52-2.25Z"
        fill="currentColor"
        stroke="none"
      />
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
      {iconPath[name]}
    </svg>
  );
}

function InfoBlock({ item, compact = false }: { compact?: boolean; item: ContactPageContent['contactCards'][number] }) {
  return (
    <div className={`flex items-center ${compact ? 'gap-4' : 'gap-5'}`}>
      <span
        className={`grid shrink-0 place-items-center rounded-full bg-[#eef8fb] text-[#3695b9] ${
          compact ? 'size-[38px]' : 'size-[46px]'
        }`}
      >
        <ContactIcon className={compact ? 'size-[15px]' : 'size-[18px]'} name={item.icon} />
      </span>
      <div className="min-w-0 break-words">
        <p className="text-[12px] font-extrabold leading-4 text-[#3695b9]">{item.label}</p>
        <p className={`whitespace-pre-line font-extrabold text-[#005687] ${compact ? 'text-[14px] leading-5' : 'text-[16px] leading-6'}`}>
          {item.value}
        </p>
        {!compact && item.description !== item.value ? (
          <p className="text-[12px] font-medium leading-4 text-[#64748b]">{item.description}</p>
        ) : null}
      </div>
    </div>
  );
}

function ContactHero({ hero }: { hero: ContactPageContent['hero'] }) {
  const imageUrl = hero.backgroundImageUrl || '/assets/landing/figma-branches/image2_183_4173.png';
  return (
    <section className="border-b border-[#e7eff3] bg-[#f7fafc] py-5 sm:py-7">
      <div className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-2xl border border-[#d9e9ee] bg-[#f7fafc] px-4 sm:px-6 lg:px-8">
        <MobileHeroMedia alt={hero.backgroundImageAlt} fallbackSrc="/assets/landing/figma-branches/image2_183_4173.png" src={hero.backgroundImageUrl} />
        <ResilientImage
          alt={hero.backgroundImageAlt}
          className="absolute inset-y-0 right-0 hidden h-full w-[58%] object-cover object-center sm:block"
          fallbackSrc="/assets/landing/figma-branches/image2_183_4173.png"
          src={imageUrl}
        />
        <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[45%] bg-[#f7fafc] sm:block" />
        <div aria-hidden="true" className="absolute inset-y-0 left-[41%] hidden w-[22%] bg-[linear-gradient(90deg,#f7fafc_0%,rgba(247,250,252,0.82)_52%,rgba(247,250,252,0)_100%)] sm:block" />
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[59%] bg-[linear-gradient(90deg,rgba(5,84,111,0.12),rgba(5,84,111,0.42))] sm:block" />
        <div className="relative grid items-center gap-6 py-8 sm:min-h-[360px] sm:py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          <div className="max-w-[620px]">
            <p className="text-[11px] font-extrabold uppercase leading-4 tracking-[3px] text-[#3695B9] sm:text-[12px] sm:tracking-[3.6px]">{hero.eyebrow}</p>
            <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687] sm:mt-3 sm:text-[38px]">
              {hero.title}
            </h1>
            <p className="mt-3 max-w-[560px] text-[16px] font-normal leading-7 text-[#64748b]">{hero.subtitle}</p>
          </div>
          <Card className="rounded-xl border-[#e1ebef] bg-white/95 p-5 shadow-[0_2px_8px_rgba(15,23,42,0.05)] backdrop-blur sm:p-6">
            <div className="space-y-4">
              {hero.info.map((item) => (
                <InfoBlock compact item={item} key={item.label} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function ContactCards({ cards }: { cards: ContactPageContent['contactCards'] }) {
  return (
    <section className="bg-white py-8 sm:py-10">
      <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {cards.map((card) => (
          <Card className="rounded-xl border-[#e1ebef] p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5" key={card.label}>
            <InfoBlock compact item={card} />
          </Card>
        ))}
      </div>
    </section>
  );
}

function ContactForm({ form }: { form: ContactPageContent['form'] }) {
  return (
    <section className="border-y border-[#e7eff3] bg-[#f7fafc] py-10 sm:py-12">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <Card className="w-full rounded-xl border-[#e1ebef] bg-white p-6 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-8">
          <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]">{form.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-[16px] leading-7 text-[#64748b]">Use our appointment request form to choose your preferred service, branch, date, and time. The clinic will review your request before confirming it.</p>
          <Link className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#3695B9] px-7 text-sm font-bold text-white shadow-none hover:bg-[#2c84a5] sm:min-h-11 sm:w-auto" to="/book-appointment">
            Book an appointment request
          </Link>
        </Card>
      </div>
    </section>
  );
}

function MapsSection({ maps }: { maps: ContactPageContent['maps'] }) {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
          {maps.map((map) => {
            if (map.lat && map.lng) {
              return (
                <GoogleSatelliteMap
                  address={map.address ?? map.label}
                  badge={map.badge}
                  directionsUrl={
                    map.directionsUrl ??
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(map.name ?? map.label)}`
                  }
                  hours={map.hours}
                  key={map.name ?? map.imageAlt}
                  lat={map.lat}
                  lng={map.lng}
                  name={map.name ?? map.label}
                  phone={map.phone}
                  zoom={map.zoom ?? 17}
                />
              );
            }

            return (
              <article className={`relative overflow-hidden rounded-xl border border-[#e1ebef] ${map.imageUrl ? 'bg-[#eaf2f6]' : 'grid min-h-[220px] place-items-center bg-[#f4fafc] p-6 text-center'}`} key={map.imageAlt}>
                {map.imageUrl ? <img alt={map.imageAlt || map.label} className="h-[280px] w-full object-cover object-center" src={map.imageUrl} /> : null}
                {map.imageUrl ? (
                  <span className="absolute left-1/2 top-[53%] inline-flex -translate-x-1/2 items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-[13px] font-extrabold text-[#005687] shadow-[0_3px_10px_rgba(15,23,42,0.12)]">
                    <ContactIcon className="size-[14px] text-[#3695B9]" name="location" />
                    {map.label}
                  </span>
                ) : (
                  <div className="max-w-[300px]">
                    <ContactIcon className="mx-auto size-[22px] text-[#3695B9]" name="location" />
                    <p className="mt-2 text-[15px] font-extrabold text-[#005687]">{map.label}</p>
                    {map.address ? <p className="mt-1 text-[14px] leading-6 text-[#607486]">{map.address}</p> : null}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContactPageView({ content }: { content: ContactPageContent }) {
  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main>
        <ContactHero hero={content.hero} />
        {content.contactCards.some((card) => !content.hero.info.some((item) => item.icon === card.icon && item.value === card.value)) ? <ContactCards cards={content.contactCards.filter((card) => !content.hero.info.some((item) => item.icon === card.icon && item.value === card.value))} /> : null}
        <ContactForm form={content.form} />
        <MapsSection maps={content.maps} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function ContactPageSkeleton() {
  return (
    <SiteLayout actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }} navigation={skeletonNavigation}>
      <main aria-busy="true" aria-label="Loading contact information" className="bg-white">
        <span className="sr-only">Loading contact information</span>

        <section aria-hidden="true" className="relative overflow-hidden border-b border-[#e7eff3] bg-[#f7fafc]">
          <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[linear-gradient(135deg,#dceef3_0%,#eff7f9_100%)] lg:block" />
          <div className="relative mx-auto grid min-h-[340px] w-full max-w-[1180px] items-center gap-6 px-4 py-8 sm:min-h-[360px] sm:px-6 sm:py-10 lg:grid-cols-[1fr_340px] lg:gap-8 lg:px-8">
            <div className="max-w-[620px] animate-pulse">
              <div className="h-3 w-28 rounded-full bg-[#dcebf0]" />
              <div className="mt-3 h-10 w-[82%] rounded-lg bg-[#d1e6ee] sm:h-11" />
              <div className="mt-4 h-4 w-full max-w-[540px] rounded-full bg-[#e5f0f4]" />
              <div className="mt-2 h-4 w-[72%] rounded-full bg-[#e5f0f4]" />
            </div>
            <div className="hidden rounded-xl border border-[#e1ebef] bg-white p-5 sm:p-6 lg:block">
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, index) => (
                  <div className="flex items-center gap-4" key={index}>
                    <div className="size-[38px] animate-pulse rounded-full bg-[#d9edf2]" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3 w-20 animate-pulse rounded-full bg-[#dcebf0]" />
                      <div className="h-4 w-full max-w-[190px] animate-pulse rounded-full bg-[#e8f1f3]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section aria-hidden="true" className="bg-white py-8 sm:py-10">
          <div className="mx-auto grid w-full max-w-[1180px] gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="flex min-h-[86px] items-center gap-4 rounded-xl border border-[#e1ebef] bg-white p-4 sm:p-5" key={index}>
                <div className="size-[42px] shrink-0 animate-pulse rounded-full bg-[#e0f0f4]" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded-full bg-[#dcebf0]" />
                  <div className="h-4 w-full animate-pulse rounded-full bg-[#e9f1f4]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-hidden="true" className="border-y border-[#e7eff3] bg-[#f7fafc] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-[1180px] rounded-xl border border-[#e1ebef] bg-white px-5 py-8 text-center sm:px-12 sm:py-10">
            <div className="mx-auto h-8 w-60 max-w-full animate-pulse rounded-lg bg-[#d1e6ee] sm:w-72" />
            <div className="mx-auto mt-4 h-4 w-[84%] animate-pulse rounded-full bg-[#edf4f6] sm:w-[62%]" />
            <div className="mx-auto mt-2 h-4 w-[67%] animate-pulse rounded-full bg-[#edf4f6] sm:w-[46%]" />
            <div className="mx-auto mt-6 h-11 w-52 animate-pulse rounded-full bg-[#d9edf2]" />
          </div>
        </section>

        <section aria-hidden="true" className="bg-white py-10 sm:py-12">
          <div className="mx-auto grid w-full max-w-[1180px] gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            {Array.from({ length: 2 }, (_, index) => (
              <div className="overflow-hidden rounded-xl border border-[#e1ebef] bg-white" key={index}>
                <div className="h-[230px] animate-pulse bg-[linear-gradient(135deg,#e1eff3_0%,#f5f9fa_100%)] sm:h-[280px]" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-48 animate-pulse rounded-full bg-[#dcebf0]" />
                  <div className="h-4 w-[82%] animate-pulse rounded-full bg-[#e9f1f4]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

function ContactPageEmpty() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>No content</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">Contact page content is unavailable</h1>
        <p className="mt-3 text-[#6b7280]">Please check the content source and try again.</p>
      </Card>
    </main>
  );
}

function ContactPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">We could not load the contact page</h1>
        <p className="mt-3 text-[#6b7280]">Try again to refresh the contact information.</p>
        <Button className="mt-6" onClick={onRetry} type="button">
          Retry
        </Button>
      </Card>
    </main>
  );
}

function hasContactContent(content: ContactPageContent | undefined): content is ContactPageContent {
  return Boolean(
    content &&
      content.navigation.length > 0 &&
      content.hero.title &&
      content.hero.info.length > 0 &&
      content.contactCards.length > 0 &&
      content.form.services.length > 0 &&
      content.maps.length > 0,
  );
}

export function ContactPage() {
  const { data, isError, isLoading, refetch } = useContactPageQuery();

  if (isLoading) {
    return <ContactPageSkeleton />;
  }

  if (isError) {
    return <ContactPageError onRetry={() => void refetch()} />;
  }

  if (!hasContactContent(data)) {
    return <ContactPageEmpty />;
  }

  return <ContactPageView content={data} />;
}
