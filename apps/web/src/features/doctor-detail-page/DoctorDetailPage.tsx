import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { ResilientImage } from '@/components/layout/public-ui';
import type { DoctorDetailContent, LandingDoctor } from '@/features/landing-page/types';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
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
  const { language } = usePublicLanguage();
  const appointmentLabel = language === 'km' ? 'ស្នើសុំការណាត់ជួប' : (doctor.bookingLabel ?? 'Book Appointment');
  const statLabels = language === 'km'
    ? { 'Patient Satisfaction': 'ការពេញចិត្តអ្នកជំងឺ', 'Successful Procedures': 'ករណីព្យាបាល', 'Years Experience': 'ឆ្នាំបទពិសោធន៍' }
    : {};

  return (
    <section className="border-b border-[#e7eff3] bg-[#f7fafc] py-10 sm:py-12">
      <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-center lg:gap-10 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-[#e2edf1] bg-[#edf5f8] shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
          <ResilientImage
            alt={doctor.imageAlt || doctor.name}
            className="h-[300px] w-full object-cover object-[center_18%] sm:h-[360px]"
            fallbackSrc="/assets/landing/hero-clinic.png"
            src={doctor.imageUrl}
          />
        </div>
        <div>
          <p className="text-[11px] font-extrabold uppercase leading-4 tracking-[3px] text-[#3695B9] sm:text-[12px] sm:tracking-[3.6px]">
            {doctor.detail.roleTitle}
          </p>
          <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687] sm:mt-3 sm:text-[38px]">
            {doctor.name}
          </h1>
          <p className="mt-3 max-w-[600px] text-[16px] font-normal leading-7 text-[#64748b]">{doctor.detail.heroSummary}</p>
          {doctor.detail.stats.length > 0 ? (
            <div className={doctor.detail.stats.length === 1 ? 'mt-5 inline-flex overflow-hidden rounded-xl border border-[#dfecef] bg-white' : 'mt-5 grid overflow-hidden rounded-xl border border-[#dfecef] bg-white sm:grid-cols-3'}>
              {doctor.detail.stats.map((stat) => (
                <div className={doctor.detail.stats.length === 1 ? 'px-4 py-3' : 'border-b border-[#e7eff3] px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0'} key={stat.label}>
                  <p className="text-[22px] font-extrabold leading-7 text-[#167ea7]">{stat.value}</p>
                  <p className="mt-0.5 text-[12px] font-semibold leading-4 text-[#64748b]">{statLabels[stat.label as keyof typeof statLabels] ?? stat.label}</p>
                </div>
              ))}
            </div>
          ) : null}
          <Button
            className="mt-5 min-h-12 w-full rounded-full bg-[#3695B9] px-6 text-[14px] font-bold shadow-none hover:bg-[#2c84a5] sm:min-h-11 sm:w-auto"
            icon={<CalendarIcon />}
            onClick={() => navigate('/book-appointment')}
          >
            {appointmentLabel}
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
        <li className="flex items-start gap-3 text-[14px] font-medium leading-6 text-[#64748b]" key={item}>
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#3695B9]" />
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
    <Card className="group relative flex min-h-[92px] gap-3 rounded-xl border-[#e1ebef] bg-white p-4 shadow-none transition-colors hover:border-[#c9e2eb]">
      <EducationIcon index={index} />
      <div className="min-w-0 flex-1 pr-12">
        <h3 className="text-[14px] font-extrabold leading-5 text-[#005687]">{certification.title}</h3>
        <p className="mt-1 text-[13px] font-medium leading-5 text-[#64748b]">{certification.institution}</p>
      </div>
      {certification.yearLabel ? (
        <span className="absolute right-4 top-4 rounded-full bg-[#eef8fb] px-2 py-0.5 text-[11px] font-extrabold leading-4 text-[#167ea7]">
          {certification.yearLabel}
        </span>
      ) : null}
    </Card>
  );
}

function OtherSpecialistCard({ doctor }: { doctor: LandingDoctor }) {
  const hasImage = Boolean(doctor.imageUrl);

  return (
    <Card className="overflow-hidden rounded-xl border-[#e1ebef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cfe4ec] hover:shadow-[0_8px_20px_rgba(15,23,42,0.07)]">
      <Link
        aria-label={`View profile for ${doctor.name}`}
        className={`flex min-h-[156px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9] ${hasImage ? 'sm:block' : 'sm:flex'}`}
        to={doctor.detail.profileHref}
      >
        {hasImage ? <img alt={doctor.imageAlt || doctor.name} className="h-[156px] w-[40%] shrink-0 bg-[#edf5f8] object-cover object-top sm:h-[210px] sm:w-full" src={doctor.imageUrl} /> : null}
        <div className="flex min-w-0 flex-1 flex-col justify-center bg-white p-4">
          <h3 className="text-[14px] font-semibold leading-5 text-[#005687]">{doctor.name}</h3>
          <p className="mt-1 text-[13px] font-medium leading-5 text-[#3695B9]">{doctor.focus ?? doctor.specialty}</p>
        </div>
      </Link>
    </Card>
  );
}

