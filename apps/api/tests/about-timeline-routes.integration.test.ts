import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedAdmin } from '../src/types/auth';
import type { Bindings } from '../src/types/env';

type TimelineItem = { id: string; year: number; titleEn: string; titleKm: string; bodyEn: string; bodyKm: string; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; displayOrder: number; createdAt: string; updatedAt: string };
type Session = { adminId: string; displayName: string; email: string; role: AuthenticatedAdmin['role']; sessionId: string };
const state = vi.hoisted(() => ({ items: [] as TimelineItem[], sessions: new Map<string, Session>() }));

vi.mock('../src/db/client', () => ({ createDbClient: () => ({}) }));
vi.mock('../src/repositories/about-timeline.repository', () => ({
  create: async () => undefined,
  find: async (_db: unknown, id: string) => state.items.find((item) => item.id === id),
  list: async (_db: unknown, publishedOnly = false) => state.items.filter((item) => !publishedOnly || item.status === 'PUBLISHED'),
  remove: async () => undefined,
  update: async () => undefined,
}));
vi.mock('../src/repositories/session.repository', () => ({ findAuthenticatedSession: async (_db: unknown, hash: string) => state.sessions.get(hash), createAdminSession: async () => undefined, revokeAdminSession: async () => undefined, getLoginRateLimit: async () => undefined, saveLoginRateLimit: async () => undefined, clearLoginRateLimit: async () => undefined }));

const { app } = await import('../src/app');
const { hashSessionToken } = await import('../src/services/session.service');
const bindings = { APP_ENV: 'development', CORS_ALLOWED_ORIGINS: 'http://localhost:5173', DB: {} as D1Database, ASSETS: {} as R2Bucket } satisfies Bindings;
async function auth(role: AuthenticatedAdmin['role']) { const token = `timeline-${role}`; state.sessions.set(await hashSessionToken(token), { sessionId: role, adminId: role, displayName: role, email: `${role}@example.com`, role }); return { Cookie: `arunreah_admin_session=${token}` }; }

beforeEach(() => { state.sessions.clear(); state.items = [{ id: 'published', year: 2000, titleEn: 'Clinic begins', titleKm: 'គ្លីនិកចាប់ផ្តើម', bodyEn: 'Two rooms.', bodyKm: 'បន្ទប់ពីរ។', status: 'PUBLISHED', displayOrder: 10, createdAt: '', updatedAt: '' }, { id: 'draft', year: 2003, titleEn: 'Draft', titleKm: 'ព្រាង', bodyEn: 'Draft.', bodyKm: 'ព្រាង។', status: 'DRAFT', displayOrder: 20, createdAt: '', updatedAt: '' }]; });

describe('about timeline API routes', () => {
  it('returns only published milestones in the requested language without authentication', async () => {
    const response = await app.request('http://localhost/api/public/about-timeline?lang=km', undefined, bindings);
    expect(response.status).toBe(200); expect(response.headers.get('Cache-Control')).toBe('public, max-age=300');
    await expect(response.json()).resolves.toMatchObject({ success: true, data: { items: [{ id: 'published', title: 'គ្លីនិកចាប់ផ្តើម', body: 'បន្ទប់ពីរ។' }] } });
  });
  it('allows CMS admins but denies receptionists in the private editor API', async () => {
    expect((await app.request('http://localhost/api/admin/about-timeline', { headers: await auth('RECEPTIONIST') }, bindings)).status).toBe(403);
    const allowed = await app.request('http://localhost/api/admin/about-timeline', { headers: await auth('CMS_ADMIN') }, bindings);
    expect(allowed.status).toBe(200); expect(allowed.headers.get('Cache-Control')).toBe('private, no-store');
  });
});
