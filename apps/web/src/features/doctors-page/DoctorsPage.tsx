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
  { href: '/#about', label: 'About' },
  { href: '/#services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/#branches', label: 'Branches' },
];

function CalendarIcon() {
  return <img alt="" aria-hidden="true" className="size-[14px]" src={asset('hero-calendar.svg')} />;
}

function DoctorsHero({ hero }: { hero: DoctorsPageContent['hero'] }) {
  return (
    <section className="bg-[#f7fafc]">
      <div className="mx-auto w-full max-w-[1280px] px-4 pb-[68px] pt-[100px] text-center sm:px-6 lg:px-0">
        <div className="mx-auto max-w-[650px]">
          <h1 className="text-[34px] font-extrabold leading-[42px] text-[#3695b9] sm:text-[42px] sm:leading-[50px]">
            {hero.title}
          </h1>
          <p className="mt-5 text-[17px] font-medium leading-[27px] text-[#697583]">
            {hero.description}
          </p>
        </div>
      </div>
    </section>
  );
}

function DoctorCard({ doctor }: { doctor: LandingDoctor }) {
  return (
    <a
      aria-label={`View details for ${doctor.name}`}
      className="group block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
      href={doctor.profileHref}
    >
      <Card className="overflow-hidden rounded-lg border-[#e7eef2] shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
        <div className="h-[430px] overflow-hidden bg-[#edf5f8] sm:h-[484px]">
          <img
            alt={doctor.imageAlt}
            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
            src={doctor.imageUrl}
          />
        </div>
        <div className="flex h-[220px] flex-col px-7 py-7">
          <h2 className="text-[19px] font-extrabold leading-7 text-[#005687]">{doctor.name}</h2>
          <p className="mt-4 text-[13px] font-extrabold uppercase leading-5 text-[#3695b9]">{doctor.credential}</p>
          <p className="mt-2 text-[16px] font-medium leading-6 text-[#5f6974]">{doctor.focus}</p>
          <span
            className="mt-auto inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md border-2 border-[#3695B9] bg-white px-4 py-0 text-[13px] font-extrabold text-[#3695B9] transition group-hover:bg-[#f0f9fa] group-hover:text-[#005687]"
        >
            <CalendarIcon />
            {doctor.bookingLabel}
          </span>
        </div>
      </Card>
    </a>
  );
}

function DoctorsGrid({ doctors }: { doctors: LandingDoctor[] }) {
  return (
    <section aria-label="Doctor profiles" className="bg-[#f7fafc] pb-[86px]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-0">
        <div className="grid gap-x-[30px] gap-y-[70px] md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard doctor={doctor} key={doctor.name} />
          ))}
        </div>
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
      <main aria-busy="true" aria-label="Loading doctors page">
        <section className="bg-[#f7fafc]">
          <div className="mx-auto max-w-[650px] px-4 pb-[68px] pt-[100px] sm:px-6">
            <div className="mx-auto h-12 w-full max-w-[430px] animate-pulse rounded-lg bg-[#d6ecf3]" />
            <div className="mx-auto mt-5 h-16 w-full max-w-[620px] animate-pulse rounded-lg bg-[#e8f3f7]" />
          </div>
        </section>
        <section className="bg-[#f7fafc] pb-[86px]">
          <div className="mx-auto grid max-w-[1280px] gap-x-[30px] gap-y-[70px] px-4 sm:px-6 md:grid-cols-2 xl:grid-cols-3 lg:px-0">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="h-[704px] animate-pulse rounded-lg border border-[#edf2f7] bg-white" key={index} />
            ))}
          </div>
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
        <p className="mt-3 text-[#62798b]">Try again to refresh the clinic specialists.</p>
        <Button className="mt-6" onClick={onRetry}>
          Retry
        </Button>
      </Card>
    </main>
  );
}

function hasDoctorsContent(content: DoctorsPageContent | undefined): content is DoctorsPageContent {
  return Boolean(
    content &&
      content.navigation.length > 0 &&
      content.services.length > 0 &&
      content.doctors.length > 0 &&
      content.hero.title,
  );
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
