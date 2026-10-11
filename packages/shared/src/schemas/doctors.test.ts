import { describe, expect, it } from 'vitest';
import {
  adminDoctorListQuerySchema,
  createDoctorSchema,
  isClinicalTeamCategory,
  publicDoctorQuerySchema,
  teamCategoryValues,
  updateDoctorSchema,
} from './doctors';

const baseDoctor = {
  slug: 'cms-team-member',
  nameEn: 'CMS Team Member',
  nameKm: 'សមាជិកក្រុម CMS',
};

describe('team categories', () => {
  it('exposes exactly the four public categories', () => {
    expect(teamCategoryValues).toEqual([
      'DENTIST',
      'GENERAL_PRACTITIONER',
      'RECEPTIONIST',
      'ASSISTANT',
    ]);
  });

  it('treats only dentists and general practitioners as clinical', () => {
    expect(isClinicalTeamCategory('DENTIST')).toBe(true);
    expect(isClinicalTeamCategory('GENERAL_PRACTITIONER')).toBe(true);
    expect(isClinicalTeamCategory('RECEPTIONIST')).toBe(false);
    expect(isClinicalTeamCategory('ASSISTANT')).toBe(false);
  });

  it('defaults a new record to a bookable dentist', () => {
    const parsed = createDoctorSchema.parse(baseDoctor);
    expect(parsed.category).toBe('DENTIST');
    expect(parsed.bookable).toBe(true);
  });
});

describe('bookable refinement', () => {
  it.each(['RECEPTIONIST', 'ASSISTANT'] as const)('rejects a bookable %s on create', (category) => {
    const parsed = createDoctorSchema.safeParse({ ...baseDoctor, category, bookable: true });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.path).toEqual(['bookable']);
    }
  });

  it.each(['RECEPTIONIST', 'ASSISTANT'] as const)('accepts a non-bookable %s', (category) => {
    expect(createDoctorSchema.safeParse({ ...baseDoctor, category, bookable: false }).success).toBe(
      true,
    );
  });

  it.each(['DENTIST', 'GENERAL_PRACTITIONER'] as const)('accepts a bookable %s', (category) => {
    expect(createDoctorSchema.safeParse({ ...baseDoctor, category, bookable: true }).success).toBe(
      true,
    );
  });

  it('rejects the same combination on update', () => {
    expect(updateDoctorSchema.safeParse({ category: 'RECEPTIONIST', bookable: true }).success).toBe(
      false,
    );
  });

  it('cannot decide a partial update that omits one side', () => {
    // Both of these must be re-checked against the stored record in the service
    // layer; Zod alone cannot see the other half of the pair.
    expect(updateDoctorSchema.safeParse({ bookable: true }).success).toBe(true);
    expect(updateDoctorSchema.safeParse({ category: 'RECEPTIONIST' }).success).toBe(true);
  });
});

describe('profile items', () => {
  const responsibility = {
    kind: 'RESPONSIBILITY' as const,
    icon: 'appointments' as const,
    titleEn: 'Appointment coordination',
    titleKm: 'រៀបចំការណាត់ជួប',
  };

  it('accepts a responsibility with an icon', () => {
    const parsed = createDoctorSchema.safeParse({
      ...baseDoctor,
      category: 'RECEPTIONIST',
      bookable: false,
      profileItems: [responsibility],
    });
    expect(parsed.success).toBe(true);
  });

  it('requires an icon on a responsibility', () => {
    const parsed = createDoctorSchema.safeParse({
      ...baseDoctor,
      category: 'RECEPTIONIST',
      bookable: false,
      profileItems: [{ ...responsibility, icon: undefined }],
    });
    expect(parsed.success).toBe(false);
  });

  it('refuses an icon on a non-responsibility item', () => {
    const parsed = createDoctorSchema.safeParse({
      ...baseDoctor,
      profileItems: [
        { kind: 'TRAINING', icon: 'hygiene', titleEn: 'Sterilisation', titleKm: 'សម្លាប់មេរោគ' },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects an unknown icon', () => {
    const parsed = createDoctorSchema.safeParse({
      ...baseDoctor,
      profileItems: [{ ...responsibility, icon: 'stethoscope' }],
    });
    expect(parsed.success).toBe(false);
  });

  it('defaults displayOrder to 0', () => {
    const parsed = createDoctorSchema.parse({
      ...baseDoctor,
      profileItems: [{ kind: 'LANGUAGE', titleEn: 'Khmer', titleKm: 'ខ្មែរ' }],
    });
    expect(parsed.profileItems[0]?.displayOrder).toBe(0);
  });
});

describe('list queries', () => {
  it('leaves category unfiltered when the public query says nothing', () => {
    const parsed = publicDoctorQuerySchema.parse({});
    expect(parsed.lang).toBe('en');
    expect(parsed.category).toBeUndefined();
  });

  it('accepts a public category filter', () => {
    expect(publicDoctorQuerySchema.parse({ category: 'ASSISTANT' }).category).toBe('ASSISTANT');
  });

  it('rejects an unknown or legacy filter', () => {
    expect(publicDoctorQuerySchema.safeParse({ scope: 'everything' }).success).toBe(false);
    expect(publicDoctorQuerySchema.safeParse({ category: 'NURSE' }).success).toBe(false);
  });

  it('accepts a category filter on the admin list', () => {
    expect(adminDoctorListQuerySchema.parse({ category: 'RECEPTIONIST' }).category).toBe(
      'RECEPTIONIST',
    );
  });

  it('parses explicit public and admin bookable filters', () => {
    expect(publicDoctorQuerySchema.parse({ bookable: 'true' }).bookable).toBe(true);
    expect(adminDoctorListQuerySchema.parse({ bookable: 'false' }).bookable).toBe(false);
  });
});
