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
  relatedDoctorIds?: string[];
};

const state = vi.hoisted(() => ({
  doctors: [] as DoctorRecord[],
  expertise: new Map<string, Array<Record<string, unknown>>>(),
  education: new Map<string, Array<Record<string, unknown>>>(),
  related: new Map<string, string[]>(),
  sessions: new Map<string, SessionRecord>(),
  appointmentDoctorIds: new Set<string>(),
}));

vi.mock('../src/db/client', () => ({ createDbClient: () => ({}) }));
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
      ...doctorFixture({ id: `doctor-${state.doctors.length + 1}`, slug: input.slug ?? 'new' }),
      ...input,
      roleEn: input.titleEn as string | null | undefined,
      roleKm: input.titleKm as string | null | undefined,
      biographyEn: input.aboutEn as string | null | undefined,
      biographyKm: input.aboutKm as string | null | undefined,
    } as DoctorRecord;
    state.doctors.push(doctor);
    state.expertise.set(doctor.id, input.expertise ?? []);
    state.education.set(doctor.id, input.education ?? []);
    state.related.set(doctor.id, input.relatedDoctorIds ?? []);
    return doctor;
  },
  updateDoctor: async (_database: unknown, id: string, input: DoctorInput) => {
    const doctor = state.doctors.find((item) => item.id === id);
    if (!doctor) return undefined;
    const {
      expertise,
      education,
      relatedDoctorIds,
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
    if (relatedDoctorIds !== undefined) state.related.set(id, relatedDoctorIds);
    return doctor;
  },
  getExpertise: async (_database: unknown, id: string) => state.expertise.get(id) ?? [],
  getEducation: async (_database: unknown, id: string) => state.education.get(id) ?? [],
  getRelatedDoctors: async (_database: unknown, id: string) =>
    (state.related.get(id) ?? [])
      .map((relatedId) => state.doctors.find((doctor) => doctor.id === relatedId))
      .filter((doctor): doctor is DoctorRecord => doctor !== undefined)
      .map((doctor, index) => ({
        relation: { relatedDoctorId: doctor.id, displayOrder: index },
        doctor,
      })),
  doctorsExist: async (_database: unknown, ids: string[]) =>
    state.doctors.filter((doctor) => ids.includes(doctor.id)).map((doctor) => ({ id: doctor.id })),
  countAppointmentsForDoctor: async (_database: unknown, id: string) =>
    state.appointmentDoctorIds.has(id) ? 1 : 0,
  deleteDoctor: async (_database: unknown, id: string) => {
    state.doctors = state.doctors.filter((doctor) => doctor.id !== id);
  },
  listAdminDoctors: async (_database: unknown, query: { page: number; limit: number }) => ({
    items: state.doctors.slice((query.page - 1) * query.limit, query.page * query.limit),
    total: state.doctors.length,
  }),
  listPublicDoctors: async () => state.doctors.filter((doctor) => doctor.status === 'PUBLISHED'),
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
    id: 'doctor-1',
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
  state.related.clear();
  state.sessions.clear();
  state.appointmentDoctorIds.clear();
});

describe('doctor API routes', () => {
  it('returns localized public card/detail data and hides draft doctors', async () => {
    state.doctors = [
      doctorFixture(),
      doctorFixture({ id: 'doctor-2', slug: 'draft-doctor', status: 'DRAFT' }),
    ];
    state.expertise.set('doctor-1', [
      { id: 'expertise-1', nameEn: 'Implants', nameKm: 'ដាំធ្មេញ', displayOrder: 0 },
    ]);
    state.education.set('doctor-1', [
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
      data: { doctors: [{ name: 'វេជ្ជបណ្ឌិត ស្រេង ហេង' }] },
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
      'http://localhost/api/admin/doctors/doctor-1',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientSatisfaction: 99 }),
      },
      testBindings,
    );
    expect(update.status).toBe(200);
    expect(state.expertise.get('doctor-1')).toHaveLength(1);
    expect(state.education.get('doctor-1')).toHaveLength(1);
  });

  it('validates related doctors and protects appointment-referenced doctors from deletion', async () => {
    state.doctors = [doctorFixture(), doctorFixture({ id: 'doctor-2', slug: 'dara-sok' })];
    const headers = await authenticatedHeaders('SUPER_ADMIN');
    const selfReference = await app.request(
      'http://localhost/api/admin/doctors/doctor-1',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ relatedDoctorIds: ['doctor-1'] }),
      },
      testBindings,
    );
    expect(selfReference.status).toBe(400);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/doctors/doctor-1',
          {
            method: 'PATCH',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ relatedDoctorIds: ['missing'] }),
          },
          testBindings,
        )
      ).status,
    ).toBe(400);
    state.appointmentDoctorIds.add('doctor-1');
    expect(
      (
        await app.request(
          'http://localhost/api/admin/doctors/doctor-1',
          { method: 'DELETE', headers },
          testBindings,
        )
      ).status,
    ).toBe(409);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/doctors/doctor-2',
          { method: 'DELETE', headers },
          testBindings,
        )
      ).status,
    ).toBe(200);
  });
});
