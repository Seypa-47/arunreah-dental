import { describe, expect, it } from 'vitest';
import type { TeamCategory } from '@arunreah/shared';
import type { PublicDoctorDetail, PublicDoctorSummary } from '@/services/public-content';
import {
  TEAM_CATEGORY_IDS,
  findTeamMemberProfile,
  mapPublicDoctorDetailToTeamMember,
  mapPublicDoctorsToTeamDirectory,
  teamCategories,
  teamMemberProfileHref,
  teamSectionAnchor,
} from './team-directory';

function summary(category: TeamCategory, overrides: Partial<PublicDoctorSummary> = {}): PublicDoctorSummary {
  return {
    id: `member-${category}`,
    slug: `member-${category.toLowerCase()}`,
    name: 'CMS Team Member',
    title: 'CMS Role',
    specialty: null,
    shortBio: 'CMS-managed introduction.',
    photoKey: null,
    featured: false,
    category,
    bookable: category === 'DENTIST' || category === 'GENERAL_PRACTITIONER',
    department: null,
    teamNote: null,
    profileItems: [],
    ...overrides,
  };
}

function detail(category: TeamCategory, overrides: Partial<PublicDoctorDetail> = {}): PublicDoctorDetail {
  return {
    ...summary(category),
    about: 'First CMS paragraph.\n\nSecond CMS paragraph.',
    statistics: { yearsExperience: null, successfulProcedures: null, patientSatisfaction: null },
    expertise: [],
    education: [],
    relatedDoctors: [],
    ...overrides,
  };
}

describe('team category copy', () => {
  it.each(['en', 'km'] as const)('keeps visible static copy for all four categories in %s', (language) => {
    const categories = teamCategories(language);
    expect(categories.map((category) => category.id)).toEqual(TEAM_CATEGORY_IDS);
    for (const category of categories) {
      expect(category.navLabel.trim()).not.toBe('');
      expect(category.eyebrow.trim()).not.toBe('');
      expect(category.title.trim()).not.toBe('');
      expect(category.description.trim()).not.toBe('');
    }
  });

  it('builds stable anchors and profile links', () => {
    expect(new Set(TEAM_CATEGORY_IDS.map(teamSectionAnchor)).size).toBe(4);
    expect(teamMemberProfileHref('cms-member')).toBe('/team/cms-member');
  });
});

describe('public team mappers', () => {
  it('groups API summaries without inventing missing categories', () => {
    const groups = mapPublicDoctorsToTeamDirectory([
      summary('GENERAL_PRACTITIONER'),
      summary('ASSISTANT'),
    ]);
    expect(groups.dentists).toEqual([]);
    expect(groups['general-practitioners']).toHaveLength(1);
    expect(groups.receptionists).toEqual([]);
    expect(groups.assistants).toHaveLength(1);
  });

  it.each(['DENTIST', 'GENERAL_PRACTITIONER'] as const)('maps %s to the clinical profile union', (category) => {
    const member = mapPublicDoctorDetailToTeamMember(detail(category, {
      expertise: [{ title: 'Area of care', displayOrder: 0 }],
      education: [{ qualification: 'Qualification', institution: 'Institution', yearLabel: '2024', displayOrder: 0 }],
      profileItems: [{ kind: 'EXPERIENCE', icon: null, title: 'Clinical role', subtitle: 'Organisation', meta: '2020–2024', displayOrder: 0 }],
    }));
    expect(member.profile).toMatchObject({
      layout: 'clinical',
      bookingAvailable: true,
      areasOfCare: ['Area of care'],
      experience: [{ role: 'Clinical role', organisation: 'Organisation', period: '2020–2024' }],
      qualifications: [{ title: 'Qualification', institution: 'Institution', yearLabel: '2024' }],
    });
  });

  it('maps a receptionist to reception support responsibilities and languages', () => {
    const member = mapPublicDoctorDetailToTeamMember(detail('RECEPTIONIST', {
      bookable: false,
      profileItems: [
        { kind: 'RESPONSIBILITY', icon: 'welcome', title: 'Welcome', subtitle: 'Welcome patients.', meta: null, displayOrder: 0 },
        { kind: 'RESPONSIBILITY', icon: null, title: 'Other support', subtitle: null, meta: null, displayOrder: 1 },
        { kind: 'LANGUAGE', icon: null, title: 'Khmer', subtitle: null, meta: null, displayOrder: 2 },
      ],
    }));
    expect(member.profile).toMatchObject({
      layout: 'support',
      supportKind: 'reception',
      responsibilities: [
        { icon: 'welcome', title: 'Welcome', description: 'Welcome patients.' },
        { icon: 'support', title: 'Other support', description: '' },
      ],
      languages: ['Khmer'],
    });
  });

  it('maps an assistant to clinical support training and team connection', () => {
    const member = mapPublicDoctorDetailToTeamMember(detail('ASSISTANT', {
      bookable: false,
      department: 'Clinical support',
      teamNote: 'Works with the clinical team.',
      profileItems: [
        { kind: 'TRAINING', icon: null, title: 'Safety training', subtitle: 'Clinic programme', meta: null, displayOrder: 0 },
      ],
    }));
    expect(member.profile).toMatchObject({
      layout: 'support',
      supportKind: 'clinical',
      training: [{ title: 'Safety training', detail: 'Clinic programme' }],
      teamConnection: { department: 'Clinical support', note: 'Works with the clinical team.' },
    });
  });

  it('resolves a profile only from fetched detail and list data', () => {
    const current = detail('RECEPTIONIST');
    const colleague = summary('RECEPTIONIST', { id: 'colleague', slug: 'colleague' });
    const lookup = findTeamMemberProfile(current.slug, current, [current, colleague, summary('ASSISTANT')], 'en');
    expect(lookup?.category.id).toBe('receptionists');
    expect(lookup?.member.slug).toBe(current.slug);
    expect(lookup?.others.map((member) => member.slug)).toEqual(['colleague']);
    expect(findTeamMemberProfile('different-slug', current, [current], 'en')).toBeNull();
    expect(findTeamMemberProfile(undefined, current, [current], 'en')).toBeNull();
  });
});
