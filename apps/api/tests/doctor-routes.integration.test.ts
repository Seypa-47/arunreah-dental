import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedAdmin } from '../src/types/auth';
import type { Bindings } from '../src/types/env';

type DoctorRecord = {
  id: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  displayOrder: number;
  nameEn: string;
  nameKm: string;
  roleEn: string | null;
  roleKm: string | null;
  specialtyEn: string | null;
  specialtyKm: string | null;
  shortBioEn: string | null;
  shortBioKm: string | null;
  biographyEn: string | null;
  biographyKm: string | null;
  photoKey: string | null;
  yearsExperience: number | null;
  successfulProcedures: number | null;
  patientSatisfaction: number | null;
  phone: string | null;
  category: 'DENTIST' | 'GENERAL_PRACTITIONER' | 'RECEPTIONIST' | 'ASSISTANT';
  bookable: boolean;
  departmentEn: string | null;
  departmentKm: string | null;
  teamNoteEn: string | null;
  teamNoteKm: string | null;
  createdAt: string;
  updatedAt: string;
};

type SessionRecord = {
  sessionId: string;
  adminId: string;
  displayName: string;
  email: string;
  role: AuthenticatedAdmin['role'];
};

type DoctorInput = Partial<DoctorRecord> & {
  titleEn?: string | null;
  titleKm?: string | null;
  aboutEn?: string | null;
  aboutKm?: string | null;
  expertise?: Array<Record<string, unknown>>;
  education?: Array<Record<string, unknown>>;
  profileItems?: Array<Record<string, unknown>>;
  relatedDoctorIds?: string[];
  branchIds?: string[];
};

const state = vi.hoisted(() => ({
  doctors: [] as DoctorRecord[],
  expertise: new Map<string, Array<Record<string, unknown>>>(),
  education: new Map<string, Array<Record<string, unknown>>>(),
  profileItems: new Map<string, Array<Record<string, unknown>>>(),
  related: new Map<string, string[]>(),
  branches: new Map<string, string[]>(),
  sessions: new Map<string, SessionRecord>(),
  appointmentDoctorIds: new Set<string>(),
}));

