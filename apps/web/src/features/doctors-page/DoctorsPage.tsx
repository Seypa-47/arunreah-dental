import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { ResilientImage } from '@/components/layout/public-ui';
import type { DoctorsPageContent, LandingDoctor } from '@/features/landing-page/types';
import { useDoctorsPageQuery } from './use-doctors-page';
import { getPublicMediaUrl } from '@/services/media';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';

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

function DoctorsHero({ hero, heroMedia }: { hero: DoctorsPageContent['hero']; heroMedia?: DoctorsPageContent['heroMedia'] }) {
  const { language } = usePublicLanguage();
  const imageUrl = heroMedia ? getPublicMediaUrl(heroMedia.imageKey) : null;
  const fallbackImageUrl = '/assets/landing/hero-clinic.png';
  const title = heroMedia?.title ?? hero.title;
  const description = heroMedia?.body ?? hero.description;
  const eyebrow = language === 'km' ? 'ក្រុមទន្តបណ្ឌិតរបស់យើង' : 'Our dental team';

  return (
    <section className="border-b border-[#dceaf0] bg-[#f7fafc] py-5 sm:py-7">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[330px] overflow-hidden rounded-2xl border border-[#d9e9ee] bg-[#063e5c] sm:min-h-[430px]">
          <ResilientImage alt="Arunreah Dental Clinic team" className="absolute inset-0 h-full w-full object-cover object-center" fallbackSrc={fallbackImageUrl} src={imageUrl} />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,52,78,0.88)_0%,rgba(5,52,78,0.61)_48%,rgba(5,52,78,0.08)_100%)]" />
          <div className="relative z-10 flex min-h-[330px] max-w-[690px] items-end p-6 sm:min-h-[430px] sm:p-10 lg:p-12">
            <div>
              <p className="text-[11px] font-bold uppercase leading-4 tracking-[3px] text-[#b7e7f4] sm:text-[12px] sm:tracking-[3.6px]">
                {eyebrow}
              </p>
              <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-[-0.035em] text-white sm:text-[42px]">
                {title}
              </h1>
              <p className="mt-3 max-w-[600px] text-[15px] font-normal leading-6 text-[#e6f6fa] sm:text-[16px] sm:leading-7">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DoctorCard({ doctor }: { doctor: LandingDoctor }) {
  const hasImage = Boolean(doctor.imageUrl);

  return (
    <Card className="overflow-hidden rounded-xl border-[#e6edf1] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-[#cfe4ec] hover:shadow-[0_8px_20px_rgba(15,23,42,0.07)]">
      <Link
        aria-label={`View profile for ${doctor.name}`}
        className={`group flex min-h-[196px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9] ${hasImage ? 'sm:block' : 'sm:flex'}`}
        to={doctor.detail.profileHref}
      >
        {hasImage ? <img alt={doctor.imageAlt || doctor.name} className="h-[196px] w-[42%] shrink-0 bg-[#edf5f8] object-cover object-top sm:h-[236px] sm:w-full" src={doctor.imageUrl} /> : null}
        <div className="flex min-w-0 flex-1 flex-col bg-white p-4 sm:min-h-[156px] sm:p-5">
          <h3 className="text-[15px] font-bold leading-5 text-[#005687] sm:text-[16px]">{doctor.name}</h3>
          <p className="mt-1 text-[12px] font-semibold leading-4 text-[#3695B9] sm:text-[13px]">
            {doctor.credential ?? doctor.specialty}
          </p>
          <p className="mt-2 line-clamp-2 text-[13px] font-normal leading-5 text-[#64748b]">
            {doctor.focus ?? doctor.specialty}
          </p>
          <span className="mt-auto inline-flex min-h-9 items-center justify-center gap-2 pt-3 text-left text-[12px] font-bold leading-4 text-[#167ea7] transition group-hover:text-[#005687] sm:mt-3 sm:min-h-0 sm:justify-start sm:pt-0">
            <CalendarIcon />
            {doctor.bookingLabel ?? `Book with ${doctor.name}`}
          </span>
        </div>
      </Link>
    </Card>
  );
}

