import { describe, expect, it } from 'vitest';
import { createDoctorSchema, updateDoctorSchema } from '@arunreah/shared';
import type { AdminDoctor } from '@/services/admin-doctors';
import {
  parsePhone,
  parseProcedures,
  parseSatisfaction,
  parseYearsExp,
  sanitizeDoctorCreatePayload,
  sanitizeDoctorUpdatePayload,
  sanitizeSlug,
} from './doctor-payload';

const baseDoctor: AdminDoctor = {
  id: 'doctor-1',
  name: 'Dr. Chea Kimly',
  nameKm: 'វេជ្ជបណ្ឌិត ជា គឹមលី',
  roleTitle: 'Multidisciplinary Clinician',
  roleTitleKm: 'វេជ្ជបណ្ឌិតធ្មេញពហុជំនាញ',
  specialty: 'Restorative & Endodontic Care',
  specialtyKm: 'ការថែទាំស្តារធ្មេញ និងព្យាបាលឫសធ្មេញ',
  shortIntro: 'Experienced dental clinician.',
  shortIntroKm: 'វេជ្ជបណ្ឌិតមានបទពិសោធន៍។',
  content: 'Full clinical background.',
  contentKm: 'ប្រវត្តិព្យាបាលលម្អិត។',
  status: 'published',
  showOnWebsite: true,
  featuredDoctor: false,
  displayOrder: 1,
  photoKey: 'doctors/ab2bcf1d-b3c4-4400-ad90-5a042b70b00d-kimly.jpg',
  yearsExp: '15+',
  procedures: '8k+',
  satisfaction: '99%',
  contactPhone: '+855 23 456 789',
  ctaButtonText: 'Book Consultation',
  updatedAt: '2026-03-01T00:00:00Z',
  seo: { slug: 'dr-chea-kimly' },
  expertiseItems: [
    { displayOrder: 0, titleEn: 'Restorative Dentistry', titleKm: 'ការស្តារធ្មេញ' },
  ],
  educationItems: [
    {
      displayOrder: 0,
      qualificationEn: 'DDS',
      qualificationKm: 'សញ្ញាបត្រទន្តបណ្ឌិត',
      institutionEn: 'University of Health Sciences',
      institutionKm: 'សាកលវិទ្យាល័យវិទ្យាសាស្ត្រសុខាភិបាល',
      yearLabel: '2012',
    },
  ],
  relatedDoctorIds: ['doctor-2'],
};

describe('doctor-payload parsing helpers', () => {
  it('parses years of experience safely', () => {
    expect(parseYearsExp('0')).toBe(0);
    expect(parseYearsExp('25+')).toBe(25);
    expect(parseYearsExp('150')).toBe(100);
    expect(parseYearsExp('')).toBeNull();
    expect(parseYearsExp('none')).toBeNull();
  });

  it('parses procedures counts with k suffixes and limits', () => {
    expect(parseProcedures('5000')).toBe(5000);
    expect(parseProcedures('5k+')).toBe(5000);
    expect(parseProcedures('3.5k')).toBe(3500);
    expect(parseProcedures('10k+')).toBe(10000);
    expect(parseProcedures('20,000,000')).toBe(10000000);
    expect(parseProcedures('')).toBeNull();
  });

  it('parses satisfaction percentages and clamps to 100', () => {
    expect(parseSatisfaction('99%')).toBe(99);
    expect(parseSatisfaction('100%')).toBe(100);
    expect(parseSatisfaction('120%')).toBe(100);
    expect(parseSatisfaction('0')).toBe(0);
    expect(parseSatisfaction('')).toBeNull();
  });

  it('parses phone numbers and rejects invalid formats', () => {
    expect(parsePhone('+855 23 456 789')).toBe('+855 23 456 789');
    expect(parsePhone('(855) 12-345-678')).toBe('(855) 12-345-678');
    expect(parsePhone('12345')).toBeNull(); // Less than 6 chars
    expect(parsePhone('call reception')).toBeNull();
    expect(parsePhone('')).toBeNull();
  });

  it('sanitizes URL slug correctly', () => {
    expect(sanitizeSlug('Dr. Chea Kimly')).toBe('dr-chea-kimly');
    expect(sanitizeSlug('   specialist-profile--- ')).toBe('specialist-profile');
    expect(sanitizeSlug('', 'Dr. Sreng Heng')).toBe('dr-sreng-heng');
  });
});

