import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContentBlocks } from '@/components/layout/public-ui';
import type {
  ClinicalMemberProfile,
  TeamMemberExperience,
  TeamMemberQualification,
} from '@/features/doctors-page/team-directory';
import { usePublicLanguage } from '@/features/public-content/public-language-provider';
import { profileCopy } from './profile-copy';
import { ProfileLineIcon, profileSectionEyebrow, profileSectionTitle } from './profile-ui';

function QualificationIcon({ kind }: { kind: TeamMemberQualification['kind'] }) {
  return (
    <ProfileLineIcon>
      {kind === 'degree' ? (
        <>
          <path d="M12 4 2.5 8.5 12 13l9.5-4.5L12 4Z" />
          <path d="M6.5 10.7v4.6c0 1.3 2.5 2.7 5.5 2.7s5.5-1.4 5.5-2.7v-4.6" />
          <path d="M21.5 8.5v5" />
        </>
      ) : (
        <>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
          <path d="M14 3v5h5" />
          <path d="m8.5 13.8 2 2 3.5-3.6" />
        </>
      )}
    </ProfileLineIcon>
  );
}

function QualificationCard({ qualification }: { qualification: TeamMemberQualification }) {
  return (
    <Card className="group relative flex min-h-[92px] gap-3 rounded-xl border-[#e1ebef] bg-white p-4 shadow-none transition-colors hover:border-[#c9e2eb]">
      <QualificationIcon kind={qualification.kind} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] font-extrabold leading-5 text-[#005687]">
            {qualification.title}
          </h3>
          {qualification.yearLabel ? (
            <span className="shrink-0 rounded-full bg-[#eef8fb] px-2 py-0.5 text-[11px] font-extrabold leading-4 text-[#0d7596]">
              {qualification.yearLabel}
            </span>
          ) : null}
        </div>
        {qualification.institution ? (
          <p className="mt-1 text-[13px] font-medium leading-5 text-[#64748b]">
            {qualification.institution}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

function ExperienceTimeline({ items }: { items: TeamMemberExperience[] }) {
  return (
    <ol className="mt-5">
      {items.map((item, index) => (
        <li className="flex gap-4 pb-5 last:pb-0" key={item.id}>
          <div aria-hidden="true" className="flex flex-col items-center">
            <span className="mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-[#3695B9] bg-white" />
            {index < items.length - 1 ? <span className="mt-1 w-px flex-1 bg-[#dcebf0]" /> : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-extrabold leading-5 text-[#005687]">{item.role}</p>
            {item.organisation ? (
              <p className="mt-0.5 text-[13px] font-medium leading-5 text-[#64748b]">
                {item.organisation}
              </p>
            ) : null}
            {item.period ? (
              <p className="mt-1 text-[12px] font-semibold leading-4 text-[#0d7596]">
                {item.period}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function AreasOfCareList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item) => (
        <li
          className="flex items-start gap-3 text-[14px] font-medium leading-6 text-[#64748b]"
          key={item}
        >
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#3695B9]" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ClinicalProfileBody({
  name,
  profile,
}: {
  name: string;
  profile: ClinicalMemberProfile;
}) {
  const navigate = useNavigate();
  const { language } = usePublicLanguage();
  const copy = profileCopy(language, name);
  const { areasOfCare, bookingAvailable, experience, qualifications } = profile;

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 lg:px-8">
        <div className="min-w-0">
          <section className="rounded-2xl border border-[#e3edf1] bg-white p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-[#3695B9]" />
              <p className={profileSectionEyebrow}>{copy.profileEyebrow}</p>
            </div>
            <h2 className="mt-3 text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-[#005687] sm:text-[28px]">
              {copy.about}
            </h2>
            <ContentBlocks
              className="mt-4 max-w-[800px] space-y-4 text-[16px] font-normal leading-7 text-[#526879]"
              value={profile.about.join('\n\n')}
            />
          </section>

          {qualifications.length > 0 ? (
            <section className="mt-8">
              <p className={profileSectionEyebrow}>{copy.qualificationsEyebrow}</p>
              <h2 className={profileSectionTitle}>{copy.qualifications}</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {qualifications.map((qualification) => (
                  <QualificationCard key={qualification.id} qualification={qualification} />
                ))}
              </div>
            </section>
          ) : null}

          {experience.length > 0 ? (
            <section className="mt-8 border-t border-[#e7eff3] pt-8">
              <p className={profileSectionEyebrow}>{copy.experienceEyebrow}</p>
              <h2 className={profileSectionTitle}>{copy.experience}</h2>
              <ExperienceTimeline items={experience} />
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {areasOfCare.length > 0 ? (
            <Card className="overflow-hidden rounded-2xl border-[#dcebf0] bg-[#f8fcfd] p-0 shadow-none">
              <div className="border-b border-[#dcebf0] bg-[#edf8fb] px-5 py-4">
                <p className={profileSectionEyebrow}>{copy.areasEyebrow}</p>
                <h2 className="mt-1 text-[19px] font-extrabold leading-6 text-[#005687]">
                  {copy.areas}
                </h2>
              </div>
              <div className="p-5">
                <AreasOfCareList items={areasOfCare} />
              </div>
            </Card>
          ) : null}
          {bookingAvailable ? (
            <Card className="rounded-2xl !border-transparent !bg-[#167ea7] p-5 text-white shadow-none">
              <h2 className="text-[18px] font-extrabold leading-6">{copy.appointment}</h2>
              <p className="mt-2 text-[14px] font-normal leading-6 text-white/85">
                {copy.appointmentBody}
              </p>
              <Button
                className="mt-4 min-h-12 w-full rounded-full border-none !bg-white text-[14px] font-bold !text-[#0d7596] shadow-none hover:!bg-[#eef8fb] sm:min-h-11"
                onClick={() => navigate('/book-appointment')}
                variant="secondary"
              >
                {copy.requestAppointment}
              </Button>
            </Card>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
