import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { ContentBlocks, ResilientImage } from '@/components/layout/public-ui';
import { DoctorCard } from '@/features/doctors-page/DoctorsPage';
import type { DoctorDetailContent, LandingDoctor } from '@/features/landing-page/types';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { publicUiCopy } from '@/features/public-content/public-ui-copy';
import { isPublicNotFoundError } from '@/features/public-content/public-errors';
import { usePublicDocumentTitle } from '@/features/public-content/public-document-title';
import { publicShell } from '@/features/public-content/public-page-chrome';
import { useDoctorDetailPageQuery } from './use-doctor-detail-page';

const asset = (name: string) => `/assets/landing/${name}`;

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="size-4 shrink-0" fill="currentColor" viewBox="0 0 14 16">
      <path d="M4 0C4.41563 0 4.75 0.334375 4.75 0.75V2H9.25V0.75C9.25 0.334375 9.58437 0 10 0C10.4156 0 10.75 0.334375 10.75 0.75V2H12C13.1031 2 14 2.89688 14 4V14C14 15.1031 13.1031 16 12 16H2C0.896875 16 0 15.1031 0 14V4C0 2.89688 0.896875 2 2 2H3.25V0.75C3.25 0.334375 3.58437 0 4 0ZM12.5 6H1.5V14C1.5 14.275 1.725 14.5 2 14.5H12C12.275 14.5 12.5 14.275 12.5 14V6ZM10.2812 9.28125L6.78125 12.7812C6.4875 13.075 6.0125 13.075 5.72188 12.7812L3.72187 10.7812C3.42812 10.4875 3.42812 10.0125 3.72187 9.72188C4.01562 9.43125 4.49062 9.42813 4.78125 9.72188L6.25 11.1906L9.21875 8.22188C9.5125 7.92813 9.9875 7.92813 10.2781 8.22188C10.5687 8.51563 10.5719 8.99062 10.2781 9.28125H10.2812Z" />
    </svg>
  );
}

function ExperienceBadgeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="8.5" r="5.5" />
      <path d="M9.75 8.5 11.25 10l3-3" />
      <path d="M8.5 13.2 7 21l5-2.6L17 21l-1.5-7.8" />
    </svg>
  );
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
  const detailCopy = publicUiCopy(language).doctorDetail;
  const appointmentLabel = language === 'km' ? 'ស្នើសុំការណាត់ជួប' : (doctor.bookingLabel ?? 'Book Appointment');
  const statLabels = language === 'km'
    ? { 'Patient Satisfaction': 'ការពេញចិត្តអ្នកជំងឺ', 'Successful Procedures': 'ករណីព្យាបាល', 'Years Experience': 'ឆ្នាំបទពិសោធន៍' }
    : {};
  const singleStat = doctor.detail.stats.length === 1 ? doctor.detail.stats[0] : null;
  const bookHref = doctor.id ? `/book-appointment?doctor=${encodeURIComponent(doctor.id)}` : '/book-appointment';

  return (
    <section className="border-b border-[#e7eff3] bg-[#f7fafc] py-10 sm:py-12">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Link
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#3695B9] transition hover:text-[#005687] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
          to="/doctors"
        >
          <span aria-hidden="true">←</span>
          <span>{detailCopy.backToDoctors}</span>
        </Link>
      </div>
      <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-center lg:gap-10 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-[#e2edf1] bg-[#edf5f8] shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
          <ResilientImage
            alt={doctor.imageAlt || doctor.name}
            className="h-[300px] w-full object-cover sm:h-[360px]"
            fallbackSrc="/assets/landing/hero-clinic.png"
            presentation={doctor.imagePresentation ?? { positionX: 50, positionY: 0, zoom: 1 }}
            src={doctor.imageUrl}
          />
        </div>
        <div>
          <p className="ui-eyebrow text-[11px] font-extrabold uppercase leading-4 tracking-[0.06em] text-[#3695B9] sm:text-[12px]">
            {doctor.detail.roleTitle}
          </p>
          <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687] sm:mt-3 sm:text-[38px]">
            {doctor.name}
          </h1>
          <p className="mt-3 max-w-[600px] text-[16px] font-normal leading-7 text-[#64748b]">{doctor.detail.heroSummary}</p>
          { doctor.detail.stats.length > 1 ? (
            <div className="mt-6 grid overflow-hidden rounded-xl border border-[#dfecef] bg-white shadow-[0_2px_10px_rgba(7,93,131,0.04)] sm:grid-cols-3">
              {doctor.detail.stats.map((stat) => (
                <div className="border-b border-[#e7eff3] px-4 py-3.5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0" key={stat.label}>
                  <p className="text-[22px] font-extrabold leading-7 text-[#167ea7]">{stat.value}</p>
                  <p className="mt-0.5 text-[12px] font-semibold leading-4 text-[#64748b]">{statLabels[stat.label as keyof typeof statLabels] ?? stat.label}</p>
                </div>
              ))}
            </div>
          ) : null }
          <div className="mt-6 flex flex-col items-stretch gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            {singleStat ? (
              <div className="inline-flex min-h-[52px] items-center gap-3.5 self-start rounded-full border border-[#d4e7ef] bg-white py-2 pl-2.5 pr-5 shadow-[0_2px_10px_rgba(7,93,131,0.06)]">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#edf8fb] text-[#168aad]">
                  <ExperienceBadgeIcon />
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[20px] font-extrabold leading-none tracking-[-0.02em] text-[#005687]">
                    {singleStat.value}
                  </span>
                  <span className="text-[13px] font-bold leading-4 text-[#526879]">
                    {statLabels[singleStat.label as keyof typeof statLabels] ?? singleStat.label}
                  </span>
                </div>
              </div>
            ) : null}
            <Button
              className="min-h-[52px] w-full rounded-full bg-[#168aad] px-7 text-[15px] font-bold text-white shadow-[0_8px_18px_rgba(22,138,173,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0d7596] hover:shadow-[0_10px_22px_rgba(22,138,173,0.28)] active:translate-y-0 sm:w-auto"
              icon={<CalendarIcon />}
              onClick={() => navigate(bookHref)}
            >
              {appointmentLabel}
            </Button>
          </div>
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

