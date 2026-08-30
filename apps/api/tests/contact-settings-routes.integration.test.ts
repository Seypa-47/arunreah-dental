import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedAdmin } from '../src/types/auth';
import type { Bindings } from '../src/types/env';

type ContactRecord = {
  id: string;
  primaryPhone: string;
  secondaryPhone: string | null;
  primaryEmail: string | null;
  businessHoursEn: string | null;
  businessHoursKm: string | null;
  mainGoogleMapsUrl: string | null;
  facebookUrl: string | null;
  telegramUrl: string | null;
  instagramUrl: string | null;
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
  contact: undefined as ContactRecord | undefined,
  sessions: new Map<string, SessionRecord>(),
}));

vi.mock('../src/db/client', () => ({
  createDbClient: () => ({}),
}));

vi.mock('../src/repositories/contact-settings.repository', () => ({
  findContactSettings: async () => state.contact,
  createContactSettings: async (_database: unknown, input: Omit<ContactRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    state.contact = {
      id: 'contact',
      ...input,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    return state.contact;
  },
  updateContactSettings: async (_database: unknown, input: Partial<ContactRecord>) => {
    if (!state.contact) return undefined;
    state.contact = {
      ...state.contact,
      ...input,
      updatedAt: '2026-01-02T00:00:00.000Z',
    };
    return state.contact;
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
  const token = `contact-settings-${role}`;
  state.sessions.set(await hashSessionToken(token), {
    sessionId: `${role}-session-id`,
    adminId: `${role}-admin-id`,
    displayName: `${role} Admin`,
    email: `${role.toLowerCase()}@example.com`,
    role,
  });

  return { Cookie: `arunreah_admin_session=${token}` };
}

function contactFixture(): ContactRecord {
  return {
    id: 'contact',
    primaryPhone: '069 978 997',
    secondaryPhone: '+855 12 964 200',
    primaryEmail: 'info@arunreah.example',
    businessHoursEn: 'Mon-Sun, 8:00 AM-8:00 PM',
    businessHoursKm: 'ចន្ទ-អាទិត្យ, ៨:០០ ព្រឹក-៨:០០ ល្ងាច',
    mainGoogleMapsUrl: 'https://maps.google.com/?q=Arunreah',
    facebookUrl: 'https://facebook.com/arunreah',
    telegramUrl: 'https://t.me/arunreah',
    instagramUrl: 'https://instagram.com/arunreah',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };
}

beforeEach(() => {
  state.contact = undefined;
  state.sessions.clear();
});

describe('contact settings API routes', () => {
  it('returns public-safe bilingual contact information without authentication', async () => {
    state.contact = contactFixture();

    const response = await app.request('http://localhost/api/public/contact', undefined, testBindings);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        contact: {
          primaryPhone: '069 978 997',
          secondaryPhone: '+855 12 964 200',
          primaryEmail: 'info@arunreah.example',
          businessHoursEn: 'Mon-Sun, 8:00 AM-8:00 PM',
          businessHoursKm: 'ចន្ទ-អាទិត្យ, ៨:០០ ព្រឹក-៨:០០ ល្ងាច',
          mainGoogleMapsUrl: 'https://maps.google.com/?q=Arunreah',
          facebookUrl: 'https://facebook.com/arunreah',
          telegramUrl: 'https://t.me/arunreah',
          instagramUrl: 'https://instagram.com/arunreah',
        },
      },
    });
  });

  it('requires authentication for admin reads and updates', async () => {
    const getResponse = await app.request('http://localhost/api/admin/contact', undefined, testBindings);
    expect(getResponse.status).toBe(401);

    const patchResponse = await app.request(
      'http://localhost/api/admin/contact',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryPhone: '069 978 997' }),
      },
      testBindings,
    );
    expect(patchResponse.status).toBe(401);
  });

  it('denies receptionists while allowing CMS and super admins to read and update', async () => {
    state.contact = contactFixture();
    const receptionistHeaders = await authenticatedHeaders('RECEPTIONIST');

    expect(
      (
        await app.request(
          'http://localhost/api/admin/contact',
          { headers: receptionistHeaders },
          testBindings,
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/contact',
          {
            method: 'PATCH',
            headers: { ...receptionistHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ primaryPhone: '012 964 200' }),
          },
          testBindings,
        )
      ).status,
    ).toBe(403);

    const cmsHeaders = await authenticatedHeaders('CMS_ADMIN');
    const cmsGetResponse = await app.request(
      'http://localhost/api/admin/contact',
      { headers: cmsHeaders },
      testBindings,
    );
    expect(cmsGetResponse.status).toBe(200);
    expect(cmsGetResponse.headers.get('Cache-Control')).toBe('private, no-store');

    const superAdminHeaders = await authenticatedHeaders('SUPER_ADMIN');
    const updateResponse = await app.request(
      'http://localhost/api/admin/contact',
      {
        method: 'PATCH',
        headers: { ...superAdminHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ instagramUrl: 'https://instagram.com/new-arunreah' }),
      },
      testBindings,
    );
    expect(updateResponse.status).toBe(200);
  });

  it('accepts Cambodian phone formats and preserves unrelated fields during partial updates', async () => {
    const headers = await authenticatedHeaders('CMS_ADMIN');
    const initializeResponse = await app.request(
      'http://localhost/api/admin/contact',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryPhone: '069 978 997',
          secondaryPhone: '+855 12 964 200',
          primaryEmail: 'info@arunreah.example',
        }),
      },
      testBindings,
    );
    expect(initializeResponse.status).toBe(200);

    const updateResponse = await app.request(
      'http://localhost/api/admin/contact',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramUrl: 'https://t.me/arunreah' }),
      },
      testBindings,
    );
    expect(updateResponse.status).toBe(200);
    await expect(updateResponse.json()).resolves.toMatchObject({
      success: true,
      data: {
        contact: {
          primaryPhone: '069 978 997',
          secondaryPhone: '+855 12 964 200',
          primaryEmail: 'info@arunreah.example',
          telegramUrl: 'https://t.me/arunreah',
        },
      },
    });
  });

  it('rejects invalid emails, URLs, phones, and unknown mass-assignment fields', async () => {
    state.contact = contactFixture();
    const headers = await authenticatedHeaders('CMS_ADMIN');

    for (const body of [
      { primaryEmail: 'not-an-email' },
      { facebookUrl: 'not-a-url' },
      { primaryPhone: 'invalid phone!' },
      { internalNotificationAddress: 'private@example.com' },
    ]) {
      const response = await app.request(
        'http://localhost/api/admin/contact',
        {
          method: 'PATCH',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
        testBindings,
      );
      expect(response.status).toBe(400);
    }
  });
});
