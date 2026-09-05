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
    <section className="bg-[#f7fafc] pb-8 pt-12 text-center">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <p className="mb-2 text-[12px] font-bold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">
          Our Medical Team
        </p>
        <h1 className="text-[30px] font-extrabold leading-9 text-[#005687] sm:text-[34px] sm:leading-10">
          {hero.title}
        </h1>
        <p className="mx-auto mt-3 max-w-[580px] text-[14px] font-normal leading-6 text-[#6b7280]">
          {hero.description}
        </p>
      </div>
    </section>
  );
}

function DoctorCard({ doctor }: { doctor: LandingDoctor }) {
  return (
    <Card className="overflow-hidden rounded-lg border-[#edf2f7] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(15,23,42,0.08)]">
      <Link
        aria-label={`View profile for ${doctor.name}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
        to={doctor.detail.profileHref}
      >
        {doctor.imageUrl ? <img alt={doctor.imageAlt} className="h-[256px] w-full bg-[#edf5f8] object-cover object-top" src={doctor.imageUrl} /> : <div aria-hidden="true" className="h-[256px] w-full bg-[#edf5f8]" />}
        <div className="flex min-h-[148px] flex-col bg-white p-4">
          <h2 className="text-[15px] font-bold leading-5 text-[#005687]">{doctor.name}</h2>
          <p className="mt-1 text-[12px] font-semibold leading-4 text-[#3695B9]">
            {doctor.credential ?? doctor.specialty}
          </p>
          <p className="mt-2 line-clamp-2 text-[13px] font-normal leading-5 text-[#6b7280]">
            {doctor.focus ?? doctor.specialty}
          </p>
          <span className="mt-3 inline-flex min-h-[36px] items-center justify-center gap-2 rounded-full border border-[#3695B9] px-4 text-center text-[12px] font-bold leading-4 text-[#3695B9] transition hover:bg-[#3695B9] hover:text-white">
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
    <section aria-label="Doctor profiles" className="bg-[#f7fafc] pb-16">
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
        <Badge>No content</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">Doctor profiles are unavailable</h1>
        <p className="mt-3 text-[#6b7280]">Please check the content source and try again.</p>
      </Card>
    </main>
  );
}

function DoctorsPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">We could not load the doctors page</h1>
        <p className="mt-3 text-[#6b7280]">Try again to refresh the doctor profiles.</p>
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
