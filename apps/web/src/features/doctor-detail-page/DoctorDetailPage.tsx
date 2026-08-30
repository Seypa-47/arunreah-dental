import { useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import type { DoctorDetailContent, LandingDoctor } from '@/features/landing-page/types';
import { useDoctorDetailPageQuery } from './use-doctor-detail-page';

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

function DoctorHero({ doctor }: { doctor: LandingDoctor }) {
  return (
    <section className="bg-[#f7fafc] pb-[72px] pt-[64px]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 sm:px-6 lg:grid-cols-[490px_1fr] lg:items-center lg:px-0">
        <div className="overflow-hidden rounded-lg border border-[#e7eef2] bg-[#edf5f8] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
          <img alt={doctor.imageAlt} className="h-[560px] w-full object-cover object-top" src={doctor.imageUrl} />
        </div>
        <div>
          <a
            className="mb-8 inline-flex text-[14px] font-bold leading-5 text-[#3695b9] transition hover:text-[#005687] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
            href="/doctors"
          >
            Back to doctors
          </a>
          <p className="text-[13px] font-extrabold uppercase leading-5 tracking-[0.6px] text-[#3695b9]">
            {doctor.credential}
          </p>
          <h1 className="mt-4 text-[40px] font-extrabold leading-[48px] text-[#005687] sm:text-[52px] sm:leading-[60px]">
            {doctor.name}
          </h1>
          <p className="mt-5 text-[22px] font-semibold leading-8 text-[#334155]">{doctor.focus}</p>
          <p className="mt-5 max-w-[590px] text-[16px] font-medium leading-8 text-[#64748b]">
            {doctor.detail.pageDescription}
          </p>
          <Button
            className="mt-8 min-h-[50px] rounded-md bg-[#3695b9] px-8 text-[15px] font-extrabold shadow-[0_10px_20px_rgba(54,149,185,0.22)] hover:bg-[#2f8fb0]"
            icon={<CalendarIcon />}
          >
            {doctor.bookingLabel ?? 'Book Appointment'}
          </Button>
        </div>
      </div>
    </section>
  );
}

function DetailList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item) => (
        <li className="flex items-start gap-3 text-[15px] font-medium leading-6 text-[#475569]" key={item}>
          <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-[#3695b9]" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function DoctorDetails({ doctor }: { doctor: LandingDoctor }) {
  return (
    <section className="bg-white pb-[76px] pt-[68px]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_410px] lg:px-0">
        <Card className="rounded-lg border-[#e7eef2] p-8 shadow-[0_1px_2px_rgba(15,23,42,0.06)] sm:p-10">
          <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[3.2px] text-[#3695b9]">Profile</p>
          <h2 className="mt-3 text-[30px] font-extrabold leading-9 text-[#005687]">About {doctor.name}</h2>
          <p className="mt-6 text-[16px] font-normal leading-8 text-[#5f6974]">{doctor.detail.biography}</p>
        </Card>
        <div className="space-y-8">
          <Card className="rounded-lg border-[#e7eef2] p-8 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <h2 className="text-[22px] font-extrabold leading-8 text-[#005687]">Education</h2>
            <DetailList items={doctor.detail.education} />
          </Card>
          <Card className="rounded-lg border-[#e7eef2] p-8 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <h2 className="text-[22px] font-extrabold leading-8 text-[#005687]">Expertise</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {doctor.detail.services.map((service) => (
                <Badge className="rounded-full bg-[#f0f9fa] px-3 py-1 text-[12px] font-extrabold text-[#005687]" key={service}>
                  {service}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function DoctorDetailView({ content }: { content: DoctorDetailContent & { doctor: LandingDoctor } }) {
  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main>
        <DoctorHero doctor={content.doctor} />
        <DoctorDetails doctor={content.doctor} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function DoctorDetailSkeleton() {
  return (
    <SiteLayout actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }} navigation={skeletonNavigation}>
      <main aria-busy="true" aria-label="Loading doctor detail page">
        <section className="bg-[#f7fafc] py-[64px]">
          <div className="mx-auto grid max-w-[1280px] gap-10 px-4 sm:px-6 lg:grid-cols-[490px_1fr] lg:px-0">
            <div className="h-[560px] animate-pulse rounded-lg bg-[#d6ecf3]" />
            <div className="py-10">
              <div className="h-5 w-48 animate-pulse rounded bg-[#d6ecf3]" />
              <div className="mt-5 h-16 w-full max-w-[420px] animate-pulse rounded bg-[#d6ecf3]" />
              <div className="mt-6 h-32 w-full max-w-[590px] animate-pulse rounded bg-[#e8f3f7]" />
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

function DoctorDetailEmpty() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>No profile</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#075a82]">Doctor profile is unavailable</h1>
        <p className="mt-3 text-[#62798b]">Please return to the doctors page and choose another profile.</p>
      </Card>
    </main>
  );
}

function DoctorDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#075a82]">We could not load this doctor profile</h1>
        <p className="mt-3 text-[#62798b]">Try again to refresh the profile information.</p>
        <Button className="mt-6" onClick={onRetry}>
          Retry
        </Button>
      </Card>
    </main>
  );
}

export function DoctorDetailPage() {
  const { doctorSlug } = useParams();
  const { data, isError, isLoading, refetch } = useDoctorDetailPageQuery(doctorSlug);

  if (isLoading) {
    return <DoctorDetailSkeleton />;
  }

  if (isError) {
    return <DoctorDetailError onRetry={() => void refetch()} />;
  }

  if (!data?.doctor) {
    return <DoctorDetailEmpty />;
  }

  return <DoctorDetailView content={{ ...data, doctor: data.doctor }} />;
}
