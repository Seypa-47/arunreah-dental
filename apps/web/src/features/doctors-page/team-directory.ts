import type { ImagePresentation, TeamCategory as ApiTeamCategory } from '@arunreah/shared';
import { getPublicMediaUrl } from '@/services/media';
import type { PublicDoctorDetail, PublicDoctorProfileItem, PublicDoctorSummary } from '@/services/public-content';

export const TEAM_CATEGORY_IDS = ['dentists', 'general-practitioners', 'receptionists', 'assistants'] as const;
export type TeamCategoryId = (typeof TEAM_CATEGORY_IDS)[number];

export type TeamMemberQualification = { kind: 'degree' | 'training'; id: string; institution?: string; title: string; yearLabel?: string };
export type TeamMemberExperience = { id: string; organisation?: string; period?: string; role: string };
export type TeamMemberResponsibility = {
  icon: 'appointments' | 'comfort' | 'communication' | 'enquiries' | 'equipment' | 'hygiene' | 'records' | 'support' | 'welcome';
  description: string;
  id: string;
  title: string;
};
export type TeamMemberTraining = { detail?: string; id: string; title: string };
export type TeamMemberTeamConnection = { department?: string; note: string };
type TeamMemberProfileBase = { about: string[]; heroSummary: string; languages?: string[] };
export type ClinicalMemberProfile = TeamMemberProfileBase & {
  layout: 'clinical';
  areasOfCare: string[];
  bookingAvailable: boolean;
  experience: TeamMemberExperience[];
  qualifications: TeamMemberQualification[];
};
export type SupportMemberProfile = TeamMemberProfileBase & {
  layout: 'support';
  supportKind: 'clinical' | 'reception';
  responsibilities: TeamMemberResponsibility[];
  teamConnection?: TeamMemberTeamConnection;
  training?: TeamMemberTraining[];
};
export type TeamMemberProfile = ClinicalMemberProfile | SupportMemberProfile;
export type TeamMember = {
  roleTitle: string;
  responsibility?: string;
  id: string;
  imageAlt?: string;
  imagePresentation?: ImagePresentation;
  imageUrl?: string;
  name: string;
  department?: string;
  profile?: TeamMemberProfile;
  slug?: string;
};
export type TeamCategory = { description: string; eyebrow: string; id: TeamCategoryId; navLabel: string; title: string };
export type TeamDirectoryGroups = Record<TeamCategoryId, TeamMember[]>;
export type TeamMemberLookup = {
  category: TeamCategory;
  member: TeamMember & { profile: TeamMemberProfile; slug: string };
  others: TeamMember[];
};

export const TEAM_DIRECTORY_ANCHOR = 'team-directory';
const categoryIds: Record<ApiTeamCategory, TeamCategoryId> = {
  DENTIST: 'dentists',
  GENERAL_PRACTITIONER: 'general-practitioners',
  RECEPTIONIST: 'receptionists',
  ASSISTANT: 'assistants',
};

export function teamSectionAnchor(id: TeamCategoryId) { return `team-${id}`; }
export function teamMemberProfileHref(slug: string) { return `/team/${slug}`; }

export function teamDirectoryCopy(language: 'en' | 'km') {
  const isKm = language === 'km';
  return {
    allLabel: isKm ? 'ក្រុមទាំងអស់' : 'All Team',
    navLabel: isKm ? 'ផ្នែកនៃក្រុមការងារ' : 'Team categories',
    unavailableNotice: isKm ? 'មិនមានសមាជិកក្រុមដែលបានផ្សព្វផ្សាយនៅពេលនេះទេ។' : 'There are no published team members right now.',
    viewProfile: isKm ? 'មើលប្រវត្តិរូប' : 'View Profile',
  };
}

export function teamCategories(language: 'en' | 'km'): TeamCategory[] {
  const isKm = language === 'km';
  return [
    { id: 'dentists', navLabel: isKm ? 'ទន្តបណ្ឌិត' : 'Dentists', eyebrow: isKm ? 'ក្រុមព្យាបាល' : 'Clinical team', title: isKm ? 'ទន្តបណ្ឌិត' : 'Dentists', description: isKm ? 'ទន្តបណ្ឌិតដែលធ្វើរោគវិនិច្ឆ័យ រៀបចំផែនការ និងអនុវត្តការព្យាបាលធ្មេញរបស់អ្នក។' : 'The clinicians who examine, plan, and carry out your dental treatment.' },
    { id: 'general-practitioners', navLabel: isKm ? 'គ្រូពេទ្យទូទៅ' : 'General Practitioners', eyebrow: isKm ? 'ថែទាំសុខភាពទូទៅ' : 'Medical support', title: isKm ? 'គ្រូពេទ្យទូទៅ' : 'General Practitioners', description: isKm ? 'គ្រូពេទ្យទូទៅដែលពិនិត្យសុខភាពទូទៅ និងសម្របសម្រួលការថែទាំមុន និងក្រោយការព្យាបាល។' : 'General practitioners who review your overall health and coordinate care around treatment.' },
    { id: 'receptionists', navLabel: isKm ? 'បុគ្គលិកទទួលភ្ញៀវ' : 'Receptionists', eyebrow: isKm ? 'ការស្វាគមន៍ និងការណាត់ជួប' : 'Front desk', title: isKm ? 'បុគ្គលិកទទួលភ្ញៀវ' : 'Receptionists', description: isKm ? 'បុគ្គលិកដែលស្វាគមន៍អ្នក រៀបចំការណាត់ជួប និងឆ្លើយតបរាល់សំណួររបស់អ្នក។' : 'The team who welcome you, arrange appointments, and answer your questions.' },
    { id: 'assistants', navLabel: isKm ? 'ជំនួយការព្យាបាល' : 'Assistants', eyebrow: isKm ? 'ជំនួយក្បែរកៅអីព្យាបាល' : 'Chairside support', title: isKm ? 'ជំនួយការព្យាបាល' : 'Assistants', description: isKm ? 'ជំនួយការដែលរៀបចំបន្ទប់ និងឧបករណ៍ ហើយនៅក្បែរអ្នកពេញមួយដំណើរការព្យាបាល។' : 'Assistants who prepare the room and instruments and stay beside you throughout treatment.' },
  ];
}