function DoctorsGrid({ doctors }: { doctors: LandingDoctor[] }) {
  const { language } = usePublicLanguage();
  const copy = language === 'km'
    ? { eyebrow: 'ជួបជាមួយក្រុមរបស់យើង', title: 'ក្រុមទន្តបណ្ឌិតដែលយកចិត្តទុកដាក់ស្តាប់អ្នកជាមុន', body: 'ស្វែងយល់ពីប្រវត្តិ ជំនាញ និងវិធីសាស្ត្រថែទាំអ្នកជំងឺរបស់ទន្តបណ្ឌិតនីមួយៗ។' }
    : { eyebrow: 'Meet the team', title: 'Professionals who listen first', body: 'Explore each profile to learn about their background, areas of practice, and approach to patient care.' };
  return (
    <section aria-label="Doctor profiles" className="bg-white py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-[650px] sm:mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#3695B9] sm:text-[12px] sm:tracking-[3.6px]">{copy.eyebrow}</p>
          <h2 className="mt-2 text-[27px] font-extrabold tracking-[-0.035em] text-[#073f60] sm:text-[34px]">{copy.title}</h2>
          <p className="mt-2 text-[15px] leading-6 text-[#64748b]">{copy.body}</p>
        </div>
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {doctors.map((doctor) => (
            <DoctorCard doctor={doctor} key={doctor.detail.profileHref} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PatientFirstApproach({ items }: { items: NonNullable<DoctorsPageContent['patientEducation']> }) {
  const { language } = usePublicLanguage();
  if (items.length === 0) return null;
  const copy = language === 'km' ? { eyebrow: 'ការថែទាំដោយផ្តោតលើអ្នកជំងឺ', title: 'ការថែទាំចាប់ផ្តើមពីការណែនាំច្បាស់លាស់' } : { eyebrow: 'Patient-first approach', title: 'Care begins with clear guidance' };
  return <section className="border-t border-[#e7eff3] bg-[#f7fafc] py-12 sm:py-16"><div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8"><div className="max-w-[640px]"><p className="text-[12px] font-bold uppercase tracking-[3.6px] text-[#3695B9]">{copy.eyebrow}</p><h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.035em] text-[#073f60] sm:text-[34px]">{copy.title}</h2></div><div className={`mt-7 grid gap-5 ${items.length === 1 ? 'max-w-[840px] md:grid-cols-[0.78fr_1.22fr]' : 'sm:grid-cols-2'}`}>{items.map((item) => { const imageUrl = getPublicMediaUrl(item.imageKey); return <article className={`overflow-hidden rounded-xl border border-[#dce9ee] bg-white ${items.length === 1 ? 'md:contents' : ''}`} key={item.id}>{imageUrl ? <img alt={item.title ?? ''} className="h-[280px] w-full rounded-t-xl object-cover object-center md:rounded-xl" src={imageUrl} /> : null}<div className={`p-5 sm:p-6 ${items.length === 1 ? 'rounded-b-xl border border-t-0 border-[#dce9ee] bg-white md:rounded-xl md:border' : ''}`}>{item.title ? <h3 className="text-[19px] font-bold text-[#073f60]">{item.title}</h3> : null}{item.body ? <p className="mt-2 text-[15px] leading-6 text-[#607486]">{item.body}</p> : null}</div></article>; })}</div></div></section>;
}

function DoctorsPageView({ content }: { content: DoctorsPageContent }) {
  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main>
        <DoctorsHero hero={content.hero} heroMedia={content.heroMedia} />
        <DoctorsGrid doctors={content.doctors} />
        <PatientFirstApproach items={content.patientEducation ?? []} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function DoctorsPageSkeleton() {
  return (
    <SiteLayout actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }} navigation={skeletonNavigation}>
      <main aria-busy="true" aria-label="Loading doctors page" className="bg-white">
        <span className="sr-only">Loading doctor profiles</span>

        <section aria-hidden="true" className="border-b border-[#e7eff3] bg-[#f7fafc] pb-10 pt-12 text-center sm:pb-12 sm:pt-14">
          <div className="mx-auto max-w-[650px] px-4 sm:px-6">
            <div className="mx-auto h-3 w-28 animate-pulse rounded-full bg-[#dcebf0]" />
            <div className="mx-auto mt-3 h-9 w-56 max-w-full animate-pulse rounded-lg bg-[#d1e6ee] sm:w-72" />
            <div className="mx-auto mt-4 h-4 w-[84%] animate-pulse rounded-full bg-[#e5f0f4] sm:w-[66%]" />
          </div>
        </section>

        <section aria-hidden="true" className="bg-white py-10 sm:py-14">
          <div className="mx-auto grid w-full max-w-[1280px] gap-4 px-4 sm:gap-5 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
              <div className="flex min-h-[196px] overflow-hidden rounded-xl border border-[#e3edf1] bg-white sm:block sm:h-[392px]" key={index}>
                <div className="h-[196px] w-[42%] shrink-0 animate-pulse bg-[#e3eef2] sm:h-[236px] sm:w-full" />
                <div className="flex flex-1 flex-col justify-center space-y-3 p-4 sm:h-[156px] sm:justify-start sm:p-5">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#dcebf0]" />
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-[#d1e6ee]" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-[#edf4f6]" />
                  <div className="h-3 w-4/5 animate-pulse rounded-full bg-[#edf4f6]" />
                  <div className="h-3 w-28 animate-pulse rounded-full bg-[#dcebf0]" />
                </div>
              </div>
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
