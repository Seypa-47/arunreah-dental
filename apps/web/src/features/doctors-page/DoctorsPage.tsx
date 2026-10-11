import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { CmsImage, ResilientImage } from '@/components/layout/public-ui';
import type { DoctorsPageContent, LandingDoctor } from '@/features/landing-page/types';
import { publicShell } from '@/features/public-content/public-page-chrome';
import { useDoctorsPageQuery } from './use-doctors-page';
import {
  teamCategories,
  teamDirectoryCopy,
  teamMemberProfileHref,
  teamSectionAnchor,
  TEAM_DIRECTORY_ANCHOR,
  type TeamCategory,
  type TeamDirectoryGroups,
  type TeamMember,
} from './team-directory';
import { getPublicMediaUrl } from '@/services/media';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { publicUiCopy } from '@/features/public-content/public-ui-copy';
import { usePublicDocumentTitle } from '@/features/public-content/public-document-title';

const asset = (name: string) => `/assets/landing/${name}`;

function CalendarIcon() {
  return <img alt="" aria-hidden="true" className="size-[14px]" src={asset('hero-calendar.svg')} />;
}

function ArrowIcon() {
  return <img alt="" aria-hidden="true" className="size-[14px]" src={asset('arrow-right.svg')} />;
}

/**
 * One card design, shared by every team category. The dentist card is the
 * original design, so these class strings are the source of truth for all
 * other staff cards too.
 */
const teamCard = {
  body: 'flex min-w-0 flex-1 flex-col bg-white p-4 sm:min-h-[156px] sm:p-5',
  bodyCompact:
    'flex min-w-0 flex-1 flex-col justify-center bg-white p-4 sm:min-h-[112px] sm:justify-start sm:p-5',
  inner: 'flex min-h-[196px] sm:block',
  media:
    'min-h-[196px] w-[42%] max-w-[176px] shrink-0 self-stretch bg-[#edf5f8] sm:aspect-[11/10] sm:h-auto sm:min-h-0 sm:w-full sm:max-w-none',
  name: 'text-[15px] font-bold leading-5 text-[#005687] sm:text-[16px]',
  role: 'mt-1 text-[12px] font-semibold leading-4 text-[#0d7596] sm:text-[13px]',
  shell:
    'overflow-hidden rounded-xl border-[#e6edf1] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow] duration-200 hover:border-[#cfe4ec] hover:shadow-[0_8px_20px_rgba(15,23,42,0.07)]',
  support: 'mt-2 line-clamp-2 text-[13px] font-normal leading-5 text-[#64748b]',
};

const teamGrid = 'grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4';

const LEGACY_LONG_DOCTORS_SUBTITLES = new Set([
  "our dental team brings together experience, continuous learning, and a thoughtful approach to every patient's care.",
  'our dental team brings together experience, continuous learning, and a thoughtful approach to every patient’s care.',
  'meet our clinic professionals committed to exceptional patient care.',
  'ក្រុមទន្តបណ្ឌិតរបស់យើង រួមបញ្ចូលបទពិសោធន៍ ការរៀនសូត្រជាបន្តបន្ទាប់ និងការយកចិត្តទុកដាក់ចំពោះអ្នកជំងឺគ្រប់រូប។',
  'ជួបជាមួយក្រុមទន្តបណ្ឌិតឯកទេសរបស់យើងដែលប្តេជ្ញាផ្តល់ការថែទាំដ៏ល្អបំផុត។',
]);

/**
 * The page now covers the whole clinic team, not only dentists. Until the
 * DOCTORS_HERO title is renamed in the CMS, the known dentist-only titles are
 * mapped to the team heading here. Delete this shim once the CMS copy is
 * updated; any other title passes through untouched.
 */
const LEGACY_DOCTORS_HERO_TITLES = new Set([
  'doctors',
  'meet the arunreah dental team',
  'meet our dental team',
  'វេជ្ជបណ្ឌិត',
  'ទន្តបណ្ឌិត',
  'ជួបជាមួយក្រុមទន្តបណ្ឌិតអរុណរះ',
]);

function getTeamHeroTitle(raw: string | null | undefined, language: 'en' | 'km') {
  const defaultTitle = language === 'km' ? 'ក្រុមការងាររបស់យើង' : 'Our Team';
  const trimmed = raw?.trim();
  if (!trimmed) return defaultTitle;
  if (LEGACY_DOCTORS_HERO_TITLES.has(trimmed.toLowerCase())) return defaultTitle;
  return trimmed;
}