vi.mock('../src/db/client', () => ({ createDbClient: () => ({}) }));
vi.mock('../src/repositories/branch.repository', () => ({
  branchesExist: async (_database: unknown, ids: string[]) => ids.map((id) => ({ id })),
}));
vi.mock('../src/repositories/session.repository', () => ({
  findAuthenticatedSession: async (_database: unknown, tokenHash: string) =>
    state.sessions.get(tokenHash),
  createAdminSession: async () => undefined,
  revokeAdminSession: async () => undefined,
  getLoginRateLimit: async () => undefined,
  saveLoginRateLimit: async () => undefined,
  clearLoginRateLimit: async () => undefined,
}));
vi.mock('../src/repositories/doctor.repository', () => ({
  findDoctorById: async (_database: unknown, id: string) =>
    state.doctors.find((doctor) => doctor.id === id),
  findDoctorBySlug: async (_database: unknown, slug: string) =>
    state.doctors.find((doctor) => doctor.slug === slug),
  findPublicDoctorBySlug: async (_database: unknown, slug: string) =>
    state.doctors.find((doctor) => doctor.slug === slug && doctor.status === 'PUBLISHED'),
  createDoctor: async (_database: unknown, input: DoctorInput) => {
    const doctor = {
      ...doctorFixture({
        id: `550e8400-e29b-41d4-a716-${String(446655440503 + state.doctors.length).padStart(12, '0')}`,
        slug: input.slug ?? 'new',
      }),
      ...input,
      roleEn: input.titleEn as string | null | undefined,
      roleKm: input.titleKm as string | null | undefined,
      biographyEn: input.aboutEn as string | null | undefined,
      biographyKm: input.aboutKm as string | null | undefined,
    } as DoctorRecord;
    state.doctors.push(doctor);
    state.expertise.set(doctor.id, input.expertise ?? []);
    state.education.set(doctor.id, input.education ?? []);
    state.profileItems.set(doctor.id, input.profileItems ?? []);
    state.related.set(doctor.id, input.relatedDoctorIds ?? []);
    state.branches.set(doctor.id, input.branchIds ?? []);
    return doctor;
  },
  updateDoctor: async (_database: unknown, id: string, input: DoctorInput) => {
    const doctor = state.doctors.find((item) => item.id === id);
    if (!doctor) return undefined;
    const {
      expertise,
      education,
      profileItems,
      relatedDoctorIds,
      branchIds,
      titleEn,
      titleKm,
      aboutEn,
      aboutKm,
      ...updates
    } = input;
    Object.assign(doctor, updates);
    if (titleEn !== undefined) doctor.roleEn = titleEn as string | null;
    if (titleKm !== undefined) doctor.roleKm = titleKm as string | null;
    if (aboutEn !== undefined) doctor.biographyEn = aboutEn as string | null;
    if (aboutKm !== undefined) doctor.biographyKm = aboutKm as string | null;
    if (expertise !== undefined) state.expertise.set(id, expertise);
    if (education !== undefined) state.education.set(id, education);
    if (profileItems !== undefined) state.profileItems.set(id, profileItems);
    if (relatedDoctorIds !== undefined) state.related.set(id, relatedDoctorIds);
    if (branchIds !== undefined) state.branches.set(id, branchIds);
    return doctor;
  },
  getExpertise: async (_database: unknown, id: string) => state.expertise.get(id) ?? [],
  getEducation: async (_database: unknown, id: string) => state.education.get(id) ?? [],
  getProfileItems: async (_database: unknown, id: string) => state.profileItems.get(id) ?? [],
  getProfileItemsForDoctors: async (_database: unknown, ids: string[]) => {
    const map = new Map<string, Array<Record<string, unknown>>>();
    for (const id of ids) map.set(id, state.profileItems.get(id) ?? []);
    return map;
  },
  getRelatedDoctors: async (_database: unknown, id: string) =>
    (state.related.get(id) ?? [])
      .map((relatedId) => state.doctors.find((doctor) => doctor.id === relatedId))
      .filter((doctor): doctor is DoctorRecord => doctor !== undefined)
      .map((doctor, index) => ({
        relation: { relatedDoctorId: doctor.id, displayOrder: index },
        doctor,
      })),
  getDoctorBranchIds: async (_database: unknown, id: string) => state.branches.get(id) ?? [],
  getDoctorBranchIdsForDoctors: async (_database: unknown, ids: string[]) => {
    const map = new Map<string, string[]>();
    for (const id of ids) {
      map.set(id, state.branches.get(id) ?? []);
    }
    return map;
  },
  doctorsExist: async (_database: unknown, ids: string[]) =>
    state.doctors.filter((doctor) => ids.includes(doctor.id)).map((doctor) => ({ id: doctor.id })),
  countAppointmentsForDoctor: async (_database: unknown, id: string) =>
    state.appointmentDoctorIds.has(id) ? 1 : 0,
  deleteDoctor: async (_database: unknown, id: string) => {
    state.doctors = state.doctors.filter((doctor) => doctor.id !== id);
  },
  listAdminDoctors: async (
    _database: unknown,
    query: { page: number; limit: number; category?: DoctorRecord['category'] },
  ) => {
    const filtered = query.category
      ? state.doctors.filter((doctor) => doctor.category === query.category)
      : state.doctors;
    return {
      items: filtered.slice((query.page - 1) * query.limit, query.page * query.limit),
      total: filtered.length,
    };
  },
  listDoctorIdsByCategory: async (_database: unknown, category: DoctorRecord['category']) =>
    state.doctors
      .filter((doctor) => doctor.category === category)
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map((doctor) => ({ id: doctor.id })),
  reorderDoctorsWithinCategory: async (
    _database: unknown,
    input: { category: DoctorRecord['category']; ids: string[] },
  ) => {
    for (const [displayOrder, id] of input.ids.entries()) {
      const doctor = state.doctors.find(
        (item) => item.id === id && item.category === input.category,
      );
      if (doctor) doctor.displayOrder = displayOrder;
    }
  },
  listPublicDoctors: async (
    _database: unknown,
    filters: { category?: DoctorRecord['category']; bookable?: boolean } = {},
  ) =>
    state.doctors
      .filter(
        (doctor) =>
          doctor.status === 'PUBLISHED' &&
          (filters.category === undefined || doctor.category === filters.category) &&
          (filters.bookable === undefined || doctor.bookable === filters.bookable),
      )
      .sort(
        (left, right) =>
          left.category.localeCompare(right.category) ||
          left.displayOrder - right.displayOrder ||
          left.id.localeCompare(right.id),
      ),
}));

