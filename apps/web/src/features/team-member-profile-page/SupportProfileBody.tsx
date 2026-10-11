import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContentBlocks } from '@/components/layout/public-ui';
import {
  teamSectionAnchor,
  type SupportMemberProfile,
  type TeamMemberResponsibility,
} from '@/features/doctors-page/team-directory';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { profileCopy } from './profile-copy';
import { ProfileLineIcon, profileSectionEyebrow, profileSectionTitle } from './profile-ui';

function ResponsibilityIcon({ icon }: { icon: TeamMemberResponsibility['icon'] }) {
  return (
    <ProfileLineIcon>
      {icon === 'appointments' ? (
        <>
          <rect height="16" rx="2" width="18" x="3" y="5" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </>
      ) : null}
      {icon === 'welcome' ? (
        <>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
        </>
      ) : null}
      {icon === 'enquiries' ? (
        <>
          <path d="M20.5 12a8 8 0 0 1-8 8H8l-4 3v-5.4A8 8 0 1 1 20.5 12Z" />
          <path d="M10.3 9.6a2.1 2.1 0 0 1 3.9.8c0 1.4-1.9 1.6-1.9 2.9" />
          <path d="M12.3 16.1h.01" />
        </>
      ) : null}
      {icon === 'communication' ? (
        <path d="M6.6 3.5h2.9l1.5 3.9-2 1.5a12 12 0 0 0 6.1 6.1l1.5-2 3.9 1.5v2.9a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
      ) : null}
      {icon === 'support' ? (
        <>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3 19c0-3 2.7-5.4 6-5.4s6 2.4 6 5.4" />
          <path d="M16 5.3a3.2 3.2 0 0 1 0 6.1" />
          <path d="M18.2 13.9c1.9.9 3.2 2.7 3.2 5.1" />
        </>
      ) : null}
      {icon === 'equipment' ? (
        <>
          <rect height="12" rx="2" width="18" x="3" y="8" />
          <path d="M8.5 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" />
          <path d="M12 11.5v5M9.5 14h5" />
        </>
      ) : null}
      {icon === 'comfort' ? (
        <path d="M12 20s-7-4.6-7-9.3A4 4 0 0 1 12 8.2 4 4 0 0 1 19 10.7C19 15.4 12 20 12 20Z" />
      ) : null}
      {icon === 'hygiene' ? (
        <>
          <path d="M12 3 4.5 6v6c0 4.4 3.1 7.6 7.5 9 4.4-1.4 7.5-4.6 7.5-9V6L12 3Z" />
          <path d="m9 12 2.2 2.2L15.5 10" />
        </>
      ) : null}
      {icon === 'records' ? (
        <>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
          <path d="M14 3v5h5" />
          <path d="M8.5 13h7M8.5 16.5h4.5" />
        </>
      ) : null}
    </ProfileLineIcon>
  );
}

function ResponsibilityCard({ responsibility }: { responsibility: TeamMemberResponsibility }) {
  return (
    <Card className="flex h-full flex-col rounded-xl border-[#e1ebef] bg-white p-5 shadow-none transition-colors hover:border-[#c9e2eb]">
      <ResponsibilityIcon icon={responsibility.icon} />
      <h3 className="mt-4 text-[15px] font-extrabold leading-5 text-[#005687]">
        {responsibility.title}
      </h3>
      <p className="mt-1.5 text-[13px] font-normal leading-5 text-[#64748b]">
        {responsibility.description}
      </p>
    </Card>
  );
}

