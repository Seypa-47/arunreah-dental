import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedAdmin } from '../src/types/auth';
import type { Bindings } from '../src/types/env';

type ClinicRecord = {
  id: string;
  clinicNameEn: string;
  clinicNameKm: string;
  taglineEn: string | null;
  taglineKm: string | null;
  shortAboutEn: string | null;
  shortAboutKm: string | null;
  logoKey: string | null;
  yearsExperience: number | null;
  successfulCases: number | null;
  patientSatisfaction: number | null;
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

const state = vi.hoisted(() => ({
  clinic: undefined as ClinicRecord | undefined,
  sessions: new Map<string, SessionRecord>(),
}));

vi.mock('../src/db/client', () => ({
  createDbClient: () => ({}),
}));

vi.mock('../src/repositories/clinic-settings.repository', () => ({
  findClinicSettings: async () => state.clinic,
  createClinicSettings: async (_database: unknown, input: Omit<ClinicRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    state.clinic = {
      id: 'clinic',
      ...input,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    return state.clinic;
  },
  updateClinicSettings: async (_database: unknown, input: Partial<ClinicRecord>) => {
    if (!state.clinic) return undefined;
    state.clinic = {
      ...state.clinic,
      ...input,
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    return state.clinic;
  },
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

const { app } = await import('../src/app');
const { hashSessionToken } = await import('../src/services/session.service');

const testBindings = {
  APP_ENV: 'development',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
} satisfies Bindings;

async function authenticatedHeaders(role: AuthenticatedAdmin['role']) {
  const token = `clinic-settings-${role}`;
  state.sessions.set(await hashSessionToken(token), {
    sessionId: `${role}-session-id`,
    adminId: `${role}-admin-id`,
    displayName: `${role} Admin`,
    email: `${role.toLowerCase()}@example.com`,
    role,
  });

  return { Cookie: `arunreah_admin_session=${token}` };
}

function clinicFixture(): ClinicRecord {
  return {
    id: 'clinic',
    clinicNameEn: 'Arunreah Dental Clinic',
    clinicNameKm: 'អរុណរះ ទន្តពេទ្យ',
    taglineEn: 'Healthy smiles',
    taglineKm: 'ស្នាមញញឹមមានសុខភាពល្អ',
    shortAboutEn: 'Clinic introduction.',
    shortAboutKm: 'ការណែនាំអំពីគ្លីនិក។',
    logoKey: 'clinic/logo.png',
    yearsExperience: 12,
    successfulCases: 5000,
    patientSatisfaction: 98,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };
}

beforeEach(() => {
  state.clinic = undefined;
  state.sessions.clear();
});

describe('clinic information API routes', () => {
  it('returns only public clinic information without authentication', async () => {
    state.clinic = clinicFixture();

    const response = await app.request('http://localhost/api/public/clinic', undefined, testBindings);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        clinic: {
          clinicNameEn: 'Arunreah Dental Clinic',
          clinicNameKm: 'អរុណរះ ទន្តពេទ្យ',
          taglineEn: 'Healthy smiles',
          taglineKm: 'ស្នាមញញឹមមានសុខភាពល្អ',
          shortAboutEn: 'Clinic introduction.',
          shortAboutKm: 'ការណែនាំអំពីគ្លីនិក។',
          logoKey: 'clinic/logo.png',
          yearsExperience: 12,
          successfulCases: 5000,
          patientSatisfaction: 98,
        },
      },
    });
  });

  it('requires CMS permission for the admin endpoint and returns admin metadata', async () => {
    state.clinic = clinicFixture();
    const receptionistHeaders = await authenticatedHeaders('RECEPTIONIST');
    const forbiddenResponse = await app.request(
      'http://localhost/api/admin/clinic',
      { headers: receptionistHeaders },
      testBindings,
    );
    expect(forbiddenResponse.status).toBe(403);

    const cmsHeaders = await authenticatedHeaders('CMS_ADMIN');
    const allowedResponse = await app.request(
      'http://localhost/api/admin/clinic',
      { headers: cmsHeaders },
      testBindings,
    );
    expect(allowedResponse.status).toBe(200);
    await expect(allowedResponse.json()).resolves.toMatchObject({
      success: true,
      data: {
        clinic: {
          id: 'clinic',
          clinicNameEn: 'Arunreah Dental Clinic',
          clinicNameKm: 'អរុណរះ ទន្តពេទ្យ',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      },
    });
  });

  it('initializes clinic settings from a complete PATCH and supports later partial updates', async () => {
    const headers = await authenticatedHeaders('SUPER_ADMIN');
    const initialResponse = await app.request(
      'http://localhost/api/admin/clinic',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicNameEn: 'Arunreah Dental Clinic',
          clinicNameKm: 'អរុណរះ ទន្តពេទ្យ',
          yearsExperience: 12,
        }),
      },
      testBindings,
    );
    expect(initialResponse.status).toBe(200);
    await expect(initialResponse.json()).resolves.toMatchObject({
      success: true,
      data: { clinic: { clinicNameEn: 'Arunreah Dental Clinic', yearsExperience: 12 } },
    });

    const updateResponse = await app.request(
      'http://localhost/api/admin/clinic',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientSatisfaction: 99, logoKey: 'clinic/new-logo.png' }),
      },
      testBindings,
    );
    expect(updateResponse.status).toBe(200);
    await expect(updateResponse.json()).resolves.toMatchObject({
      success: true,
      data: {
        clinic: {
          clinicNameEn: 'Arunreah Dental Clinic',
          patientSatisfaction: 99,
          logoKey: 'clinic/new-logo.png',
        },
      },
    });
  });

  it('rejects an incomplete initial setup and invalid update values', async () => {
    const headers = await authenticatedHeaders('CMS_ADMIN');
    const incompleteResponse = await app.request(
      'http://localhost/api/admin/clinic',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ taglineEn: 'Healthy smiles' }),
      },
      testBindings,
    );
    expect(incompleteResponse.status).toBe(400);

    state.clinic = clinicFixture();
    const invalidResponse = await app.request(
      'http://localhost/api/admin/clinic',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientSatisfaction: 101 }),
      },
      testBindings,
    );
    expect(invalidResponse.status).toBe(400);
  });
});