function DoctorDetails({ doctor }: { doctor: LandingDoctor }) {
  const navigate = useNavigate();
  const { language } = usePublicLanguage();
  const copy = language === 'km'
    ? {
      about: 'អំពីទន្តបណ្ឌិត', appointment: 'ស្នើសុំការណាត់ជួប', appointmentBody: `ផ្ញើសំណើ ដើម្បីពិភាក្សាអំពីបញ្ហាមាត់ធ្មេញរបស់អ្នកជាមួយ ${doctor.name}។`, education: 'ការសិក្សា និងការអភិវឌ្ឍវិជ្ជាជីវៈ', expertise: 'ផ្នែកជំនាញ', profile: 'ប្រវត្តិវិជ្ជាជីវៈ', qualifications: 'គុណវុឌ្ឍិ និងវគ្គបណ្តុះបណ្តាល',
    }
    : {
      about: 'About the Doctor', appointment: 'Request an Appointment', appointmentBody: `Send a request to discuss your dental concerns with ${doctor.name}.`, education: 'Education & Professional Development', expertise: 'Clinical Focus', profile: 'Professional Profile', qualifications: 'Qualifications & Training',
    };

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 lg:px-8">
        <div className="min-w-0">
          <section className="rounded-2xl border border-[#e3edf1] bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-[#3695B9]" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#3695B9]">{copy.profile}</p>
            </div>
            <h2 className="mt-3 text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]">{copy.about}</h2>
            <div className="mt-4 max-w-[800px] space-y-4 text-[16px] font-normal leading-7 text-[#526879]">
              {doctor.detail.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#3695B9]">{copy.qualifications}</p>
                <h2 className="mt-2 text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]">{copy.education}</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {doctor.detail.certifications.map((certification, index) => (
                <CertificationCard certification={certification} index={index} key={certification.title} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="overflow-hidden rounded-2xl border-[#dcebf0] bg-[#f8fcfd] p-0 shadow-none">
            <div className="border-b border-[#dcebf0] bg-[#edf8fb] px-5 py-4">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#3695B9]">{copy.profile}</p>
              <h2 className="mt-1 text-[19px] font-extrabold leading-6 text-[#005687]">{copy.expertise}</h2>
            </div>
            <div className="p-5">
              <ExpertiseList items={doctor.detail.services} />
            </div>
          </Card>
          <Card className="rounded-2xl !border-transparent !bg-[#167ea7] p-5 text-white shadow-none">
            <h2 className="text-[18px] font-extrabold leading-6">{copy.appointment}</h2>
            <p className="mt-2 text-[14px] font-normal leading-6 text-white/85">
              {copy.appointmentBody}
            </p>
            <Button
              className="mt-4 min-h-12 w-full rounded-full bg-white text-[14px] font-bold text-[#167ea7] shadow-none hover:bg-[#eef8fb] sm:min-h-11"
              onClick={() => navigate('/book-appointment')}
            >
              {copy.appointment}
            </Button>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function OtherSpecialists({ doctors }: { doctors: LandingDoctor[] }) {
  const { language } = usePublicLanguage();
  if (doctors.length === 0) {
    return null;
  }

  const copy = language === 'km'
    ? { description: 'ស្វែងយល់ពីក្រុមទន្តបណ្ឌិតរបស់យើង។', title: 'ទន្តបណ្ឌិតផ្សេងទៀត' }
    : { description: 'Meet more members of our dental team.', title: 'Other Specialists' };

  return (
    <section className="border-t border-[#e7eff3] bg-[#f7fafc] py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]">{copy.title}</h2>
            <p className="mt-1 text-[14px] font-normal leading-5 text-[#64748b]">
              {copy.description}
            </p>
          </div>
          <div className="hidden gap-2 sm:flex" aria-hidden="true">
            <span className="grid size-8 place-items-center rounded-full border border-[#3695B9] text-[#3695B9]">&lsaquo;</span>
            <span className="grid size-8 place-items-center rounded-full bg-[#3695B9] text-white">&rsaquo;</span>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <main aria-busy="true" aria-label="Loading doctor detail page" className="bg-white">
        <span className="sr-only">Loading doctor profile</span>

        <section aria-hidden="true" className="border-b border-[#e7eff3] bg-[#f7fafc] py-10 sm:py-12">
          <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-center lg:gap-10 lg:px-8">
            <div className="h-[300px] animate-pulse rounded-xl border border-[#e2edf1] bg-[#e3eef2] sm:h-[360px]" />
            <div className="space-y-4">
              <div className="h-3 w-32 animate-pulse rounded-full bg-[#dcebf0]" />
              <div className="h-9 w-64 max-w-full animate-pulse rounded-lg bg-[#d1e6ee] sm:w-80" />
              <div className="space-y-2">
                <div className="h-4 w-full max-w-[580px] animate-pulse rounded-full bg-[#e5f0f4]" />
                <div className="h-4 w-[80%] max-w-[460px] animate-pulse rounded-full bg-[#e5f0f4]" />
              </div>
              <div className="grid overflow-hidden rounded-xl border border-[#dfecef] bg-white sm:grid-cols-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <div className="border-b border-[#e7eff3] px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0" key={index}>
                    <div className="h-5 w-12 animate-pulse rounded-full bg-[#d1e6ee]" />
                    <div className="mt-2 h-3 w-20 animate-pulse rounded-full bg-[#edf4f6]" />
                  </div>
                ))}
              </div>
              <div className="h-11 w-52 animate-pulse rounded-full bg-[#dcebf0]" />
            </div>
          </div>
        </section>

        <section aria-hidden="true" className="bg-white py-10 sm:py-14">
          <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 lg:px-8">
            <div>
              <div className="h-8 w-56 animate-pulse rounded-lg bg-[#d1e6ee] sm:w-72" />
              <div className="mt-5 max-w-[760px] space-y-3">
                <div className="h-4 w-full animate-pulse rounded-full bg-[#edf4f6]" />
                <div className="h-4 w-[94%] animate-pulse rounded-full bg-[#edf4f6]" />
                <div className="h-4 w-[82%] animate-pulse rounded-full bg-[#edf4f6]" />
              </div>
              <div className="mt-9 border-t border-[#e7eff3] pt-8">
                <div className="h-8 w-60 animate-pulse rounded-lg bg-[#d1e6ee] sm:w-80" />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div className="flex min-h-[76px] items-center gap-3 rounded-xl border border-[#e1ebef] bg-white p-4" key={index}>
                      <span className="size-9 animate-pulse rounded-lg bg-[#dcebf0]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 animate-pulse rounded-full bg-[#d1e6ee]" />
                        <div className="h-3 w-full animate-pulse rounded-full bg-[#edf4f6]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <aside className="space-y-4">
              <div className="rounded-xl border border-[#e1ebef] bg-[#f8fcfd] p-5">
                <div className="h-5 w-36 animate-pulse rounded-full bg-[#d1e6ee]" />
                <div className="mt-5 space-y-3">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div className="flex gap-3" key={index}>
                      <span className="mt-1 size-1.5 animate-pulse rounded-full bg-[#dcebf0]" />
                      <div className="h-3 flex-1 animate-pulse rounded-full bg-[#edf4f6]" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-[#167ea7] p-5">
                <div className="h-5 w-44 animate-pulse rounded-full bg-white/45" />
                <div className="mt-4 h-3 w-full animate-pulse rounded-full bg-white/25" />
                <div className="mt-2 h-3 w-4/5 animate-pulse rounded-full bg-white/25" />
                <div className="mt-5 h-11 w-full animate-pulse rounded-full bg-white/70" />
              </div>
            </aside>
          </div>
        </section>

        <section aria-hidden="true" className="border-t border-[#e7eff3] bg-[#f7fafc] py-10 sm:py-12">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="h-8 w-52 animate-pulse rounded-lg bg-[#d1e6ee] sm:w-64" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="flex min-h-[156px] overflow-hidden rounded-xl border border-[#e3edf1] bg-white sm:block sm:h-[276px]" key={index}>
                  <div className="h-[156px] w-[40%] shrink-0 animate-pulse bg-[#e3eef2] sm:h-[210px] sm:w-full" />
                  <div className="flex flex-1 items-center p-4 sm:block">
                    <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#dcebf0]" />
                    <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-[#edf4f6]" />
                  </div>
                </div>
              ))}
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