export function SupportProfileBody({
  name,
  profile,
}: {
  name: string;
  profile: SupportMemberProfile;
}) {
  const { language } = usePublicLanguage();
  const copy = profileCopy(language, name);
  const { languages, responsibilities, supportKind, teamConnection, training } = profile;
  const isClinical = supportKind === 'clinical';

  return (
    <>
      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-[#e3edf1] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-[#3695B9]" />
              <p className={profileSectionEyebrow}>{copy.meetEyebrow}</p>
            </div>
            <h2 className="mt-3 text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]">
              {isClinical ? copy.aboutAssistant : copy.meet}
            </h2>
            <ContentBlocks
              className="mt-4 max-w-[800px] space-y-4 text-[16px] font-normal leading-7 text-[#526879]"
              value={profile.about.join('\n\n')}
            />
          </section>

          {responsibilities.length > 0 ? (
            <section className="mt-12">
              <p className={profileSectionEyebrow}>
                {isClinical ? copy.clinicalSupportEyebrow : copy.helpEyebrow}
              </p>
              <h2 className={profileSectionTitle}>
                {isClinical ? copy.clinicalSupport : copy.help}
              </h2>
              <div
                className={`mt-6 grid gap-4 sm:grid-cols-2 ${
                  responsibilities.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
                }`}
              >
                {responsibilities.map((responsibility) => (
                  <ResponsibilityCard key={responsibility.id} responsibility={responsibility} />
                ))}
              </div>
            </section>
          ) : null}

          {languages && languages.length > 0 ? (
            <section className="mt-12">
              <p className={profileSectionEyebrow}>{copy.languagesEyebrow}</p>
              <h2 className={profileSectionTitle}>{copy.languages}</h2>
              <Card className="mt-5 max-w-[640px] rounded-2xl border-[#dcebf0] bg-[#f8fcfd] p-5 shadow-none sm:p-6">
                <p className="text-[14px] font-normal leading-6 text-[#607486]">
                  {copy.languagesBody}
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {languages.map((item) => (
                    <li
                      className="inline-flex min-h-8 items-center rounded-full border border-[#d4e7ef] bg-white px-3.5 text-[13px] font-bold leading-5 text-[#005687]"
                      key={item}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          ) : null}

          {training && training.length > 0 ? (
            <section className="mt-12">
              <p className={profileSectionEyebrow}>{copy.trainingEyebrow}</p>
              <h2 className={profileSectionTitle}>{copy.training}</h2>
              <Card className="mt-5 max-w-[760px] rounded-2xl border-[#dcebf0] bg-[#f8fcfd] p-5 shadow-none sm:p-6">
                <ul className="space-y-4">
                  {training.map((item) => (
                    <li className="flex gap-3" key={item.id}>
                      <svg
                        aria-hidden="true"
                        className="mt-0.5 size-[18px] shrink-0 text-[#0d7596]"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="m8.5 12.2 2.4 2.4 4.6-4.8" />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-[14px] font-extrabold leading-5 text-[#005687]">
                          {item.title}
                        </p>
                        {item.detail ? (
                          <p className="mt-0.5 text-[13px] font-medium leading-5 text-[#64748b]">
                            {item.detail}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          ) : null}

          {teamConnection ? (
            <section className="mt-12">
              <p className={profileSectionEyebrow}>{copy.teamConnectionEyebrow}</p>
              <h2 className={profileSectionTitle}>{copy.teamConnection}</h2>
              <Card className="mt-5 rounded-2xl border-[#e3edf1] bg-white p-6 shadow-none sm:p-8">
                {teamConnection.department ? (
                  <dl className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                    <dt className="ui-eyebrow text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#0d7596]">
                      {copy.department}
                    </dt>
                    <dd className="text-[14px] font-bold leading-5 text-[#005687]">
                      {teamConnection.department}
                    </dd>
                  </dl>
                ) : null}
                <p className="mt-3 max-w-[720px] text-[15px] font-normal leading-7 text-[#526879]">
                  {teamConnection.note}
                </p>
                <Link
                  className="mt-4 inline-flex min-h-9 items-center gap-2 text-[13px] font-bold text-[#0d7596] transition hover:text-[#005687] focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3695B9]"
                  to={`/team#${teamSectionAnchor('dentists')}`}
                >
                  {copy.viewDentists}
                  <span aria-hidden="true">→</span>
                </Link>
              </Card>
            </section>
          ) : null}
        </div>
      </section>
    </>
  );
}

/** Quiet closing step for clinical support profiles. */
export function TeamBackLink() {
  const { language } = usePublicLanguage();
  const copy = profileCopy(language, '');

  return (
    <section className="border-t border-[#e7eff3] bg-white py-10 sm:py-12">
      <div className="mx-auto w-full max-w-[1280px] px-4 text-center sm:px-6 lg:px-8">
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d4e7ef] bg-white px-5 text-[14px] font-bold text-[#0d7596] transition hover:border-[#168aad] hover:bg-[#eef8fb] hover:text-[#005687] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168aad]"
          to="/team"
        >
          <span aria-hidden="true">←</span>
          {copy.backToTeam}
        </Link>
      </div>
    </section>
  );
}

/** Clinic-level contact block. Never a personal booking action. */
export function SupportVisitCta() {
  const navigate = useNavigate();
  const { language } = usePublicLanguage();
  const copy = profileCopy(language, '');

  return (
    <section className="border-t border-[#e7eff3] bg-white py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-[820px] rounded-2xl border-[#dcebf0] bg-[#f8fcfd] p-7 text-center shadow-none sm:p-10">
          <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]">
            {copy.visitTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-[560px] text-[15px] font-normal leading-7 text-[#607486]">
            {copy.visitBody}
          </p>
          <Button
            className="mt-6 min-h-[52px] rounded-full bg-[#0d7596] px-7 text-[15px] font-bold text-white shadow-[0_8px_18px_rgba(13,117,150,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#075d83] hover:shadow-[0_10px_22px_rgba(13,117,150,0.28)] active:translate-y-0"
            onClick={() => navigate('/contact')}
          >
            {copy.contactClinic}
          </Button>
        </Card>
      </div>
    </section>
  );
}