const { app } = await import('../src/app');
const { hashSessionToken } = await import('../src/services/session.service');

const testBindings = {
  APP_ENV: 'development',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
} satisfies Bindings;

function doctorFixture(overrides: Partial<DoctorRecord> = {}): DoctorRecord {
  return {
    id: '550e8400-e29b-41d4-a716-446655440503',
    slug: 'sreng-heng',
    status: 'PUBLISHED',
    featured: true,
    displayOrder: 10,
    nameEn: 'Dr. Sreng Heng',
    nameKm: 'វេជ្ជបណ្ឌិត ស្រេង ហេង',
    roleEn: 'Senior Specialist',
    roleKm: 'អ្នកឯកទេសជាន់ខ្ពស់',
    specialtyEn: 'Implant Dentistry',
    specialtyKm: 'ការដាំធ្មេញ',
    shortBioEn: 'Experienced clinician.',
    shortBioKm: 'វេជ្ជបណ្ឌិតមានបទពិសោធន៍។',
    biographyEn: 'Full profile.',
    biographyKm: 'ប្រវត្តិរូបពេញលេញ។',
    photoKey: 'doctors/sreng-heng/profile.webp',
    yearsExperience: 12,
    successfulProcedures: 1200,
    patientSatisfaction: 98,
    phone: '012 345 678',
    category: 'DENTIST',
    bookable: true,
    departmentEn: null,
    departmentKm: null,
    teamNoteEn: null,
    teamNoteKm: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

async function authenticatedHeaders(role: AuthenticatedAdmin['role']) {
  const token = `doctors-${role}`;
  state.sessions.set(await hashSessionToken(token), {
    sessionId: `${role}-session`,
    adminId: `${role}-admin`,
    displayName: `${role} Admin`,
    email: `${role.toLowerCase()}@example.com`,
    role,
  });
  return { Cookie: `arunreah_admin_session=${token}` };
}

function createPayload(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'dara-sok',
    nameEn: 'Dr. Dara Sok',
    nameKm: 'វេជ្ជបណ្ឌិត ដារ៉ា សុខ',
    ...overrides,
  };
}

beforeEach(() => {
  state.doctors = [];
  state.expertise.clear();
  state.education.clear();
  state.profileItems.clear();
  state.related.clear();
  state.sessions.clear();
  state.appointmentDoctorIds.clear();
});

describe('doctor API routes', () => {
  it('serves the canonical Team endpoints and keeps the doctors aliases working', async () => {
    state.doctors = [doctorFixture()];

    for (const path of ['/api/public/team?lang=en', '/api/public/doctors?lang=en']) {
      const response = await app.request(`http://localhost${path}`, undefined, testBindings);
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        success: true,
        data: { doctors: [{ slug: 'sreng-heng' }] },
      });
    }

    const headers = await authenticatedHeaders('CMS_ADMIN');
    for (const path of ['/api/admin/team', '/api/admin/doctors']) {
      const response = await app.request(`http://localhost${path}`, { headers }, testBindings);
      expect(response.status).toBe(200);
    }
  });

  it('returns localized public card/detail data and hides draft doctors', async () => {
    state.doctors = [
      doctorFixture({
        departmentEn: 'Dental Department',
        departmentKm: 'ផ្នែកទន្តសាស្ត្រ',
        teamNoteEn: 'Clinical lead',
        teamNoteKm: 'ប្រធានក្រុមគ្លីនិក',
      }),
      doctorFixture({ id: 'doctor-2', slug: 'draft-doctor', status: 'DRAFT' }),
    ];
    state.profileItems.set('550e8400-e29b-41d4-a716-446655440503', [
      {
        id: 'profile-1',
        kind: 'EXPERIENCE',
        icon: null,
        titleEn: 'Twelve years of care',
        titleKm: 'បទពិសោធន៍ថែទាំដប់ពីរឆ្នាំ',
        subtitleEn: 'Implant dentistry',
        subtitleKm: 'ទន្តសាស្ត្រដាំធ្មេញ',
        meta: '12 years',
        displayOrder: 0,
      },
    ]);
    state.expertise.set('550e8400-e29b-41d4-a716-446655440503', [
      { id: 'expertise-1', nameEn: 'Implants', nameKm: 'ដាំធ្មេញ', displayOrder: 0 },
    ]);
    state.education.set('550e8400-e29b-41d4-a716-446655440503', [
      {
        id: 'education-1',
        degreeEn: 'DDS',
        degreeKm: 'DDS',
        institutionEn: 'University',
        institutionKm: 'សាកលវិទ្យាល័យ',
        yearLabel: '2010',
        displayOrder: 0,
      },
    ]);
    const list = await app.request(
      'http://localhost/api/public/doctors?lang=km',
      undefined,
      testBindings,
    );
    expect(list.status).toBe(200);
    await expect(list.json()).resolves.toMatchObject({
      success: true,
      data: {
        doctors: [
          {
            id: '550e8400-e29b-41d4-a716-446655440503',
            name: 'វេជ្ជបណ្ឌិត ស្រេង ហេង',
            category: 'DENTIST',
            bookable: true,
            department: 'ផ្នែកទន្តសាស្ត្រ',
            teamNote: 'ប្រធានក្រុមគ្លីនិក',
            profileItems: [
              {
                kind: 'EXPERIENCE',
                title: 'បទពិសោធន៍ថែទាំដប់ពីរឆ្នាំ',
                subtitle: 'ទន្តសាស្ត្រដាំធ្មេញ',
                meta: '12 years',
              },
            ],
            photoImagePresentation: { positionX: 50, positionY: 0, zoom: 1 },
          },
        ],
      },
    });
    const detail = await app.request(
      'http://localhost/api/public/doctors/sreng-heng?lang=en',
      undefined,
      testBindings,
    );
    await expect(detail.json()).resolves.toMatchObject({
      success: true,
      data: {
        doctor: {
          about: 'Full profile.',
          category: 'DENTIST',
          bookable: true,
          department: 'Dental Department',
          teamNote: 'Clinical lead',
          profileItems: [
            {
              kind: 'EXPERIENCE',
              title: 'Twelve years of care',
              subtitle: 'Implant dentistry',
            },
          ],
          expertise: [{ title: 'Implants' }],
          statistics: { patientSatisfaction: 98 },
        },
      },
    });
    expect(
      (
        await app.request(
          'http://localhost/api/public/doctors/draft-doctor',
          undefined,
          testBindings,
        )
      ).status,
    ).toBe(404);
  });

  it('lists all published categories, filters by category, and hides every draft or archived profile', async () => {
    const categories: DoctorRecord['category'][] = [
      'ASSISTANT',
      'DENTIST',
      'GENERAL_PRACTITIONER',
      'RECEPTIONIST',
    ];
    state.doctors = categories.flatMap((category, categoryIndex) => [
      doctorFixture({
        id: `${category}-published`,
        slug: `${category.toLowerCase().replaceAll('_', '-')}-published`,
        category,
        bookable: category === 'DENTIST' || category === 'GENERAL_PRACTITIONER',
        displayOrder: categoryIndex,
      }),
      doctorFixture({
        id: `${category}-draft`,
        slug: `${category.toLowerCase().replaceAll('_', '-')}-draft`,
        status: 'DRAFT',
        category,
        bookable: false,
      }),
      doctorFixture({
        id: `${category}-archived`,
        slug: `${category.toLowerCase().replaceAll('_', '-')}-archived`,
        status: 'ARCHIVED',
        category,
        bookable: false,
      }),
    ]);

    const allResponse = await app.request(
      'http://localhost/api/public/doctors?lang=en',
      undefined,
      testBindings,
    );
    expect(allResponse.status).toBe(200);
    const allJson = (await allResponse.json()) as {
      data: { doctors: Array<{ id: string }> };
    };
    expect(allJson.data.doctors.map((doctor) => doctor.id)).toEqual(
      categories.map((category) => `${category}-published`),
    );

    const bookingResponse = await app.request(
      'http://localhost/api/public/doctors?lang=en&bookable=true',
      undefined,
      testBindings,
    );
    expect(bookingResponse.status).toBe(200);
    const bookingJson = (await bookingResponse.json()) as {
      data: { doctors: Array<{ id: string; bookable: boolean }> };
    };
    expect(bookingJson.data.doctors).toEqual([
      expect.objectContaining({ id: 'DENTIST-published', bookable: true }),
      expect.objectContaining({ id: 'GENERAL_PRACTITIONER-published', bookable: true }),
    ]);

    for (const category of categories) {
      const filteredResponse = await app.request(
        `http://localhost/api/public/doctors?lang=en&category=${category}`,
        undefined,
        testBindings,
      );
      const filteredJson = (await filteredResponse.json()) as {
        data: { doctors: Array<{ id: string; category: DoctorRecord['category'] }> };
      };
      expect(filteredJson.data.doctors).toEqual([
        expect.objectContaining({ id: `${category}-published`, category }),
      ]);

      expect(
        (
          await app.request(
            `http://localhost/api/public/doctors/${category.toLowerCase().replaceAll('_', '-')}-published?lang=en`,
            undefined,
            testBindings,
          )
        ).status,
      ).toBe(200);
      for (const status of ['draft', 'archived'] as const) {
        expect(
          (
            await app.request(
              `http://localhost/api/public/doctors/${category.toLowerCase().replaceAll('_', '-')}-${status}?lang=en`,
              undefined,
              testBindings,
            )
          ).status,
        ).toBe(404);
      }
    }
  });

  it('enforces CMS authorization for doctor management', async () => {
    expect(
      (await app.request('http://localhost/api/admin/doctors', undefined, testBindings)).status,
    ).toBe(401);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/doctors',
          { headers: await authenticatedHeaders('RECEPTIONIST') },
          testBindings,
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/doctors/reorder',
          {
            method: 'PATCH',
            headers: {
              ...(await authenticatedHeaders('RECEPTIONIST')),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              category: 'DENTIST',
              ids: ['550e8400-e29b-41d4-a716-446655440503'],
            }),
          },
          testBindings,
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/doctors',
          { headers: await authenticatedHeaders('CMS_ADMIN') },
          testBindings,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/doctors',
          { headers: await authenticatedHeaders('SUPER_ADMIN') },
          testBindings,
        )
      ).status,
    ).toBe(200);
  });

  it('creates a doctor with nested content and preserves omitted nested collections on update', async () => {
    const headers = await authenticatedHeaders('CMS_ADMIN');
    const create = await app.request(
      'http://localhost/api/admin/doctors',
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(
          createPayload({
            expertise: [{ titleEn: 'Implants', titleKm: 'ដាំធ្មេញ' }],
            education: [
              {
                qualificationEn: 'DDS',
                qualificationKm: 'DDS',
                institutionEn: 'University',
                institutionKm: 'សាកលវិទ្យាល័យ',
              },
            ],
          }),
        ),
      },
      testBindings,
    );
    expect(create.status).toBe(201);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/doctors',
          {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(createPayload()),
          },
          testBindings,
        )
      ).status,
    ).toBe(409);
    const update = await app.request(
      'http://localhost/api/admin/doctors/550e8400-e29b-41d4-a716-446655440503',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientSatisfaction: 99,
          category: 'GENERAL_PRACTITIONER',
          bookable: true,
          departmentEn: 'General Medicine',
          departmentKm: 'វេជ្ជសាស្ត្រទូទៅ',
          teamNoteEn: 'Updated team note',
          teamNoteKm: 'ចំណាំក្រុមបានកែប្រែ',
          profileItems: [{ kind: 'LANGUAGE', titleEn: 'Khmer', titleKm: 'ខ្មែរ', displayOrder: 0 }],
        }),
      },
      testBindings,
    );
    expect(update.status).toBe(200);
    await expect(update.json()).resolves.toMatchObject({
      success: true,
      data: {
        doctor: {
          category: 'GENERAL_PRACTITIONER',
          bookable: true,
          departmentEn: 'General Medicine',
          departmentKm: 'វេជ្ជសាស្ត្រទូទៅ',
          teamNoteEn: 'Updated team note',
          teamNoteKm: 'ចំណាំក្រុមបានកែប្រែ',
          profileItems: [{ kind: 'LANGUAGE', titleEn: 'Khmer', titleKm: 'ខ្មែរ' }],
        },
      },
    });
    expect(state.expertise.get('550e8400-e29b-41d4-a716-446655440503')).toHaveLength(1);
    expect(state.education.get('550e8400-e29b-41d4-a716-446655440503')).toHaveLength(1);
  });

  it('creates all four team categories and returns their Our Team fields', async () => {
    const headers = await authenticatedHeaders('CMS_ADMIN');
    const categories: DoctorRecord['category'][] = [
      'DENTIST',
      'GENERAL_PRACTITIONER',
      'RECEPTIONIST',
      'ASSISTANT',
    ];

    for (const [index, category] of categories.entries()) {
      const response = await app.request(
        'http://localhost/api/admin/doctors',
        {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(
            createPayload({
              slug: `team-member-${index}`,
              category,
              bookable: category === 'DENTIST' || category === 'GENERAL_PRACTITIONER',
              departmentEn: `Department ${index}`,
              departmentKm: `ផ្នែក ${index}`,
              teamNoteEn: `Note ${index}`,
              teamNoteKm: `ចំណាំ ${index}`,
              profileItems: [
                {
                  kind: 'LANGUAGE',
                  titleEn: 'Khmer',
                  titleKm: 'ខ្មែរ',
                  displayOrder: 0,
                },
              ],
            }),
          ),
        },
        testBindings,
      );

      expect(response.status).toBe(201);
      await expect(response.json()).resolves.toMatchObject({
        success: true,
        data: {
          doctor: {
            category,
            bookable: category === 'DENTIST' || category === 'GENERAL_PRACTITIONER',
            departmentEn: `Department ${index}`,
            departmentKm: `ផ្នែក ${index}`,
            teamNoteEn: `Note ${index}`,
            teamNoteKm: `ចំណាំ ${index}`,
            profileItems: [{ kind: 'LANGUAGE', titleEn: 'Khmer', titleKm: 'ខ្មែរ' }],
          },
        },
      });
    }
  });

  it('rejects a bookable non-clinical team member with the shared validation error code', async () => {
    const response = await app.request(
      'http://localhost/api/admin/doctors',
      {
        method: 'POST',
        headers: {
          ...(await authenticatedHeaders('CMS_ADMIN')),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createPayload({ category: 'RECEPTIONIST', bookable: true })),
      },
      testBindings,
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    });
  });

  it('filters the admin list by team category', async () => {
    state.doctors = [
      doctorFixture({ id: 'dentist', category: 'DENTIST' }),
      doctorFixture({
        id: 'receptionist',
        slug: 'receptionist',
        category: 'RECEPTIONIST',
        bookable: false,
      }),
    ];
    state.profileItems.set('receptionist', [
      {
        id: 'profile-receptionist',
        kind: 'RESPONSIBILITY',
        icon: 'welcome',
        titleEn: 'Welcome patients',
        titleKm: 'ស្វាគមន៍អ្នកជំងឺ',
        subtitleEn: null,
        subtitleKm: null,
        meta: null,
        displayOrder: 0,
      },
    ]);

    const response = await app.request(
      'http://localhost/api/admin/doctors?category=RECEPTIONIST',
      { headers: await authenticatedHeaders('CMS_ADMIN') },
      testBindings,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        doctors: [
          {
            id: 'receptionist',
            category: 'RECEPTIONIST',
            bookable: false,
            profileItems: [{ kind: 'RESPONSIBILITY', icon: 'welcome' }],
          },
        ],
        meta: { total: 1 },
      },
    });
  });

  it('reorders display positions only within the requested category', async () => {
    state.doctors = [
      doctorFixture({ id: 'dentist-1', displayOrder: 0 }),
      doctorFixture({ id: 'dentist-2', slug: 'dentist-2', displayOrder: 1 }),
      doctorFixture({
        id: 'assistant-1',
        slug: 'assistant-1',
        category: 'ASSISTANT',
        bookable: false,
        displayOrder: 7,
      }),
    ];
    const headers = await authenticatedHeaders('CMS_ADMIN');
    const incomplete = await app.request(
      'http://localhost/api/admin/doctors/reorder',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'DENTIST', ids: ['dentist-2'] }),
      },
      testBindings,
    );
    expect(incomplete.status).toBe(400);

    const response = await app.request(
      'http://localhost/api/admin/doctors/reorder',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'DENTIST', ids: ['dentist-2', 'dentist-1'] }),
      },
      testBindings,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: { reordered: true },
    });
    expect(state.doctors.find((doctor) => doctor.id === 'dentist-2')?.displayOrder).toBe(0);
    expect(state.doctors.find((doctor) => doctor.id === 'dentist-1')?.displayOrder).toBe(1);
    expect(state.doctors.find((doctor) => doctor.id === 'assistant-1')?.displayOrder).toBe(7);
  });

  it('validates related doctors and protects appointment-referenced doctors from deletion', async () => {
    state.doctors = [
      doctorFixture(),
      doctorFixture({ id: '550e8400-e29b-41d4-a716-446655440509', slug: 'dara-sok' }),
    ];
    const headers = await authenticatedHeaders('SUPER_ADMIN');
    const selfReference = await app.request(
      'http://localhost/api/admin/doctors/550e8400-e29b-41d4-a716-446655440503',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ relatedDoctorIds: ['550e8400-e29b-41d4-a716-446655440503'] }),
      },
      testBindings,
    );
    expect(selfReference.status).toBe(400);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/doctors/550e8400-e29b-41d4-a716-446655440503',
          {
            method: 'PATCH',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ relatedDoctorIds: ['missing'] }),
          },
          testBindings,
        )
      ).status,
    ).toBe(400);
    state.appointmentDoctorIds.add('550e8400-e29b-41d4-a716-446655440503');
    const categoryChange = await app.request(
      'http://localhost/api/admin/doctors/550e8400-e29b-41d4-a716-446655440503',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'RECEPTIONIST', bookable: false }),
      },
      testBindings,
    );
    expect(categoryChange.status).toBe(409);
    await expect(categoryChange.json()).resolves.toMatchObject({
      success: false,
      error: {
        code: 'CONFLICT',
        message:
          'This doctor is referenced by appointment history and cannot be changed to a non-clinical category. Unpublish or deactivate the doctor instead.',
      },
    });
    expect(
      state.doctors.find((doctor) => doctor.id === '550e8400-e29b-41d4-a716-446655440503')
        ?.category,
    ).toBe('DENTIST');
    expect(
      (
        await app.request(
          'http://localhost/api/admin/doctors/550e8400-e29b-41d4-a716-446655440503',
          { method: 'DELETE', headers },
          testBindings,
        )
      ).status,
    ).toBe(409);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/doctors/550e8400-e29b-41d4-a716-446655440509',
          { method: 'DELETE', headers },
          testBindings,
        )
      ).status,
    ).toBe(200);
  });

  it('supports managing branch assignments and exposes them in public and admin responses', async () => {
    state.doctors = [];
    state.branches.clear();
    const headers = await authenticatedHeaders('SUPER_ADMIN');

    const created = await app.request(
      'http://localhost/api/admin/doctors',
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createPayload(),
          slug: 'dr-multi-branch',
          status: 'PUBLISHED',
          branchIds: ['branch-toul-tompoung', 'branch-psa-chas'],
        }),
      },
      testBindings,
    );
    expect(created.status).toBe(201);
    const createdJson = (await created.json()) as {
      data: {
        doctor: {
          id: string;
          slug: string;
          branchIds: string[];
        };
      };
      success: boolean;
    };
    expect(createdJson).toMatchObject({
      success: true,
      data: {
        doctor: {
          slug: 'dr-multi-branch',
          branchIds: ['branch-toul-tompoung', 'branch-psa-chas'],
        },
      },
    });

    const publicList = await app.request('http://localhost/api/public/doctors', {}, testBindings);
    expect(publicList.status).toBe(200);
    const publicJson = await publicList.json();
    expect(publicJson).toMatchObject({
      success: true,
      data: {
        doctors: [
          {
            slug: 'dr-multi-branch',
            branchIds: ['branch-toul-tompoung', 'branch-psa-chas'],
          },
        ],
      },
    });

    const updated = await app.request(
      `http://localhost/api/admin/doctors/${createdJson.data.doctor.id}`,
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchIds: ['branch-toul-tompoung'],
        }),
      },
      testBindings,
    );
    expect(updated.status).toBe(200);
    await expect(updated.json()).resolves.toMatchObject({
      success: true,
      data: {
        doctor: {
          branchIds: ['branch-toul-tompoung'],
        },
      },
    });
  });
});
