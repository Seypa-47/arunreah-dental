import { Link, useNavigate, useParams } from 'react-router-dom';
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
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/branches', label: 'Branches' },
];

function CalendarIcon() {
  return <img alt="" aria-hidden="true" className="size-[14px]" src={asset('hero-calendar.svg')} />;
}

function PhoneIcon() {
  return <img alt="" aria-hidden="true" className="size-[14px]" src={asset('hero-phone.svg')} />;
}

function EducationIcon({ index }: { index: number }) {
  const icons = ['service-icon-general.svg', 'service-icon-implant.svg', 'service-icon-orthodontic.svg', 'service-icon-root-canal.svg'];
  const icon = icons[index % icons.length] ?? 'service-icon-general.svg';

  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#f0f7fa]">
      <img alt="" aria-hidden="true" className="max-h-[18px] max-w-[18px]" src={asset(icon)} />
    </span>
  );
}

function DoctorHero({ doctor }: { doctor: LandingDoctor }) {
  const navigate = useNavigate();

  return (
    <section className="bg-white pb-[58px] pt-[52px]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-4 sm:px-6 lg:grid-cols-[390px_1fr] lg:items-center lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-[#edf2f7] bg-[#edf5f8] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
          <img alt={doctor.imageAlt} className="h-[448px] w-full object-cover object-top" src={doctor.imageUrl} />
        </div>
        <div>
          <p className="text-[12px] font-extrabold uppercase leading-5 tracking-[0.6px] text-[#3695b9]">
            {doctor.detail.roleTitle}
          </p>
          <h1 className="mt-3 text-[34px] font-extrabold leading-[42px] text-[#005687] sm:text-[42px] sm:leading-[50px]">
            {doctor.name}
          </h1>
          <p className="mt-3 max-w-[520px] text-[16px] font-medium leading-7 text-[#6b7280]">{doctor.detail.heroSummary}</p>
          <div className="mt-5 grid gap-4 border-y border-[#edf2f7] py-6 sm:grid-cols-3">
            {doctor.detail.stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-[26px] font-extrabold leading-8 text-[#3695b9]">{stat.value}</p>
                <p className="mt-1 text-[12px] font-semibold leading-4 text-[#6b7280]">{stat.label}</p>
              </div>
            ))}
          </div>
          <Button
            className="mt-6 min-h-[44px] rounded-md bg-[#3695b9] px-6 text-[14px] font-extrabold shadow-[0_8px_16px_rgba(54,149,185,0.18)] hover:bg-[#2f8fb0]"
            icon={<CalendarIcon />}
            onClick={() => navigate('/book-appointment')}
          >
            {doctor.bookingLabel ?? 'Book Appointment'}
          </Button>
        </div>
      </div>
    </section>
  );
}

function ExpertiseList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item) => (
        <li className="flex items-start gap-3 text-[14px] font-medium leading-6 text-[#6b7280]" key={item}>
          <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-[#3695b9]" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function CertificationCard({
  certification,
  index,
}: {
  certification: LandingDoctor['detail']['certifications'][number];
  index: number;
}) {
  return (
    <Card className="flex min-h-[78px] items-center gap-4 rounded-lg border-[#edf2f7] bg-white p-4 shadow-none">
      <EducationIcon index={index} />
      <div>
        <h3 className="text-[13px] font-extrabold leading-5 text-[#005687]">{certification.title}</h3>
        <p className="text-[12px] font-medium leading-5 text-[#6b7280]">{certification.institution}</p>
      </div>
    </Card>
  );
}

