import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLayout } from '@/components/layout/site-layout';
import { ResilientImage } from '@/components/layout/public-ui';
import { TeamMemberCard } from '@/features/doctors-page/DoctorsPage';
import {
  teamSectionAnchor,
  type TeamCategory,
  type TeamMember,
  type TeamMemberProfile,
} from '@/features/doctors-page/team-directory';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { publicShell } from '@/features/public-content/public-page-chrome';
import { usePublicDocumentTitle } from '@/features/public-content/public-document-title';
import { isPublicNotFoundError } from '@/features/public-content/public-errors';
import { ClinicalProfileBody } from './ClinicalProfileBody';
import { SupportProfileBody, SupportVisitCta, TeamBackLink } from './SupportProfileBody';
import { profileCopy } from './profile-copy';
import { useTeamMemberProfileQuery } from './use-team-member-profile';

type ProfileMember = TeamMember & { profile: TeamMemberProfile; slug: string };

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="size-4 shrink-0" fill="currentColor" viewBox="0 0 14 16">
      <path d="M4 0C4.41563 0 4.75 0.334375 4.75 0.75V2H9.25V0.75C9.25 0.334375 9.58437 0 10 0C10.4156 0 10.75 0.334375 10.75 0.75V2H12C13.1031 2 14 2.89688 14 4V14C14 15.1031 13.1031 16 12 16H2C0.896875 16 0 15.1031 0 14V4C0 2.89688 0.896875 2 2 2H3.25V0.75C3.25 0.334375 3.58437 0 4 0ZM12.5 6H1.5V14C1.5 14.275 1.725 14.5 2 14.5H12C12.275 14.5 12.5 14.275 12.5 14V6ZM10.2812 9.28125L6.78125 12.7812C6.4875 13.075 6.0125 13.075 5.72188 12.7812L3.72187 10.7812C3.42812 10.4875 3.42812 10.0125 3.72187 9.72188C4.01562 9.43125 4.49062 9.42813 4.78125 9.72188L6.25 11.1906L9.21875 8.22188C9.5125 7.92813 9.9875 7.92813 10.2781 8.22188C10.5687 8.51563 10.5719 8.99062 10.2781 9.28125H10.2812Z" />
    </svg>
  );
}

function PortraitMonogram({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => [...part][0] ?? '')
    .join('');

  return (
    <div
      aria-hidden="true"
      className="grid aspect-[15/16] w-full place-items-center md:aspect-auto md:h-[360px]"
    >
      <span className="text-[56px] font-extrabold leading-none text-[#9cc2d3]">{initials}</span>
    </div>
  );
}

