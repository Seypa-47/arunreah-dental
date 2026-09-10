import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedAdmin } from '../src/types/auth';
import type { Bindings } from '../src/types/env';

type PageMediaRecord = {
  bodyEn: string | null; bodyKm: string | null; createdAt: string; displayOrder: number; id: string;
  imageKey: string; placement: 'ABOUT_PROFESSIONAL_DEVELOPMENT' | 'DOCTORS_PATIENT_EDUCATION'; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  titleEn: string | null; titleKm: string | null; updatedAt: string;
};
type SessionRecord = { adminId: string; displayName: string; email: string; role: AuthenticatedAdmin['role']; sessionId: string };

const state = vi.hoisted(() => ({ items: [] as PageMediaRecord[], sessions: new Map<string, SessionRecord>() }));
vi.mock('../src/db/client', () => ({ createDbClient: () => ({}) }));
vi.mock('../src/repositories/page-media.repository', () => ({
  create: async (_db: unknown, input: Omit<PageMediaRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const item: PageMediaRecord = { ...input, id: 'media-1', createdAt: '2026-09-07T00:00:00.000Z', updatedAt: '2026-09-07T00:00:00.000Z' };
    state.items.push(item); return item;
  },
  find: async (_db: unknown, id: string) => state.items.find((item) => item.id === id),
  list: async (_db: unknown, placement: PageMediaRecord['placement'], publishedOnly = false) => state.items.filter((item) => item.placement === placement && (!publishedOnly || item.status === 'PUBLISHED')),
  remove: async (_db: unknown, id: string) => { state.items = state.items.filter((item) => item.id !== id); },
  update: async (_db: unknown, id: string, input: Partial<PageMediaRecord>) => {
    const item = state.items.find((record) => record.id === id); if (!item) return undefined; Object.assign(item, input); return item;
  },
}));
vi.mock('../src/repositories/session.repository', () => ({
  findAuthenticatedSession: async (_db: unknown, tokenHash: string) => state.sessions.get(tokenHash),
  createAdminSession: async () => undefined, revokeAdminSession: async () => undefined,
  getLoginRateLimit: async () => undefined, saveLoginRateLimit: async () => undefined, clearLoginRateLimit: async () => undefined,
}));

const { app } = await import('../src/app');
const { hashSessionToken } = await import('../src/services/session.service');
const bindings = { APP_ENV: 'development', CORS_ALLOWED_ORIGINS: 'http://localhost:5173', DB: {} as D1Database, ASSETS: {} as R2Bucket } satisfies Bindings;

async function auth(role: AuthenticatedAdmin['role']) {
  const token = `page-media-${role}`;
  state.sessions.set(await hashSessionToken(token), { sessionId: `${role}-session`, adminId: `${role}-admin`, displayName: role, email: `${role}@example.com`, role });
  return { Cookie: `arunreah_admin_session=${token}` };
}

beforeEach(() => { state.items = [{ id: 'published', placement: 'ABOUT_PROFESSIONAL_DEVELOPMENT', status: 'PUBLISHED', titleEn: 'Team learning', titleKm: 'ការរៀនសូត្ររបស់ក្រុមការងារ', bodyEn: 'Clear guidance for patients.', bodyKm: 'ការណែនាំច្បាស់លាស់សម្រាប់អ្នកជំងឺ។', imageKey: 'clinic/team-learning.png', displayOrder: 1, createdAt: '2026-09-07T00:00:00.000Z', updatedAt: '2026-09-07T00:00:00.000Z' }, { id: 'draft', placement: 'ABOUT_PROFESSIONAL_DEVELOPMENT', status: 'DRAFT', titleEn: 'Draft', titleKm: 'ព្រាង', bodyEn: null, bodyKm: null, imageKey: 'clinic/draft.png', displayOrder: 2, createdAt: '2026-09-07T00:00:00.000Z', updatedAt: '2026-09-07T00:00:00.000Z' }]; state.sessions.clear(); });

describe('page media API routes', () => {
  it('returns only published records in the requested language without authentication', async () => {
    const response = await app.request('http://localhost/api/public/page-media?placement=ABOUT_PROFESSIONAL_DEVELOPMENT&lang=km', undefined, bindings);
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300');
    await expect(response.json()).resolves.toMatchObject({ success: true, data: { items: [{ id: 'published', title: 'ការរៀនសូត្ររបស់ក្រុមការងារ', body: 'ការណែនាំច្បាស់លាស់សម្រាប់អ្នកជំងឺ។' }] } });
  });

  it('requires CMS permission for private editing', async () => {
    const receptionist = await auth('RECEPTIONIST');
    const blocked = await app.request('http://localhost/api/admin/page-media?placement=ABOUT_PROFESSIONAL_DEVELOPMENT', { headers: receptionist }, bindings);
    expect(blocked.status).toBe(403);

    const cmsAdmin = await auth('CMS_ADMIN');
    const allowed = await app.request('http://localhost/api/admin/page-media?placement=ABOUT_PROFESSIONAL_DEVELOPMENT', { headers: cmsAdmin }, bindings);
    expect(allowed.status).toBe(200);
    expect(allowed.headers.get('Cache-Control')).toBe('private, no-store');
  });
});