function splitParagraphs(value: string | null): string[] {
  return value?.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean) ?? [];
}

function itemId(doctorId: string, item: PublicDoctorProfileItem, index: number): string {
  return `${doctorId}-${item.kind.toLowerCase()}-${item.displayOrder}-${index}`;
}

export function mapPublicDoctorSummaryToTeamMember(doctor: PublicDoctorSummary): TeamMember {
  return {
    id: doctor.id,
    slug: doctor.slug,
    name: doctor.name,
    roleTitle: doctor.title ?? doctor.specialty ?? '',
    responsibility: doctor.shortBio ?? doctor.specialty ?? undefined,
    department: doctor.department ?? undefined,
    imageAlt: doctor.name,
    imagePresentation: doctor.photoImagePresentation,
    imageUrl: getPublicMediaUrl(doctor.photoKey) ?? undefined,
  };
}

export function mapPublicDoctorDetailToTeamMember(doctor: PublicDoctorDetail): TeamMember & { profile: TeamMemberProfile; slug: string } {
  const member = mapPublicDoctorSummaryToTeamMember(doctor);
  const heroSummary = doctor.shortBio ?? doctor.about ?? '';
  const about = splitParagraphs(doctor.about);

  if (doctor.category === 'DENTIST' || doctor.category === 'GENERAL_PRACTITIONER') {
    return {
      ...member,
      slug: doctor.slug,
      profile: {
        layout: 'clinical',
        heroSummary,
        about,
        bookingAvailable: doctor.bookable,
        areasOfCare: doctor.expertise.map((item) => item.title),
        qualifications: doctor.education.map((item, index) => ({
          id: `${doctor.id}-qualification-${item.displayOrder}-${index}`,
          kind: index === 0 ? 'degree' : 'training',
          title: item.qualification,
          institution: item.institution || undefined,
          yearLabel: item.yearLabel ?? undefined,
        })),
        experience: doctor.profileItems.filter((item) => item.kind === 'EXPERIENCE').map((item, index) => ({
          id: itemId(doctor.id, item, index), role: item.title, organisation: item.subtitle ?? undefined, period: item.meta ?? undefined,
        })),
      },
    };
  }

  const responsibilities = doctor.profileItems.filter((item) => item.kind === 'RESPONSIBILITY');
  const languages = doctor.profileItems.filter((item) => item.kind === 'LANGUAGE').map((item) => item.title);
  const training = doctor.profileItems.filter((item) => item.kind === 'TRAINING');
  return {
    ...member,
    slug: doctor.slug,
    profile: {
      layout: 'support',
      heroSummary,
      about,
      supportKind: doctor.category === 'RECEPTIONIST' ? 'reception' : 'clinical',
      responsibilities: responsibilities.map((item, index) => ({ id: itemId(doctor.id, item, index), icon: item.icon ?? 'support', title: item.title, description: item.subtitle ?? '' })),
      ...(languages.length > 0 ? { languages } : {}),
      ...(training.length > 0 ? { training: training.map((item, index) => ({ id: itemId(doctor.id, item, index), title: item.title, detail: item.subtitle ?? undefined })) } : {}),
      ...(doctor.teamNote ? { teamConnection: { department: doctor.department ?? undefined, note: doctor.teamNote } } : {}),
    },
  };
}

export function mapPublicDoctorsToTeamDirectory(doctors: PublicDoctorSummary[]): TeamDirectoryGroups {
  const groups: TeamDirectoryGroups = { dentists: [], 'general-practitioners': [], receptionists: [], assistants: [] };
  for (const doctor of doctors) groups[categoryIds[doctor.category]].push(mapPublicDoctorSummaryToTeamMember(doctor));
  return groups;
}

export function findTeamMemberProfile(slug: string | undefined, detail: PublicDoctorDetail | undefined, team: PublicDoctorSummary[], language: 'en' | 'km'): TeamMemberLookup | null {
  if (!slug || !detail || detail.slug !== slug) return null;
  const categoryId = categoryIds[detail.category];
  const category = teamCategories(language).find((candidate) => candidate.id === categoryId);
  if (!category) return null;
  return {
    category,
    member: mapPublicDoctorDetailToTeamMember(detail),
    others: team.filter((candidate) => candidate.category === detail.category && candidate.slug !== slug).map(mapPublicDoctorSummaryToTeamMember),
  };
}
