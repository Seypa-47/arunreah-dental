import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { CmsImage, ContentBlocks, ResilientImage } from '@/components/layout/public-ui';
import type { AboutPageContent } from '@/features/landing-page/types';
import { useAboutPageQuery } from './use-about-page';
import { getPublicMediaUrl } from '@/services/media';

const skeletonNavigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/branches', label: 'Branches' },
];

function ArrowIcon() {
  return (
    <span
      aria-hidden="true"
      className="size-[14px] bg-current [mask-image:url('/assets/landing/arrow-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
    />
  );
}

function AboutHero({ hero }: { hero: AboutPageContent['hero'] }) {
  const imageUrl = hero.imageUrl || '/assets/landing/hero-clinic.png';
  const imageAlt = hero.imageAlt || 'Arunreah Dental Clinic';

  return (
    <section className="border-b border-[#e7eff3] bg-[#f7fafc] py-5 sm:py-7">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8"><div className="relative grid min-h-[300px] overflow-hidden rounded-2xl border border-[#d9e9ee] bg-[#00546f] sm:min-h-[360px]">
        <ResilientImage alt={imageAlt} className="absolute inset-0 h-full w-full object-cover object-center" fallbackSrc="/assets/landing/hero-clinic.png" src={imageUrl} />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,52,78,0.9)_0%,rgba(5,52,78,0.62)_52%,rgba(5,52,78,0.12)_100%)]" />
        <div className="relative flex max-w-[720px] items-end p-6 text-white sm:p-10 lg:p-12">
          <div>{hero.eyebrow ? <p className="text-[12px] font-bold uppercase leading-4 tracking-[3.6px] text-[#b7e7f4]">{hero.eyebrow}</p> : null}
          <h1 className={`${hero.eyebrow ? 'mt-3' : ''} text-[30px] font-extrabold leading-tight tracking-[-0.035em] sm:text-[42px]`}>{hero.title}</h1>
          {hero.subtitle ? <p className="mt-3 max-w-[580px] text-[16px] font-medium leading-7 text-white/90">{hero.subtitle}</p> : null}</div>
        </div>
      </div></div>
    </section>
  );
}

