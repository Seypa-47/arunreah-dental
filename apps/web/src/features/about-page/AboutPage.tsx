import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { CmsImage, ContentBlocks, PublicPageHero, ResilientImage } from '@/components/layout/public-ui';
import type { AboutPageContent } from '@/features/landing-page/types';
import { publicShell } from '@/features/public-content/public-page-chrome';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { publicUiCopy } from '@/features/public-content/public-ui-copy';
import { useAboutPageQuery } from './use-about-page';
import { getPublicMediaUrl } from '@/services/media';

function ArrowIcon() {
  return (
    <span
      aria-hidden="true"
      className="size-[14px] bg-current [mask-image:url('/assets/landing/arrow-right.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
    />
  );
}

function AboutHero({ hero }: { hero: AboutPageContent['hero'] }) {
  return (
    <PublicPageHero
      backgroundImageAlt={hero.imageAlt}
      backgroundImageUrl={hero.imageUrl || '/assets/landing/figma-branches/image2_183_4173.png'}
      eyebrow={hero.eyebrow}
      fallbackSrc="/assets/landing/figma-branches/image2_183_4173.png"
      imagePresentation={hero.imagePresentation}
      subtitle={hero.subtitle}
      title={hero.title}
    />
  );
}

function ExperienceBadgeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-7 text-[#087b9f]"
      fill="none"
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="14"
        cy="11"
        r="7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
      <path
        d="M14 7.8l1 2.2 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3 1-2.2z"
        fill="currentColor"
      />
      <path
        d="M10.2 16.5L8.5 24l5.5-2.8 5.5 2.8-1.7-7.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function StorySection({ editorial, featuredDoctor, stats, story }: Pick<AboutPageContent, 'editorial' | 'featuredDoctor' | 'stats' | 'story'>) {
  const { language } = usePublicLanguage();
  const aboutCopy = publicUiCopy(language).about;
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <div className="border-y-2 border-[#075d83] py-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#075d83] sm:flex sm:items-center sm:justify-between">
          <span>2026</span>
          <span className="hidden h-px flex-1 bg-[#b7d8e5] sm:mx-6 sm:block" />
          <span className="mt-1 block sm:mt-0">{editorial.editionLabel}</span>
        </div>

        <div className="border-b border-[#d6e5eb] py-8 sm:py-10">
          <p className="ui-eyebrow text-[12px] font-bold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">{editorial.profileLabel}</p>
          <h2 className="mt-3 max-w-[820px] text-[32px] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#073f60] sm:text-[46px]">{editorial.profileTitle}</h2>
          <div className="mt-5 h-1 w-16 rounded-full bg-[#3695B9]" />
        </div>

        <div className={`grid gap-8 py-8 sm:gap-10 ${featuredDoctor ? 'lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.18fr)_minmax(200px,0.5fr)]' : 'mx-auto max-w-[760px]'}`}>
          {featuredDoctor?.imageUrl ? (
            <article className="overflow-hidden rounded-xl border border-[#dceaf0] bg-[#f8fbfc]">
              <ResilientImage alt={featuredDoctor.imageAlt || featuredDoctor.name} className="h-[320px] w-full object-cover object-top sm:h-[400px]" fallbackSrc="/assets/landing/doctor-chea-kimly.png" src={featuredDoctor.imageUrl} />
              <div className="border-t border-[#dceaf0] px-5 py-5">
                <p className="ui-eyebrow text-[11px] font-bold uppercase tracking-[0.14em] text-[#3695B9]">{featuredDoctor.specialty}</p>
                <h3 className="mt-2 text-[21px] font-extrabold leading-6 text-[#073f60]">{featuredDoctor.name}</h3>
                {featuredDoctor.title ? <p className="mt-1 text-[14px] font-medium leading-5 text-[#587080]">{featuredDoctor.title}</p> : null}
                <Link className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-[#087b9f] hover:text-[#005687]" to={featuredDoctor.profileHref}>{aboutCopy.viewProfile} <ArrowIcon /></Link>
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
                      <ExperienceBadgeIcon />
                    </div>

                    <div className="relative flex items-baseline justify-center gap-1">
                      <span className="text-[64px] font-black leading-none tracking-[-0.04em] text-[#075d83] sm:text-[76px]">
                        {stat.value}
                      </span>
                      <span className="text-[36px] font-extrabold leading-none text-[#3695b9]">+</span>
                    </div>

                    <p className="ui-eyebrow relative mt-3 text-[15px] font-extrabold uppercase tracking-[0.08em] text-[#073f60] sm:text-[16px]">
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

function ClinicGallery({
  branchGalleries,
  editorial,
  images,
}: {
  branchGalleries?: AboutPageContent['branchGalleries'];
  editorial: AboutPageContent['editorial'];
  images: NonNullable<AboutPageContent['clinicGallery']>;
}) {
  const { language } = usePublicLanguage();
  const isKm = language === 'km';
  const [selectedBranchSlug, setSelectedBranchSlug] = useState<'all' | string>('all');

  const branches = useMemo(() => {
    if (branchGalleries && branchGalleries.length > 0) return branchGalleries;
    if (images.length > 0) {
      return [
        {
          branchSlug: 'toul-tompoung',
          branchName: isKm ? 'សាខាទួលទំពូង' : 'Toul Tompoung Branch',
          badge: isKm ? 'សាខាចម្បង' : 'Main Branch',
          shortLocationLabel: isKm ? 'ទួលទំពូង រាជធានីភ្នំពេញ' : 'Toul Tompoung, Phnom Penh',
          address: isKm ? 'ផ្ទះ159c ផ្លូវ 113 ភូមិ 4 សង្កាត់បឹងកេងកង3 ខណ្ឌបឹងកេងកង' : '#159c, st113, Boeng Keng Kang 3, Phnom Penh',
          openingHours: isKm ? 'ច័ន្ទ - អាទិត្យ៖ ៨:០០ ព្រឹក - ៧:០០ ល្ងាច' : 'Monday - Sunday: 8:00 AM - 7:00 PM',
          phone: '061 978 997',
          googleMapsUrl: 'https://maps.app.goo.gl/LHQeXEkpcAvcfnT18',
          images,
        },
      ];
    }
    return [];
  }, [branchGalleries, images, isKm]);

  const activeBranches = useMemo(() => {
    if (selectedBranchSlug === 'all') return branches;
    return branches.filter((b) => b.branchSlug === selectedBranchSlug);
  }, [branches, selectedBranchSlug]);

  if (branches.length === 0) return null;

  return (
    <section className="border-y border-[#e7eff3] bg-[#f7fafc] py-14 sm:py-18">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[640px]">
            <p className="ui-eyebrow text-[12px] font-bold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">
              {editorial.galleryEyebrow}
            </p>
            <h2 className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-[#005687] sm:text-[34px]">
              {editorial.galleryTitle}
            </h2>
            <p className="mt-2 text-[15px] font-medium leading-relaxed text-[#597184]">
              {isKm
                ? 'ស្វែងយល់ពីបរិយាកាស និងគ្រឿងបរិក្ខារនៃសាខាទាំងពីររបស់យើងនៅរាជធានីភ្នំពេញ'
                : 'Explore the welcoming environment and modern facilities across our two Phnom Penh branches.'}
            </p>
          </div>

          {/* Quick Branch Filter Tabs */}
          {branches.length > 1 && (
            <div className="inline-flex self-start rounded-full border border-[#d6e5eb] bg-white p-1 shadow-xs md:self-end">
              <button
                className={`rounded-full px-4 py-1.5 text-[12.5px] font-bold transition ${
                  selectedBranchSlug === 'all'
                    ? 'bg-[#005687] text-white shadow-xs'
                    : 'text-[#62778a] hover:text-[#005687]'
                }`}
                onClick={() => setSelectedBranchSlug('all')}
                type="button"
              >
                {isKm ? 'សាខាទាំងពីរ' : 'All Branches'}
              </button>
              {branches.map((b) => (
                <button
                  className={`rounded-full px-4 py-1.5 text-[12.5px] font-bold transition ${
                    selectedBranchSlug === b.branchSlug
                      ? 'bg-[#005687] text-white shadow-xs'
                      : 'text-[#62778a] hover:text-[#005687]'
                  }`}
                  key={b.branchSlug}
                  onClick={() => setSelectedBranchSlug(b.branchSlug)}
                  type="button"
                >
                  {b.branchName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Branch Galleries Stacked (Psa Chas first above, Toul Tompoung second below) */}
        <div className="mt-10 space-y-12 sm:space-y-14">
          {activeBranches.map((branch) => (
            <div
              className="rounded-3xl border border-[#dce8ee] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(15,61,84,0.04)]"
              key={branch.branchSlug}
            >
              {/* Branch Header Bar */}
              <div className="flex flex-col gap-4 border-b border-[#eef4f7] pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef8fb] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#1687aa]">
                      <svg aria-hidden="true" className="size-3 text-[#1687aa]" fill="none" viewBox="0 0 24 24">
                        <path d="M12 21.2s7-5.95 7-11.75A6.86 6.86 0 0 0 12 2.5a6.86 6.86 0 0 0-7 6.95c0 5.8 7 11.75 7 11.75Z" fill="currentColor" />
                        <circle cx="12" cy="9.45" fill="white" r="2.25" />
                      </svg>
                      {branch.badge || (branch.branchSlug === 'psa-chas' ? (isKm ? 'សាខាក្នុងក្រុង' : 'City Branch') : (isKm ? 'សាខាចម្បង' : 'Main Branch'))}
                    </span>
                    {branch.shortLocationLabel && (
                      <span className="text-[12px] font-semibold text-[#8194a5]">
                        • {branch.shortLocationLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-[22px] font-extrabold tracking-[-0.02em] text-[#005687] sm:text-[25px]">
                    {branch.branchName}
                  </h3>
                  {branch.address && (
                    <p className="mt-1 max-w-[620px] text-[13px] leading-relaxed text-[#687e91]">
                      📍 {branch.address}
                    </p>
                  )}
                </div>

                {/* Branch Quick Details & Action */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  {branch.openingHours && (
                    <span className="hidden items-center gap-1.5 rounded-xl bg-[#f7fafc] px-3 py-1.5 text-[12px] font-medium text-[#687e91] lg:inline-flex">
                      🕒 {branch.openingHours}
                    </span>
                  )}
                  {branch.googleMapsUrl && (
                    <a
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#d6e5eb] bg-white px-3.5 py-1.5 text-[12px] font-bold text-[#005687] transition hover:border-[#1687aa] hover:bg-[#f7fbfe]"
                      href={branch.googleMapsUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <svg aria-hidden="true" className="size-3.5 text-[#1687aa]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      {isKm ? 'ផែនទី' : 'Maps'}
                    </a>
                  )}
                  <Link
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#1687aa] px-4 py-1.5 text-[12px] font-bold text-white transition hover:bg-[#116f8c]"
                    to={`/book-appointment?branch=${encodeURIComponent(branch.branchSlug)}`}
                  >
                    {isKm ? 'កក់ការណាត់ជួប' : 'Book here'}
                  </Link>
                </div>
              </div>

              {/* 4-Photo Responsive Grid */}
              <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                {branch.images.map((image, index) => (
                  <figure
                    className={`group overflow-hidden rounded-2xl border border-[#dce8ee] bg-[#f9fbfd] transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      index === 0 ? 'sm:col-span-2 lg:col-span-2' : ''
                    }`}
                    key={`${branch.branchSlug}-${image.imageUrl}`}
                  >
                    <div className="relative overflow-hidden">
                      <ResilientImage
                        alt={image.imageAlt || branch.branchName}
                        className={`w-full object-cover transition duration-300 group-hover:scale-[1.03] ${
                          index === 0 ? 'h-[230px] sm:h-[300px]' : 'h-[190px] sm:h-[300px]'
                        }`}
                        fallbackSrc="/assets/landing/branches-clinic.png"
                        presentation={image.imagePresentation}
                        src={image.imageUrl}
                      />
                    </div>
                    {image.imageAlt ? (
                      <figcaption className="ui-caption flex items-center justify-between px-4 py-2.5 text-[12.5px] font-semibold text-[#073f60]">
                        <span className="truncate">{image.imageAlt}</span>
                        <span className="ml-2 shrink-0 text-[11px] font-medium text-[#7d93a6]">
                          {index === 0 ? (isKm ? 'ទិដ្ឋភាពខាងក្រៅ' : 'Exterior') : `${isKm ? 'រូបថត' : 'Photo'} ${index + 1}`}
                        </span>
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProfessionalDevelopment({ editorial, items }: { editorial: AboutPageContent['editorial']; items: NonNullable<AboutPageContent['professionalMedia']> }) {
  if (items.length === 0) return null;
  return <section className="bg-white py-12 sm:py-16"><div className="mx-auto max-w-[1120px] px-4 sm:px-6 lg:px-8"><div className="border-b border-[#dce9ee] pb-5"><p className="ui-eyebrow text-[12px] font-bold uppercase tracking-[3.6px] text-[#3695B9]">{editorial.professionalEyebrow}</p><h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.035em] text-[#073f60] sm:text-[34px]">{editorial.professionalTitle}</h2></div><div className="mt-7 grid gap-4 sm:grid-cols-2">{items.map((item) => { const url = getPublicMediaUrl(item.imageKey); return <article className="overflow-hidden rounded-xl border border-[#dceaf0] bg-[#fbfdfe]" key={item.id}>{url ? <CmsImage alt={item.title || editorial.professionalTitle} className="h-[240px] w-full sm:h-[280px]" fallbackSrc="/assets/landing/hero-clinic.png" presentation={item.imagePresentation} src={url} /> : null}{item.title || item.body ? <div className="p-5">{item.title ? <h3 className="text-[17px] font-bold text-[#073f60]">{item.title}</h3> : null}{item.body ? <p className="mt-2 text-[14px] leading-6 text-[#607486]">{item.body}</p> : null}</div> : null}</article>; })}</div></div></section>;
}

function GrowthTimeline({ editorial, items }: { editorial: AboutPageContent['editorial']; items: NonNullable<AboutPageContent['timeline']> }) {
  if (items.length === 0) return null;

  return (
    <section className="border-y border-[#e2edf2] bg-[#f7fafc] py-12 sm:py-16">
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[620px]">
          <p className="ui-eyebrow text-[12px] font-bold uppercase tracking-[3.6px] text-[#3695B9]">{editorial.timelineEyebrow}</p>
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
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language).about;
  if (differences.length === 0) return null;
  return (
    <section className="bg-white py-14 text-center sm:py-16">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <p className="ui-eyebrow text-[12px] font-extrabold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">{copy.whyTitle}</p>
        <h2 className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-[#005687] sm:text-[34px]">{copy.differenceTitle}</h2>
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
          <p className="ui-eyebrow text-[12px] font-extrabold uppercase leading-4 tracking-[3.6px] text-[#3695B9]">{editorial.facilitiesEyebrow}</p>
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
        <ClinicGallery branchGalleries={content.branchGalleries} editorial={content.editorial} images={content.clinicGallery ?? []} />
        <VisionMissionSection mission={content.mission} vision={content.vision} />
        <DifferencesSection differences={content.differences} />
        <FacilitiesSection editorial={content.editorial} facilities={content.facilities} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function AboutPageSkeleton() {
  const { language } = usePublicLanguage();
  const shell = publicShell(language);
  const copy = publicUiCopy(language).about;
  return (
    <SiteLayout actions={shell.actions} navigation={shell.navigation}>
      <main aria-busy="true" aria-label={copy.loading} className="bg-white">
        <span className="sr-only">{copy.loadingLabel}</span>

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
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language);
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>{copy.common.noContent}</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">{copy.about.unavailableTitle}</h1>
        <p className="mt-3 text-[#6b7280]">{copy.about.unavailableBody}</p>
      </Card>
    </main>
  );
}

function AboutPageError({ onRetry }: { onRetry: () => void }) {
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language);
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">{copy.common.error}</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">{copy.about.errorTitle}</h1>
        <p className="mt-3 text-[#6b7280]">{copy.about.errorBody}</p>
        <Button className="mt-6" onClick={onRetry} type="button">
          {copy.common.retry}
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