function DoctorDetails({ doctor }: { doctor: LandingDoctor }) {
  const navigate = useNavigate();
  const { language } = usePublicLanguage();
  const copy = language === 'km'
    ? {
      about: 'អំពីទន្តបណ្ឌិត', appointment: 'ស្នើសុំការណាត់ជួប', appointmentBody: `ផ្ញើសំណើ ដើម្បីពិភាក្សាអំពីបញ្ហាមាត់ធ្មេញរបស់អ្នកជាមួយ ${doctor.name}។`, bookAppointment: 'កក់ការណាត់ជួប', education: 'ការសិក្សា និងការអភិវឌ្ឍវិជ្ជាជីវៈ', expertise: 'ផ្នែកជំនាញ', profile: 'ប្រវត្តិវិជ្ជាជីវៈ', qualifications: 'គុណវុឌ្ឍិ និងវគ្គបណ្តុះបណ្តាល',
    }
    : {
      about: 'About the Doctor', appointment: 'Request an Appointment', appointmentBody: `Send a request to discuss your dental concerns with ${doctor.name}.`, bookAppointment: 'Book Appointment', education: 'Education & Professional Development', expertise: 'Clinical Focus', profile: 'Professional Profile', qualifications: 'Qualifications & Training',
    };

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 lg:px-8">
        <div className="min-w-0">
          <section className="rounded-2xl border border-[#e3edf1] bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-[#3695B9]" />
              <p className="ui-eyebrow text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#3695B9]">{copy.profile}</p>
            </div>
            <h2 className="mt-3 text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]">{copy.about}</h2>
            <ContentBlocks
              className="mt-4 max-w-[800px] space-y-4 text-[16px] font-normal leading-7 text-[#526879]"
              value={doctor.detail.about.join('\n\n')}
            />
          </section>

          {doctor.detail.certifications.length > 0 ? (
            <section className="mt-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="ui-eyebrow text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#3695B9]">{copy.qualifications}</p>
                  <h2 className="mt-2 text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]">{copy.education}</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {doctor.detail.certifications.map((certification, index) => (
                  <CertificationCard certification={certification} index={index} key={certification.title} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {doctor.detail.services.length > 0 ? (
            <Card className="overflow-hidden rounded-2xl border-[#dcebf0] bg-[#f8fcfd] p-0 shadow-none">
              <div className="border-b border-[#dcebf0] bg-[#edf8fb] px-5 py-4">
                <p className="ui-eyebrow text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#3695B9]">{copy.profile}</p>
                <h2 className="mt-1 text-[19px] font-extrabold leading-6 text-[#005687]">{copy.expertise}</h2>
              </div>
              <div className="p-5">
                <ExpertiseList items={doctor.detail.services} />
              </div>
            </Card>
          ) : null}
          <Card className="rounded-2xl !border-transparent !bg-[#167ea7] p-5 text-white shadow-none">
            <h2 className="text-[18px] font-extrabold leading-6">{copy.appointment}</h2>
            <p className="mt-2 text-[14px] font-normal leading-6 text-white/85">
              {copy.appointmentBody}
            </p>
            <Button
              className="mt-4 min-h-12 w-full rounded-full border-none !bg-white text-[14px] font-bold !text-[#167ea7] shadow-none hover:!bg-[#eef8fb] sm:min-h-11"
              onClick={() => navigate(doctor.id ? `/book-appointment?doctor=${encodeURIComponent(doctor.id)}` : '/book-appointment')}
              variant="secondary"
            >
              {copy.bookAppointment}
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
        </div>
        <div className="mt-6 grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {doctors.map((doctor) => (
            <DoctorCard doctor={doctor} key={doctor.detail.profileHref} />
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
  const { language } = usePublicLanguage();
  const shell = publicShell(language);
  const copy = publicUiCopy(language).doctorDetail;
  return (
    <SiteLayout actions={shell.actions} navigation={shell.navigation}>
      <main aria-busy="true" aria-label={copy.loading} className="bg-white">
        <span className="sr-only">{copy.loading}</span>

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
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language);
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>{copy.doctorDetail.noDoctor}</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">{copy.doctorDetail.unavailableTitle}</h1>
        <p className="mt-3 text-[#6b7280]">{copy.doctorDetail.unavailableBody}</p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3695B9] px-5 text-sm font-extrabold text-white hover:bg-[#2c84a5]"
          to="/doctors"
        >
          {copy.doctorDetail.viewAllDoctors}
        </Link>
      </Card>
    </main>
  );
}

function DoctorDetailError({ onRetry }: { onRetry: () => void }) {
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language);
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">{copy.common.error}</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">{copy.doctorDetail.errorTitle}</h1>
        <p className="mt-3 text-[#6b7280]">{copy.doctorDetail.errorBody}</p>
        <Button className="mt-6" onClick={onRetry}>
          {copy.common.retry}
        </Button>
      </Card>
    </main>
  );
}

export function DoctorDetailPage() {
  const { doctorSlug } = useParams();
  const { data, error, isError, isLoading, refetch } = useDoctorDetailPageQuery(doctorSlug);
  const { language } = usePublicLanguage();
  usePublicDocumentTitle(data?.doctor?.name ?? (language === 'km' ? 'ទន្តបណ្ឌិត' : 'Doctor'));

  if (isLoading) {
    return <DoctorDetailSkeleton />;
  }

  if (isError && isPublicNotFoundError(error)) {
    return <DoctorDetailEmpty />;
  }

  if (isError) {
    return <DoctorDetailError onRetry={() => void refetch()} />;
  }

  if (!data?.doctor) {
    return <DoctorDetailEmpty />;
  }

  return <DoctorDetailView content={{ ...data, doctor: data.doctor }} />;
}