function StorySection({ editorial, featuredDoctor, stats, story }: Pick<AboutPageContent, 'editorial' | 'featuredDoctor' | 'stats' | 'story'>) {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <div className="border-y-2 border-[#075d83] py-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#075d83] sm:flex sm:items-center sm:justify-between">
          <span>2026</span>
          <span className="hidden h-px flex-1 bg-[#b7d8e5] sm:mx-6 sm:block" />
          <span className="mt-1 block sm:mt-0">{editorial.editionLabel}</span>
        </div>

        <div className="border-b border-[#d6e5eb] py-8 sm:py-10">
          <p className="text-[12px] font-bold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">{editorial.profileLabel}</p>
          <h2 className="mt-3 max-w-[820px] text-[32px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#073f60] sm:text-[46px]">{editorial.profileTitle}</h2>
          <div className="mt-5 h-1 w-16 rounded-full bg-[#3695B9]" />
        </div>

        <div className={`grid gap-8 py-8 sm:gap-10 ${featuredDoctor ? 'lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.18fr)_minmax(200px,0.5fr)]' : 'mx-auto max-w-[760px]'}`}>
          {featuredDoctor?.imageUrl ? (
            <article className="overflow-hidden rounded-xl border border-[#dceaf0] bg-[#f8fbfc]">
              <ResilientImage alt={featuredDoctor.imageAlt || featuredDoctor.name} className="h-[320px] w-full object-cover object-top sm:h-[400px]" fallbackSrc="/assets/landing/doctor-chea-kimly.png" src={featuredDoctor.imageUrl} />
              <div className="border-t border-[#dceaf0] px-5 py-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#3695B9]">{featuredDoctor.specialty}</p>
                <h3 className="mt-2 text-[21px] font-extrabold leading-6 text-[#073f60]">{featuredDoctor.name}</h3>
                {featuredDoctor.title ? <p className="mt-1 text-[14px] font-medium leading-5 text-[#587080]">{featuredDoctor.title}</p> : null}
                <Link className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-[#087b9f] hover:text-[#005687]" to={featuredDoctor.profileHref}>View profile <ArrowIcon /></Link>
              </div>
            </article>
          ) : null}

          <div className={featuredDoctor ? undefined : 'text-center'}>
            <h3 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-[#073f60] sm:text-[32px]">{story.title}</h3>
            <div className={`mt-5 space-y-4 ${featuredDoctor ? '' : 'mx-auto max-w-[700px]'}`}>
              {story.paragraphs.map((paragraph) => <ContentBlocks key={paragraph} value={paragraph} />)}
              {featuredDoctor?.summary ? <p className="border-l-2 border-[#3695B9] pl-4 font-medium text-[#255d74]">{featuredDoctor.summary}</p> : null}
            </div>
          </div>

          {stats.length > 0 ? (
            <aside className="mx-auto flex w-full max-w-[340px] flex-col justify-start border-t border-[#d6e5eb] pt-6 sm:max-w-[400px] lg:mx-0 lg:max-w-none lg:border-l lg:border-t-0 lg:border-[#dceaf0] lg:pl-8">
              {stats.map((stat) => {
                const isKm = stat.label === 'ឆ្នាំនៃបទពិសោធន៍';
                return (
                  <div
                    className="group relative overflow-hidden rounded-[26px] border border-[#bfe0ec] bg-gradient-to-b from-[#f0f8fb] via-[#e6f4f8] to-[#d6eff7] p-6 text-center shadow-[0_8px_30px_rgba(7,93,131,0.08)] transition hover:shadow-[0_12px_36px_rgba(7,93,131,0.12)] sm:p-7"
                    key={stat.label}
                  >
                    <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-[#3695b9]/15 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-6 -left-6 size-24 rounded-full bg-[#087b9f]/10 blur-2xl" />

                    <div className="relative mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#3695b9]/20">
                      <img
                        alt=""
                        aria-hidden="true"
                        className="size-7 object-contain"
                        src={stat.iconUrl || '/assets/landing/about-stat-experience.svg'}
                      />
                    </div>

                    <div className="relative flex items-baseline justify-center gap-1">
                      <span className="text-[64px] font-black leading-none tracking-[-0.04em] text-[#075d83] sm:text-[76px]">
                        {stat.value}
                      </span>
                      <span className="text-[36px] font-extrabold leading-none text-[#3695b9]">+</span>
                    </div>

                    <p className="relative mt-3 text-[15px] font-extrabold uppercase tracking-[0.08em] text-[#073f60] sm:text-[16px]">
                      {stat.label}
                    </p>

                    <div className="relative mx-auto mt-4 h-1 w-12 rounded-full bg-[#3695b9]/40" />

                    <p className="relative mt-3 text-[12px] font-medium leading-relaxed text-[#506e80]">
                      {isKm
                        ? 'ការថែទាំធ្មេញប្រកបដោយការយកចិត្តទុកដាក់ និងជំនាញទុកចិត្តបាន'
                        : 'Dedicated dental care & trusted clinical expertise'}
                    </p>
                  </div>
                );
              })}
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ClinicGallery({ editorial, images }: { editorial: AboutPageContent['editorial']; images: NonNullable<AboutPageContent['clinicGallery']> }) {
  if (images.length === 0) return null;

  return (
    <section className="border-y border-[#e7eff3] bg-[#f7fafc] py-12 sm:py-14">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[640px]">
          <p className="text-[12px] font-bold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">{editorial.galleryEyebrow}</p>
          <h2 className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-[#005687] sm:text-[34px]">{editorial.galleryTitle}</h2>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {images.map((image, index) => (
            <figure className={`overflow-hidden rounded-xl border border-[#e1ebef] bg-white ${index === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}`} key={image.imageUrl}>
              <ResilientImage alt={image.imageAlt || editorial.galleryTitle} className={`w-full object-cover ${index === 0 ? 'h-[230px] sm:h-[300px]' : 'h-[190px] sm:h-[300px]'}`} fallbackSrc="/assets/landing/branches-clinic.png" src={image.imageUrl} />
              {image.imageAlt ? <figcaption className="ui-caption px-4 pb-3">{image.imageAlt}</figcaption> : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProfessionalDevelopment({ editorial, items }: { editorial: AboutPageContent['editorial']; items: NonNullable<AboutPageContent['professionalMedia']> }) {
  if (items.length === 0) return null;
  return <section className="bg-white py-12 sm:py-16"><div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8"><div className="border-b border-[#dce9ee] pb-5"><p className="text-[12px] font-bold uppercase tracking-[3.6px] text-[#3695B9]">{editorial.professionalEyebrow}</p><h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.035em] text-[#073f60] sm:text-[34px]">{editorial.professionalTitle}</h2></div><div className="mt-7 grid gap-4 sm:grid-cols-2">{items.map((item) => { const url = getPublicMediaUrl(item.imageKey); return <article className="overflow-hidden rounded-xl border border-[#dceaf0] bg-[#fbfdfe]" key={item.id}>{url ? <CmsImage alt={item.title || editorial.professionalTitle} className="h-[240px] w-full sm:h-[280px]" fallbackSrc="/assets/landing/hero-clinic.png" presentation={item.imagePresentation} src={url} /> : null}{item.title || item.body ? <div className="p-5">{item.title ? <h3 className="text-[17px] font-bold text-[#073f60]">{item.title}</h3> : null}{item.body ? <p className="mt-2 text-[14px] leading-6 text-[#607486]">{item.body}</p> : null}</div> : null}</article>; })}</div></div></section>;
}

function GrowthTimeline({ editorial, items }: { editorial: AboutPageContent['editorial']; items: NonNullable<AboutPageContent['timeline']> }) {
  if (items.length === 0) return null;

  return (
    <section className="border-y border-[#e2edf2] bg-[#f7fafc] py-12 sm:py-16">
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[620px]">
          <p className="text-[12px] font-bold uppercase tracking-[3.6px] text-[#3695B9]">{editorial.timelineEyebrow}</p>
          <h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.035em] text-[#073f60] sm:text-[34px]">{editorial.timelineTitle}</h2>
        </div>
        <ol className="relative mt-8 border-l border-[#b9dbe6] pl-7 sm:mt-10 sm:border-l-0 sm:pl-0 sm:before:absolute sm:before:inset-y-0 sm:before:left-1/2 sm:before:w-px sm:before:-translate-x-1/2 sm:before:bg-[#b9dbe6]">
          {items.map((item, index) => (
            <li className="relative grid pb-8 last:pb-0 sm:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] sm:pb-10" key={item.id}>
              <span aria-hidden="true" className="absolute -left-[35px] top-1 grid size-4 rounded-full border-[3px] border-[#f7fafc] bg-[#1687aa] sm:static sm:col-start-2 sm:mx-auto sm:size-5 sm:border-4" />
              <article className={`max-w-[420px] sm:row-start-1 ${index % 2 === 0 ? 'sm:col-start-1 sm:justify-self-end sm:pr-8 sm:text-right' : 'sm:col-start-3 sm:pl-8'}`}>
                <p className="text-[13px] font-extrabold tracking-[0.12em] text-[#1687aa]">{item.year}</p>
                <h3 className="mt-1 text-[19px] font-bold leading-7 text-[#073f60] sm:text-[21px]">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-[#587080]">{item.body}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function VisionMissionSection({
  mission,
  vision,
}: Pick<AboutPageContent, 'mission' | 'vision'>) {
  if (!mission.title && !vision.title) return null;
  return (
    <section className="grid lg:grid-cols-2">
      <article className="bg-[#3695B9] px-5 py-10 text-white sm:px-10 sm:py-12 lg:pl-[calc((100vw-1280px)/2)]">
        <div className="ml-auto max-w-[500px] lg:mr-14">
          <div className="mb-4 flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-white/16">
              <img alt="" aria-hidden="true" className="size-5 brightness-0 invert" src={vision.iconUrl} />
            </span>
            <h2 className="text-[24px] font-extrabold leading-7 sm:text-[26px]">{vision.title}</h2>
          </div>
          <p className="text-[14px] font-normal leading-6 text-white/85">{vision.description}</p>
        </div>
      </article>
      <article className="relative bg-[#f1f7fa] px-5 py-10 sm:px-10 sm:py-12 lg:pr-[calc((100vw-1280px)/2)]">
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 hidden size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[22px] font-bold text-[#3695B9] shadow-[0_8px_20px_rgba(15,23,42,0.12)] lg:grid"
        >
          +
        </span>
        <div className="max-w-[500px] lg:ml-14">
          <div className="mb-4 flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-[#dff2f7]">
              <img alt="" aria-hidden="true" className="size-5" src={mission.iconUrl} />
            </span>
            <h2 className="text-[24px] font-extrabold leading-7 text-[#005687] sm:text-[26px]">{mission.title}</h2>
          </div>
          <p className="text-[14px] font-normal leading-6 text-[#6b7280]">{mission.description}</p>
        </div>
      </article>
    </section>
  );
}

function DifferencesSection({ differences }: Pick<AboutPageContent, 'differences'>) {
  if (differences.length === 0) return null;
  return (
    <section className="bg-white py-14 text-center sm:py-16">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">Why Choose Us</p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-[#005687] sm:text-[34px]">What Makes Us Different</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {differences.map((item) => (
            <Card className="rounded-xl border border-[#e4edf2] bg-[#fbfdfe] px-5 py-6 text-center shadow-none" key={item.title}>
              <span className="mx-auto grid size-10 place-items-center rounded-lg bg-white shadow-[0_2px_8px_rgba(15,61,84,0.06)]">
                <img alt="" aria-hidden="true" className="max-h-5 max-w-5" src={item.iconUrl} />
              </span>
              <h3 className="mt-5 text-[15px] font-bold leading-5 text-[#005687]">{item.title}</h3>
              <p className="mt-2 text-[13px] font-normal leading-5 text-[#6b7280]">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FacilitiesSection({ editorial, facilities }: Pick<AboutPageContent, 'editorial' | 'facilities'>) {
  if (facilities.length === 0) return null;
  return (
    <section className="border-y border-[#e2edf2] bg-[#f7fafc] py-14 sm:py-16">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[720px]">
          <p className="text-[12px] font-extrabold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">{editorial.facilitiesEyebrow}</p>
          <h2 className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-[#005687] sm:text-[34px]">{editorial.facilitiesTitle}</h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility, index) => (
            <article className={`group overflow-hidden rounded-xl border border-[#dceaf0] bg-white shadow-[0_2px_10px_rgba(15,61,84,0.05)] transition-shadow duration-200 hover:shadow-[0_10px_24px_rgba(15,61,84,0.1)] ${index === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`} key={`${facility.title}-${facility.imageUrl}`}>
              <div className="aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_center,#ffffff_0%,#eef6f8_72%)] p-3">
                <CmsImage alt={facility.imageAlt} className="h-full w-full transition duration-300 group-hover:scale-[1.03]" fit="contain" presentation={facility.imagePresentation} src={facility.imageUrl} />
              </div>
              <div className="border-t border-[#e7eff3] p-5">
                <h3 className="text-[17px] font-bold leading-6 text-[#073f60]">{facility.title}</h3>
                {facility.description ? <p className="mt-2 text-[14px] leading-6 text-[#607486]">{facility.description}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutPageView({ content }: { content: AboutPageContent }) {
  return (
    <SiteLayout actions={content.actions} navigation={content.navigation} services={content.services}>
      <main>
        <AboutHero hero={content.hero} />
        <StorySection editorial={content.editorial} featuredDoctor={content.featuredDoctor} stats={content.stats} story={content.story} />
        <GrowthTimeline editorial={content.editorial} items={content.timeline ?? []} />
        <ProfessionalDevelopment editorial={content.editorial} items={content.professionalMedia ?? []} />
        <ClinicGallery editorial={content.editorial} images={content.clinicGallery ?? []} />
        <VisionMissionSection mission={content.mission} vision={content.vision} />
        <DifferencesSection differences={content.differences} />
        <FacilitiesSection editorial={content.editorial} facilities={content.facilities} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function AboutPageSkeleton() {
  return (
    <SiteLayout actions={{ appointmentLabel: 'Book Appointment', contactLabel: 'Contact Us' }} navigation={skeletonNavigation}>
      <main aria-busy="true" aria-label="Loading about page" className="bg-white">
        <span className="sr-only">Loading clinic story</span>

        <section aria-hidden="true" className="grid min-h-[236px] place-items-center overflow-hidden bg-[radial-gradient(circle_at_15%_0%,rgba(79,181,209,0.34),transparent_36%),linear-gradient(120deg,#00546f,#087b9f)] px-4 py-12 sm:min-h-[260px] sm:px-6 sm:py-14">
          <div className="w-full max-w-[620px] space-y-4 text-center">
            <div className="mx-auto h-3 w-28 animate-pulse rounded-full bg-white/30" />
            <div className="mx-auto h-9 w-56 max-w-full animate-pulse rounded-lg bg-white/55 sm:w-72" />
            <div className="mx-auto h-4 w-[82%] animate-pulse rounded-full bg-white/30 sm:w-[68%]" />
          </div>
        </section>

        <section aria-hidden="true" className="bg-white py-12 sm:py-16">
          <div className="mx-auto w-full max-w-[780px] px-4 text-center sm:px-6">
            <div className="mx-auto h-3 w-24 animate-pulse rounded-full bg-[#dcebf0]" />
            <div className="mx-auto mt-3 h-8 w-56 max-w-full animate-pulse rounded-lg bg-[#d1e6ee] sm:w-72" />
            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-[#d4e9f1]" />
            <div className="mx-auto mt-6 max-w-[700px] space-y-3">
              <div className="h-4 w-full animate-pulse rounded-full bg-[#edf4f6]" />
              <div className="h-4 w-[94%] animate-pulse rounded-full bg-[#edf4f6]" />
              <div className="h-4 w-[78%] animate-pulse rounded-full bg-[#edf4f6]" />
              <div className="h-4 w-[88%] animate-pulse rounded-full bg-[#edf4f6]" />
            </div>
          </div>

          <div className="mx-auto mt-10 grid w-[calc(100%-32px)] max-w-[960px] overflow-hidden rounded-xl border border-[#e4edf2] bg-[#fbfdfe] sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="flex items-center justify-center gap-3 border-b border-[#e7eff3] px-4 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0" key={index}>
                <span className="size-5 animate-pulse rounded-full bg-[#dcebf0]" />
                <div className="space-y-2">
                  <div className="h-5 w-12 animate-pulse rounded-full bg-[#d1e6ee]" />
                  <div className="h-3 w-20 animate-pulse rounded-full bg-[#edf4f6]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-hidden="true" className="border-t border-[#e7eff3] bg-[#f7fafc] py-12 sm:py-14">
          <div className="mx-auto grid w-full max-w-[1280px] gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:px-8">
            {Array.from({ length: 2 }, (_, index) => (
              <div className="rounded-xl border border-[#e1ebef] bg-white p-6" key={index}>
                <div className="size-11 animate-pulse rounded-xl bg-[#dcebf0]" />
                <div className="mt-5 h-6 w-36 animate-pulse rounded-lg bg-[#d1e6ee]" />
                <div className="mt-4 space-y-3">
                  <div className="h-3 w-full animate-pulse rounded-full bg-[#edf4f6]" />
                  <div className="h-3 w-4/5 animate-pulse rounded-full bg-[#edf4f6]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

function AboutPageEmpty() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>No content</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">About page content is unavailable</h1>
        <p className="mt-3 text-[#6b7280]">Please check the content source and try again.</p>
      </Card>
    </main>
  );
}

function AboutPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">Error</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">We could not load the about page</h1>
        <p className="mt-3 text-[#6b7280]">Try again to refresh the clinic story.</p>
        <Button className="mt-6" onClick={onRetry} type="button">
          Retry
        </Button>
      </Card>
    </main>
  );
}

function hasAboutContent(content: AboutPageContent | undefined): content is AboutPageContent {
  return Boolean(
    content &&
      content.navigation.length > 0 &&
      content.hero.title &&
      content.story.paragraphs.length > 0 &&
      content.stats.length > 0,
  );
}

export function AboutPage() {
  const { data, isError, isLoading, refetch } = useAboutPageQuery();

  if (isLoading) {
    return <AboutPageSkeleton />;
  }

  if (isError) {
    return <AboutPageError onRetry={() => void refetch()} />;
  }

  if (!hasAboutContent(data)) {
    return <AboutPageEmpty />;
  }

  return <AboutPageView content={data} />;
}
