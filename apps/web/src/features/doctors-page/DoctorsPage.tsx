import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import type { DoctorsPageContent, LandingDoctor } from '@/features/landing-page/types';
import { useDoctorsPageQuery } from './use-doctors-page';

const asset = (name: string) => `/assets/landing/${name}`;

const skeletonNavigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/branches', label: 'Branches' },
];

function CalendarIcon() {
  return <img alt="" aria-hidden="true" className="size-[14px]" src={asset('hero-calendar.svg')} />;
}

function DoctorsHero({ hero }: { hero: DoctorsPageContent['hero'] }) {
  return (
    <section className="bg-[#f7fafc] pb-[60px] pt-[96px] text-center">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <h1 className="text-[34px] font-extrabold leading-[42px] text-[#3695b9] sm:text-[42px] sm:leading-[50px]">
          {hero.title}
        </h1>
        <p className="mx-auto mt-5 max-w-[650px] text-[17px] font-medium leading-7 text-[#6b7280]">
          {hero.description}
        </p>
      </div>
    </section>
  );
}

function DoctorCard({ doctor }: { doctor: LandingDoctor }) {
  return (
    <Card className="overflow-hidden rounded-lg border-[#edf2f7] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_4px_10px_rgba(15,23,42,0.08)]">
      <Link
        aria-label={`View profile for ${doctor.name}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
        to={doctor.detail.profileHref}
      >
        <img
          alt={doctor.imageAlt}
          className="h-[300px] w-full bg-[#edf5f8] object-cover object-top"
          src={doctor.imageUrl}
        />
        <div className="flex min-h-[174px] flex-col bg-white px-5 py-5">
          <h2 className="text-[17px] font-extrabold leading-6 text-[#0c2243]">{doctor.name}</h2>
          {doctor.credential ? (
            <p className="mt-3 text-[11px] font-extrabold uppercase leading-4 text-[#3695b9]">
              {doctor.credential}
            </p>
          ) : null}
          <p className="mt-2 text-[14px] font-medium leading-5 text-[#6b7280]">{doctor.focus ?? doctor.specialty}</p>
          <span className="mt-auto inline-flex min-h-[38px] items-center justify-center gap-2 rounded-md border-2 border-[#3695b9] px-3 text-center text-[11px] font-extrabold leading-4 text-[#3695b9]">
            <CalendarIcon />
            {doctor.bookingLabel ?? `Book with ${doctor.name}`}
          </span>
        </div>
      </Link>
    </Card>
  );
}

function DoctorsGrid({ doctors }: { doctors: LandingDoctor[] }) {
  return (
    <section aria-label="Doctor profiles" className="bg-[#f7fafc] pb-[86px]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-x-6 gap-y-12 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
        {doctors.map((doctor) => (
          <DoctorCard doctor={doctor} key={doctor.detail.profileHref} />
        ))}
      </div>
    </section>
  );
}

function DoctorsPageView({ content }: { content: DoctorsPageContent }) {
  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main>
        <DoctorsHero hero={content.hero} />
        <DoctorsGrid doctors={content.doctors} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function DoctorsPageSkeleton() {
  return (
    <SiteLayout actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }} navigation={skeletonNavigation}>
      <main aria-busy="true" aria-label="Loading doctors page" className="bg-[#f7fafc]">
        <section className="pb-[60px] pt-[96px]">
          <div className="mx-auto max-w-[650px] px-4 text-center">
            <div className="mx-auto h-12 w-96 max-w-full animate-pulse rounded bg-[#d6ecf3]" />
            <div className="mx-auto mt-5 h-16 w-full animate-pulse rounded bg-[#e8f3f7]" />
          </div>
        </section>
        <section className="mx-auto grid max-w-[1280px] gap-x-6 gap-y-12 px-4 pb-[86px] sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-0 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="h-[474px] animate-pulse rounded-lg bg-[#e8f3f7]" key={index} />
          ))}
        </section>
      </main>
    </SiteLayout>
  );
}

function DoctorsPageEmpty() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>No doctors</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#075a82]">Doctor profiles are unavailable</h1>
        <p className="mt-3 text-[#62798b]">Please check the content source and try again.</p>
      </Card>
    </main>
  );
}

function DoctorsPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#075a82]">We could not load the doctors page</h1>
        <p className="mt-3 text-[#62798b]">Try again to refresh the doctor profiles.</p>
        <Button className="mt-6" onClick={onRetry} type="button">
          Retry
        </Button>
      </Card>
    </main>
  );
}

function hasDoctorsContent(content: DoctorsPageContent | undefined): content is DoctorsPageContent {
  return Boolean(content && content.navigation.length > 0 && content.hero.title && content.doctors.length > 0);
}

export function DoctorsPage() {
  const { data, isError, isLoading, refetch } = useDoctorsPageQuery();

  if (isLoading) {
    return <DoctorsPageSkeleton />;
  }

  if (isError) {
    return <DoctorsPageError onRetry={() => void refetch()} />;
  }

  if (!hasDoctorsContent(data)) {
    return <DoctorsPageEmpty />;
  }

  return <DoctorsPageView content={data} />;
}