function TeamMemberHero({ category, member }: { category: TeamCategory; member: ProfileMember }) {
  const navigate = useNavigate();
  const { language } = usePublicLanguage();
  const copy = profileCopy(language, member.name);
  const { profile } = member;
  const canRequestAppointment = profile.layout === 'clinical' && profile.bookingAvailable;

  return (
    <section className="border-b border-[#e7eff3] bg-[#f7fafc] py-10 sm:py-12">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Link
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0d7596] transition hover:text-[#005687] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
          to={`/team#${teamSectionAnchor(category.id)}`}
        >
          <span aria-hidden="true">←</span>
          <span>{copy.backToTeam}</span>
        </Link>
      </div>
      <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 sm:px-6 md:grid-cols-[280px_minmax(0,1fr)] md:items-center md:gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-10 lg:px-8">
        <div className="mx-auto w-full max-w-[380px] overflow-hidden rounded-xl border border-[#e2edf1] bg-[#edf5f8] shadow-[0_2px_8px_rgba(15,23,42,0.05)] md:mx-0 md:max-w-none">
          {member.imageUrl ? (
            <ResilientImage
              alt={member.imageAlt || member.name}
              className="aspect-[15/16] w-full object-cover md:aspect-auto md:h-[360px]"
              fallbackSrc="/assets/landing/hero-clinic.png"
              presentation={member.imagePresentation ?? { positionX: 50, positionY: 0, zoom: 1 }}
              src={member.imageUrl}
            />
          ) : (
            <PortraitMonogram name={member.name} />
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="ui-eyebrow text-[11px] font-extrabold uppercase leading-4 tracking-[0.06em] text-[#0d7596] sm:text-[12px]">
              {member.roleTitle}
            </p>
            {member.department ? (
              <span className="inline-flex min-h-6 items-center rounded-full border border-[#d4e7ef] bg-white px-2.5 text-[11px] font-bold leading-4 text-[#526879] sm:text-[12px]">
                {member.department}
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-[#005687] sm:mt-3 sm:text-[38px]">
            {member.name}
          </h1>
          <p className="mt-3 max-w-[600px] text-[16px] font-normal leading-7 text-[#64748b]">
            {profile.heroSummary}
          </p>
          {canRequestAppointment ? (
            <div className="mt-6 flex flex-col items-stretch gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Button
                className="min-h-[52px] w-full rounded-full bg-[#0d7596] px-7 text-[15px] font-bold text-white shadow-[0_8px_18px_rgba(13,117,150,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#075d83] hover:shadow-[0_10px_22px_rgba(13,117,150,0.28)] active:translate-y-0 sm:w-auto"
                icon={<CalendarIcon />}
                onClick={() => navigate('/book-appointment')}
              >
                {copy.requestAppointment}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function OtherTeamMembers({ members }: { members: TeamMember[] }) {
  const { language } = usePublicLanguage();
  const copy = profileCopy(language, '');
  if (members.length === 0) return null;

  return (
    <section className="border-t border-[#e7eff3] bg-[#f7fafc] py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]">
              {copy.others}
            </h2>
            <p className="mt-1 text-[14px] font-normal leading-5 text-[#64748b]">
              {copy.othersBody}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamMemberProfileEmpty() {
  const { language } = usePublicLanguage();
  const copy = profileCopy(language, '');
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>{copy.notFoundBadge}</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">{copy.notFoundTitle}</h1>
        <p className="mt-3 text-[#6b7280]">{copy.notFoundBody}</p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3695B9] px-5 text-sm font-extrabold text-white hover:bg-[#2c84a5]"
          to="/team"
        >
          {copy.viewTeam}
        </Link>
      </Card>
    </main>
  );
}

function TeamMemberProfileSkeleton() {
  const { language } = usePublicLanguage();
  const shell = publicShell(language);
  return (
    <SiteLayout actions={shell.actions} navigation={shell.navigation}>
      <main aria-busy="true" aria-label={language === 'km' ? 'កំពុងផ្ទុកប្រវត្តិរូបក្រុមការងារ' : 'Loading team member profile'} className="bg-white">
        <section className="bg-[#f7fafc] py-10 sm:py-12">
          <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 sm:px-6 md:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
            <div className="aspect-[15/16] animate-pulse rounded-xl bg-[#dfecef]" />
            <div className="space-y-4 py-8"><div className="h-3 w-32 animate-pulse rounded bg-[#d7e9ef]" /><div className="h-10 w-72 max-w-full animate-pulse rounded bg-[#d1e6ee]" /><div className="h-4 w-full max-w-xl animate-pulse rounded bg-[#e5f0f4]" /><div className="h-4 w-4/5 max-w-lg animate-pulse rounded bg-[#e5f0f4]" /></div>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

function TeamMemberProfileError({ onRetry }: { onRetry: () => void }) {
  const { language } = usePublicLanguage();
  const copy = profileCopy(language, '');
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f9fb] px-4">
      <Card className="max-w-lg p-8 text-center">
        <Badge>{language === 'km' ? 'មានបញ្ហា' : 'Something went wrong'}</Badge>
        <h1 className="mt-4 text-3xl font-black text-[#005687]">{language === 'km' ? 'មិនអាចផ្ទុកប្រវត្តិរូបបានទេ' : 'Profile unavailable'}</h1>
        <p className="mt-3 text-[#6b7280]">{language === 'km' ? 'សូមព្យាយាមម្ដងទៀត។' : 'Please try loading this team profile again.'}</p>
        <Button className="mt-6" onClick={onRetry} type="button">{language === 'km' ? 'ព្យាយាមម្ដងទៀត' : 'Try again'}</Button>
        <Link className="mt-4 block text-sm font-bold text-[#0d7596]" to="/team">{copy.viewTeam}</Link>
      </Card>
    </main>
  );
}

export function TeamMemberProfilePage() {
  const { memberSlug } = useParams();
  const { language } = usePublicLanguage();
  const { data: lookup, error, isError, isLoading, refetch } = useTeamMemberProfileQuery(memberSlug);
  const shell = publicShell(language);
  usePublicDocumentTitle(lookup?.member.name ?? (language === 'km' ? 'ក្រុមការងារ' : 'Our Team'));

  if (isLoading) return <TeamMemberProfileSkeleton />;
  if (isError && !isPublicNotFoundError(error)) return <TeamMemberProfileError onRetry={() => void refetch()} />;
  if (!lookup) {
    return <TeamMemberProfileEmpty />;
  }

  const { category, member, others } = lookup;
  const { profile } = member;

  return (
    <SiteLayout actions={shell.actions} navigation={shell.navigation}>
      <main>
        <TeamMemberHero category={category} member={member} />
        {profile.layout === 'clinical' ? (
          <ClinicalProfileBody name={member.name} profile={profile} />
        ) : (
          <SupportProfileBody name={member.name} profile={profile} />
        )}
        <OtherTeamMembers members={others} />
        {profile.layout === 'support' ? (
          profile.supportKind === 'reception' ? <SupportVisitCta /> : <TeamBackLink />
        ) : null}
      </main>
      <SiteFooter {...shell.footer} />
    </SiteLayout>
  );
}