function OtherSpecialistCard({ doctor }: { doctor: LandingDoctor }) {
  return (
    <Card className="overflow-hidden rounded-lg border-[#edf2f7] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition hover:shadow-[0_4px_10px_rgba(15,23,42,0.08)]">
      <Link
        aria-label={`View profile for ${doctor.name}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
        to={doctor.detail.profileHref}
      >
        <img alt={doctor.imageAlt} className="h-[186px] w-full bg-[#edf5f8] object-cover object-top" src={doctor.imageUrl} />
        <div className="bg-white px-4 py-3">
          <h3 className="text-[13px] font-extrabold leading-5 text-[#005687]">{doctor.name}</h3>
          <p className="mt-1 text-[12px] font-semibold leading-4 text-[#3695B9]">{doctor.focus ?? doctor.specialty}</p>
        </div>
      </Link>
    </Card>
  );
}

function DoctorDetails({ doctor }: { doctor: LandingDoctor }) {
  const navigate = useNavigate();

  return (
    <section className="bg-[#f7fafc] pb-[62px] pt-[54px]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_310px] lg:px-8">
        <div>
          <section>
            <h2 className="text-[26px] font-extrabold leading-8 text-[#005687]">About the Doctor</h2>
            <div className="mt-6 space-y-5 text-[15px] font-medium leading-7 text-[#6b7280]">
              {doctor.detail.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-[26px] font-extrabold leading-8 text-[#005687]">Education & Certifications</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {doctor.detail.certifications.map((certification, index) => (
                <CertificationCard certification={certification} index={index} key={certification.title} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-7">
          <Card className="rounded-2xl border-[#edf2f7] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <h2 className="text-[20px] font-extrabold leading-7 text-[#005687]">Areas of Expertise</h2>
            <ExpertiseList items={doctor.detail.services} />
          </Card>
          <Card className="rounded-2xl !border-transparent !bg-[#3695B9] p-6 text-white shadow-[0_12px_24px_rgba(54,149,185,0.20)]">
            <h2 className="text-[20px] font-extrabold leading-7">Schedule an Appointment</h2>
            <p className="mt-4 text-[13px] font-medium leading-5 text-white/75">
              Select a convenient time for your consultation with {doctor.name}.
            </p>
            <Button
              className="mt-6 min-h-[42px] w-full rounded-lg bg-white text-[13px] font-extrabold text-[#3695B9] hover:bg-[#eef8fb]"
              onClick={() => navigate('/book-appointment')}
            >
              Book Now
            </Button>
            <a
              className="mt-5 flex items-center justify-center gap-2 text-[13px] font-bold leading-5 text-white/85 hover:underline"
              href="tel:+85523456789"
            >
              <PhoneIcon />
              +855 23 456 789
            </a>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function OtherSpecialists({ doctors }: { doctors: LandingDoctor[] }) {
  if (doctors.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#f7fafc] pb-[78px] pt-[54px]">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[28px] font-extrabold leading-9 text-[#005687]">Other Specialists</h2>
            <p className="mt-3 text-[15px] font-medium leading-6 text-[#6b7280]">
              Meet our team of highly qualified dental experts.
            </p>
          </div>
          <div className="hidden gap-3 sm:flex" aria-hidden="true">
            <span className="grid size-9 place-items-center rounded-full border border-[#3695b9] text-[#3695b9]">&lsaquo;</span>
            <span className="grid size-9 place-items-center rounded-full bg-[#3695b9] text-white">&rsaquo;</span>
          </div>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((doctor) => (
            <OtherSpecialistCard doctor={doctor} key={doctor.detail.profileHref} />
          ))}
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
        <OtherSpecialists doctors={content.otherDoctors} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function DoctorDetailSkeleton() {
  return (
    <SiteLayout actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }} navigation={skeletonNavigation}>
      <main aria-busy="true" aria-label="Loading doctor detail page">
        <section className="bg-[#f7fafc] py-[52px]">
          <div className="mx-auto grid max-w-[1280px] gap-8 px-4 sm:px-6 lg:grid-cols-[390px_1fr] lg:px-8">
            <div className="h-[448px] animate-pulse rounded-lg bg-[#d6ecf3]" />
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
        <Badge>No doctor</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">Doctor profile is unavailable</h1>
        <p className="mt-3 text-[#6b7280]">Please return to the doctors page and choose another profile.</p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3695B9] px-5 text-sm font-extrabold text-white hover:bg-[#2c84a5]"
          to="/doctors"
        >
          View All Doctors
        </Link>
      </Card>
    </main>
  );
}

function DoctorDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">We could not load this doctor profile</h1>
        <p className="mt-3 text-[#6b7280]">Try again to refresh the profile information.</p>
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