describe('sanitizeDoctorUpdatePayload', () => {
  it('produces a payload that strictly passes updateDoctorSchema', () => {
    const payload = sanitizeDoctorUpdatePayload(baseDoctor);
    const parsed = updateDoctorSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it('keeps an empty Khmer name so the shared schema can report the field error', () => {
    const payload = sanitizeDoctorUpdatePayload({
      ...baseDoctor,
      nameKm: '',
    });
    expect(payload.nameKm).toBe('');
    const parsed = updateDoctorSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues[0]?.path).toEqual(['nameKm']);
  });

  it('sanitizes local assets or full URLs for photoKey', () => {
    const withLocalAsset = sanitizeDoctorUpdatePayload({
      ...baseDoctor,
      photoKey: '/assets/landing/doctor-sreng-heng.jpg',
    });
    expect(withLocalAsset.photoKey).toBeNull();

    const withFullUrl = sanitizeDoctorUpdatePayload({
      ...baseDoctor,
      photoKey: 'https://cdn.example.com/doctors/ab2bcf1d-b3c4-4400-ad90-5a042b70b00d-sreng-heng.jpg',
    });
    expect(withFullUrl.photoKey).toBe('doctors/ab2bcf1d-b3c4-4400-ad90-5a042b70b00d-sreng-heng.jpg');
  });

  it('filters fully empty expertise and education rows while preserving bilingual validation errors', () => {
    const payload = sanitizeDoctorUpdatePayload({
      ...baseDoctor,
      expertiseItems: [
        { displayOrder: 0, titleEn: 'Cosmetic Dentistry', titleKm: '' },
        { displayOrder: 1, titleEn: '', titleKm: '' }, // blank row to prune
      ],
      educationItems: [
        {
          displayOrder: 0,
          qualificationEn: 'BDS',
          qualificationKm: '',
          institutionEn: 'Dental School',
          institutionKm: '',
          yearLabel: null,
        },
        {
          displayOrder: 1,
          qualificationEn: '',
          qualificationKm: '',
          institutionEn: '',
          institutionKm: '',
          yearLabel: null,
        }, // blank row to prune
      ],
    });

    expect(payload.expertise).toHaveLength(1);
    expect(payload.expertise?.[0]?.titleKm).toBe('');

    expect(payload.education).toHaveLength(1);
    expect(payload.education?.[0]?.qualificationKm).toBe('');
    expect(payload.education?.[0]?.institutionKm).toBe('');

    const parsed = updateDoctorSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues.map((issue) => issue.path.join('.'))).toEqual(expect.arrayContaining(['expertise.0.titleKm', 'education.0.qualificationKm', 'education.0.institutionKm']));
  });

  it('forces non-clinical categories to be non-bookable without dropping hidden profile data', () => {
    const payload = sanitizeDoctorUpdatePayload({
      ...baseDoctor,
      category: 'RECEPTIONIST',
      bookable: true,
      profileItems: [{ kind: 'RESPONSIBILITY', icon: 'welcome', titleEn: 'Welcome patients', titleKm: 'ស្វាគមន៍អ្នកជំងឺ', subtitleEn: null, subtitleKm: null, meta: null, displayOrder: 0 }],
      expertiseItems: [],
      educationItems: [],
    });
    expect(payload.bookable).toBe(false);
    expect(payload.profileItems).toHaveLength(1);
    expect(updateDoctorSchema.safeParse(payload).success).toBe(true);
  });

  it('builds a strict create payload with the selected category and profile items', () => {
    const payload = sanitizeDoctorCreatePayload({
      ...baseDoctor,
      id: '',
      category: 'GENERAL_PRACTITIONER',
      profileItems: [{ kind: 'EXPERIENCE', icon: null, titleEn: 'Community medicine', titleKm: 'វេជ្ជសាស្ត្រសហគមន៍', subtitleEn: 'Five years', subtitleKm: 'ប្រាំឆ្នាំ', meta: null, displayOrder: 0 }],
    });
    expect(payload.category).toBe('GENERAL_PRACTITIONER');
    expect(payload.profileItems).toHaveLength(1);
    expect(createDoctorSchema.safeParse(payload).success).toBe(true);
  });

  it('filters self-referencing related doctor IDs', () => {
    const payload = sanitizeDoctorUpdatePayload({
      ...baseDoctor,
      id: 'doc-self',
      relatedDoctorIds: ['doc-self', 'doc-other'],
    });

    expect(payload.relatedDoctorIds).toEqual(['doc-other']);
  });

  it('synchronizes showOnWebsite toggle with status', () => {
    const draftWhenHidden = sanitizeDoctorUpdatePayload({
      ...baseDoctor,
      status: 'published',
      showOnWebsite: false,
    });
    expect(draftWhenHidden.status).toBe('DRAFT');

    const publishedWhenVisible = sanitizeDoctorUpdatePayload({
      ...baseDoctor,
      status: 'draft',
      showOnWebsite: true,
    });
    expect(publishedWhenVisible.status).toBe('PUBLISHED');

    const archivedPreserved = sanitizeDoctorUpdatePayload({
      ...baseDoctor,
      status: 'archived',
      showOnWebsite: false,
    });
    expect(archivedPreserved.status).toBe('ARCHIVED');
  });

  it('allows empty statistics and contact phone as null values that pass updateDoctorSchema', () => {
    const payload = sanitizeDoctorUpdatePayload({
      ...baseDoctor,
      yearsExp: '',
      procedures: '',
      satisfaction: '',
      contactPhone: '',
    });

    expect(payload.yearsExperience).toBeNull();
    expect(payload.successfulProcedures).toBeNull();
    expect(payload.patientSatisfaction).toBeNull();
    expect(payload.phone).toBeNull();

    const parsed = updateDoctorSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });
});