function getTeamHeroSubtitle(raw: string | null | undefined, language: 'en' | 'km') {
  const defaultSubtitle =
    language === 'km'
      ? 'ទន្តបណ្ឌិត គ្រូពេទ្យទូទៅ បុគ្គលិកទទួលភ្ញៀវ និងជំនួយការព្យាបាល ដែលថែទាំអ្នកតាំងពីការស្វាគមន៍ដំបូង រហូតដល់ការពិនិត្យចុងក្រោយ។'
      : 'Dentists, general practitioners, receptionists, and clinical assistants who look after you from your first hello to your final check-up.';
  const trimmed = raw?.trim();
  if (!trimmed) return defaultSubtitle;
  if (LEGACY_LONG_DOCTORS_SUBTITLES.has(trimmed.toLowerCase())) {
    return defaultSubtitle;
  }
  return trimmed;
}

function TeamHero({
  hero,
  heroMedia,
}: {
  hero: DoctorsPageContent['hero'];
  heroMedia?: DoctorsPageContent['heroMedia'];
}) {
  const { language } = usePublicLanguage();
  const uiCopy = publicUiCopy(language).doctors;
  const imageUrl = heroMedia ? getPublicMediaUrl(heroMedia.imageKey) : null;
  const fallbackImageUrl = '/assets/landing/hero-clinic.png';
  const title = getTeamHeroTitle(heroMedia?.title ?? hero.title, language);
  const description = getTeamHeroSubtitle(heroMedia?.body ?? hero.description, language);
  const eyebrow =
    heroMedia?.badge || (language === 'km' ? 'ជួបជាមួយក្រុមការងារ' : 'MEET THE TEAM');

  return (
    <section className="border-b border-[#e7eff3] bg-[#f7fafc] py-5 sm:py-7">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-[#d9e9ee] bg-[#f7fafc] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[460px]">
          <ResilientImage
            alt={uiCopy.teamImageAlt}
            className="absolute inset-0 h-full w-full object-cover object-top contrast-[1.04] saturate-[1.04] sm:hidden"
            fallbackSrc={fallbackImageUrl}
            loading="eager"
            presentation={heroMedia?.imagePresentation ? { ...heroMedia.imagePresentation, zoom: 1 } : undefined}
            src={imageUrl}
          />
          <ResilientImage
            alt=""
            className="absolute inset-0 hidden h-full w-full object-cover object-center contrast-[1.04] saturate-[1.04] sm:block"
            fallbackSrc={fallbackImageUrl}
            loading="eager"
            presentation={heroMedia?.imagePresentation}
            src={imageUrl}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-white/90 via-white/65 to-transparent sm:right-auto sm:h-[68%] sm:w-[66%] sm:bg-[radial-gradient(100%_100%_at_0%_100%,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.62)_48%,rgba(255,255,255,0.22)_76%,transparent_100%)]"
          />
          <div className="relative z-10 flex min-h-[260px] flex-col justify-end p-4 pb-5 sm:min-h-[360px] sm:p-7 sm:pb-7 md:min-h-[420px] lg:min-h-[460px] lg:px-9 lg:pb-8">
            <div className="max-w-[460px] sm:max-w-[520px]">
              <p className="ui-eyebrow inline-flex w-fit items-center rounded-full bg-[#005687] px-3 py-1 text-[11px] font-extrabold uppercase leading-4 tracking-[0.06em] text-white shadow-sm sm:text-[12px]">
                {eyebrow}
              </p>
              <h1 className="mt-2 text-[24px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687] [text-shadow:_0_1px_12px_rgba(255,255,255,0.9)] sm:mt-2.5 sm:text-[32px] lg:text-[36px]">
                {title}
              </h1>
              {description ? (
                <p className="mt-2 max-w-[460px] text-[14px] font-medium leading-6 text-[#0e3b5e] [text-shadow:_0_1px_10px_rgba(255,255,255,0.9)] sm:mt-2.5 sm:text-[16px] sm:leading-7">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DoctorCard({ doctor }: { doctor: LandingDoctor }) {
  const { language } = usePublicLanguage();
  const doctorsCopy = publicUiCopy(language).doctors;
  const hasImage = Boolean(doctor.imageUrl);

  return (
    <Card className={teamCard.shell}>
      <Link
        aria-label={`${doctorsCopy.viewProfile}: ${doctor.name}`}
        className={`group ${teamCard.inner} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]`}
        to={doctor.detail.profileHref}
      >
        {hasImage ? (
          <div className={`${teamCard.media} overflow-hidden`}>
            <CmsImage
              alt={doctor.imageAlt || doctor.name}
              className="h-full w-full object-cover"
              presentation={doctor.imagePresentation ?? { positionX: 50, positionY: 0, zoom: 1 }}
              src={doctor.imageUrl}
            />
          </div>
        ) : (
          <div aria-hidden="true" className={teamCard.media} />
        )}
        <div className={teamCard.body}>
          <h3 className={teamCard.name}>{doctor.name}</h3>
          <p className={teamCard.role}>{doctor.credential ?? doctor.specialty}</p>
          <p className={teamCard.support}>{doctor.focus ?? doctor.specialty}</p>
          <span className="mt-auto inline-flex min-h-9 items-center justify-start gap-2 pt-3 text-left text-[12px] font-bold leading-4 text-[#0d7596] transition group-hover:text-[#005687] sm:mt-3 sm:min-h-0 sm:pt-0">
            <CalendarIcon />
            {doctor.bookingLabel ??
              (language === 'km' ? `កក់ជាមួយ ${doctor.name}` : `Book with ${doctor.name}`)}
          </span>
        </div>
      </Link>
    </Card>
  );
}

function TeamMonogram({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => [...part][0] ?? '')
    .join('');

  return (
    <div aria-hidden="true" className={`${teamCard.media} grid place-items-center`}>
      <span className="text-[26px] font-extrabold leading-none text-[#9cc2d3] sm:text-[30px]">
        {initials}
      </span>
    </div>
  );
}

function TeamMemberCardContent({
  actionLabel,
  member,
}: {
  actionLabel: string | null;
  member: TeamMember;
}) {
  return (
    <>
      {member.imageUrl ? (
        <div className={`${teamCard.media} overflow-hidden`}>
          <CmsImage
            alt={member.imageAlt || member.name}
            className="h-full w-full object-cover"
            presentation={member.imagePresentation ?? { positionX: 50, positionY: 0, zoom: 1 }}
            src={member.imageUrl}
          />
        </div>
      ) : (
        <TeamMonogram name={member.name} />
      )}
      <div className={actionLabel ? teamCard.body : teamCard.bodyCompact}>
        <h3 className={teamCard.name}>{member.name}</h3>
        <p className={teamCard.role}>{member.roleTitle}</p>
        {member.responsibility ? (
          <p className={teamCard.support}>{member.responsibility}</p>
        ) : null}
        {actionLabel ? (
          <span className="mt-auto inline-flex min-h-9 items-center justify-start gap-2 pt-3 text-left text-[12px] font-bold leading-4 text-[#0d7596] transition group-hover:text-[#005687] sm:mt-3 sm:min-h-0 sm:pt-0">
            <ArrowIcon />
            {actionLabel}
          </span>
        ) : null}
      </div>
    </>
  );
}

export function TeamMemberCard({ member }: { member: TeamMember }) {
  const { language } = usePublicLanguage();
  const copy = teamDirectoryCopy(language);
  const profileHref = member.slug ? teamMemberProfileHref(member.slug) : null;

  if (!profileHref) {
    return (
      <Card className={teamCard.shell}>
        <div className={teamCard.inner}>
          <TeamMemberCardContent actionLabel={null} member={member} />
        </div>
      </Card>
    );
  }

  return (
    <Card className={teamCard.shell}>
      <Link
        aria-label={`${copy.viewProfile} — ${member.name}`}
        className={`group ${teamCard.inner} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]`}
        to={profileHref}
      >
        <TeamMemberCardContent actionLabel={copy.viewProfile} member={member} />
      </Link>
    </Card>
  );
}

const STICKY_PROBE_OFFSET = 160;

function useActiveTeamSection(anchors: string[]) {
  const key = anchors.join('|');
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = key.split('|');
    let frame = 0;

    const update = () => {
      frame = 0;
      let current: string | null = null;
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= STICKY_PROBE_OFFSET) {
          current = id;
        }
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [key]);

  return active;
}

function TeamCategoryNav({ categories }: { categories: TeamCategory[] }) {
  const { language } = usePublicLanguage();
  const copy = teamDirectoryCopy(language);
  const anchors = useMemo(() => categories.map((category) => teamSectionAnchor(category.id)), [categories]);
  const activeAnchor = useActiveTeamSection(anchors);

  const items = [
    { anchor: TEAM_DIRECTORY_ANCHOR, label: copy.allLabel },
    ...categories.map((category) => ({ anchor: teamSectionAnchor(category.id), label: category.navLabel })),
  ];

  return (
    // `sticky` only takes effect once the SiteLayout root stops creating a
    // scroll container (`overflow-x-hidden`), which also stops the site header
    // from sticking. Until then this reads as a static bar under the hero.
    <nav
      aria-label={copy.navLabel}
      className="sticky top-[64px] z-30 border-b border-[#e7eff3] bg-white/95 backdrop-blur-xl sm:top-[74px]"
    >
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <ul className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const isActive =
              item.anchor === TEAM_DIRECTORY_ANCHOR ? activeAnchor === null : activeAnchor === item.anchor;
            return (
              <li key={item.anchor}>
                <a
                  aria-current={isActive ? 'true' : undefined}
                  className={`inline-flex min-h-9 items-center whitespace-nowrap rounded-full border px-4 text-[13px] font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168aad] sm:text-[14px] ${
                    isActive
                      ? 'border-[#b9dce8] bg-[#eef8fb] text-[#005687]'
                      : 'border-[#e3edf1] bg-white text-[#526879] hover:border-[#cfe4ec] hover:text-[#005687]'
                  }`}
                  href={`#${item.anchor}`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function TeamSection({
  anchor,
  children,
  description,
  eyebrow,
  isFirst,
  title,
}: {
  anchor: string;
  children: ReactNode;
  description: string;
  eyebrow: string;
  isFirst: boolean;
  title: string;
}) {
  return (
    <section
      aria-labelledby={`${anchor}-title`}
      className={`scroll-mt-[88px] sm:scroll-mt-[96px] ${isFirst ? '' : 'border-t border-[#e7eff3]'}`}
      id={anchor}
    >
      <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-6 max-w-[680px] sm:mb-8">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-[#3695B9]" />
            <p className="ui-eyebrow text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#0d7596]">
              {eyebrow}
            </p>
          </div>
          <h2
            className="mt-2 text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]"
            id={`${anchor}-title`}
          >
            {title}
          </h2>
          <p className="mt-2 text-[15px] leading-6 text-[#64748b]">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function TeamDirectory({ categories, doctors, teamMembers }: { categories: TeamCategory[]; doctors: LandingDoctor[]; teamMembers: TeamDirectoryGroups }) {
  const { language } = usePublicLanguage();

  return (
    <div
      aria-label={publicUiCopy(language).doctors.profilesLabel}
      className="scroll-mt-[88px] bg-white sm:scroll-mt-[96px]"
      id={TEAM_DIRECTORY_ANCHOR}
      role="region"
    >
      {categories.map((category, index) => (
        <TeamSection
          anchor={teamSectionAnchor(category.id)}
          description={category.description}
          eyebrow={category.eyebrow}
          isFirst={index === 0}
          key={category.id}
          title={category.title}
        >
          {category.id === 'dentists' ? (
            <div className={teamGrid}>
              {doctors.map((doctor) => (
                <DoctorCard doctor={doctor} key={doctor.detail.profileHref} />
              ))}
            </div>
          ) : teamMembers[category.id].length > 0 ? (
            <div className={teamGrid}>
              {teamMembers[category.id].map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          ) : null}
        </TeamSection>
      ))}
    </div>
  );
}

function PatientFirstApproach({
  items,
}: {
  items: NonNullable<DoctorsPageContent['patientEducation']>;
}) {
  const { language } = usePublicLanguage();
  if (items.length === 0) return null;
  const copy =
    language === 'km'
      ? { eyebrow: 'ការថែទាំដោយផ្តោតលើអ្នកជំងឺ', title: 'ការថែទាំចាប់ផ្តើមពីការណែនាំច្បាស់លាស់' }
      : { eyebrow: 'Patient-first approach', title: 'Care begins with clear guidance' };
  return (
    <section className="border-t border-[#e7eff3] bg-[#f7fafc] py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[640px]">
          <p className="ui-eyebrow text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#0d7596]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-2 text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]">
            {copy.title}
          </h2>
        </div>
        <div
          className={`mt-7 grid gap-5 ${items.length === 1 ? 'max-w-[840px] md:grid-cols-[0.78fr_1.22fr]' : 'sm:grid-cols-2'}`}
        >
          {items.map((item) => {
            const imageUrl = getPublicMediaUrl(item.imageKey);
            return (
              <article
                className={`overflow-hidden rounded-xl border border-[#dce9ee] bg-white ${items.length === 1 ? 'md:contents' : ''}`}
                key={item.id}
              >
                {imageUrl ? (
                  <div className="h-[280px] w-full overflow-hidden rounded-t-xl md:rounded-xl">
                    <CmsImage
                      alt={item.title ?? ''}
                      className="h-full w-full"
                      presentation={item.imagePresentation}
                      src={imageUrl}
                    />
                  </div>
                ) : null}
                <div
                  className={`p-5 sm:p-6 ${items.length === 1 ? 'rounded-b-xl border border-t-0 border-[#dce9ee] bg-white md:rounded-xl md:border' : ''}`}
                >
                  {item.title ? (
                    <h3 className="text-[19px] font-bold text-[#005687]">{item.title}</h3>
                  ) : null}
                  {item.body ? (
                    <p className="mt-2 text-[15px] leading-6 text-[#607486]">{item.body}</p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type TeamDoctorsPageContent = DoctorsPageContent & { teamMembers: TeamDirectoryGroups };

function DoctorsPageView({ content }: { content: TeamDoctorsPageContent }) {
  const { language } = usePublicLanguage();
  const categories = teamCategories(language).filter((category) =>
    category.id === 'dentists' ? content.doctors.length > 0 : content.teamMembers[category.id].length > 0,
  );
  return (
    <SiteLayout
      actions={content.actions}
      navigation={content.navigation}
      services={content.services}
    >
      <main>
        <TeamHero hero={content.hero} heroMedia={content.heroMedia} />
        <TeamCategoryNav categories={categories} />
        <TeamDirectory categories={categories} doctors={content.doctors} teamMembers={content.teamMembers} />
        <PatientFirstApproach items={content.patientEducation ?? []} />
      </main>
      <SiteFooter {...content.footer} />
    </SiteLayout>
  );
}

function DoctorsPageSkeleton() {
  const { language } = usePublicLanguage();
  const shell = publicShell(language);
  const copy = publicUiCopy(language).doctors;
  return (
    <SiteLayout actions={shell.actions} navigation={shell.navigation}>
      <main aria-busy="true" aria-label={copy.loading} className="bg-white">
        <span className="sr-only">{copy.loadingLabel}</span>

        <section
          aria-hidden="true"
          className="border-b border-[#e7eff3] bg-[#f7fafc] pb-10 pt-12 text-center sm:pb-12 sm:pt-14"
        >
          <div className="mx-auto max-w-[650px] px-4 sm:px-6">
            <div className="mx-auto h-3 w-28 animate-pulse rounded-full bg-[#dcebf0]" />
            <div className="mx-auto mt-3 h-9 w-56 max-w-full animate-pulse rounded-lg bg-[#d1e6ee] sm:w-72" />
            <div className="mx-auto mt-4 h-4 w-[84%] animate-pulse rounded-full bg-[#e5f0f4] sm:w-[66%]" />
          </div>
        </section>

        <section aria-hidden="true" className="border-b border-[#e7eff3] bg-white">
          <div className="mx-auto flex w-full max-w-[1280px] gap-2 px-4 py-3 sm:px-6 lg:px-8">
            {Array.from({ length: 5 }, (_, index) => (
              <div className="h-9 w-28 animate-pulse rounded-full bg-[#e5f0f4]" key={index} />
            ))}
          </div>
        </section>

        <section aria-hidden="true" className="bg-white py-10 sm:py-14">
          <div className="mx-auto grid w-full max-w-[1280px] gap-4 px-4 sm:grid-cols-2 sm:gap-5 sm:px-6 lg:grid-cols-3 lg:px-8 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                className="flex min-h-[196px] overflow-hidden rounded-xl border border-[#e3edf1] bg-white sm:block"
                key={index}
              >
                <div className="h-[196px] w-[42%] max-w-[176px] shrink-0 animate-pulse bg-[#e3eef2] sm:aspect-[11/10] sm:h-auto sm:w-full sm:max-w-none" />
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
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language);
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>{copy.common.noContent}</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">{copy.doctors.unavailableTitle}</h1>
        <p className="mt-3 text-[#6b7280]">{copy.doctors.unavailableBody}</p>
      </Card>
    </main>
  );
}

function DoctorsPageError({ onRetry }: { onRetry: () => void }) {
  const { language } = usePublicLanguage();
  const copy = publicUiCopy(language);
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge className="bg-[#fff1e6] text-[#9d4d18]">{copy.common.error}</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">{copy.doctors.errorTitle}</h1>
        <p className="mt-3 text-[#6b7280]">{copy.doctors.errorBody}</p>
        <Button className="mt-6" onClick={onRetry} type="button">
          {copy.common.retry}
        </Button>
      </Card>
    </main>
  );
}

function hasDoctorsContent(content: TeamDoctorsPageContent | undefined): content is TeamDoctorsPageContent {
  return Boolean(content && content.navigation.length > 0 && content.hero.title);
}

export function DoctorsPage() {
  const { data, isError, isLoading, refetch } = useDoctorsPageQuery();
  const { language } = usePublicLanguage();
  usePublicDocumentTitle(
    getTeamHeroTitle(data?.hero.title, language),
  );

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
