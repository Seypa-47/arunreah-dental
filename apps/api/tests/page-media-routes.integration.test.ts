import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedAdmin } from '../src/types/auth';
import type { Bindings } from '../src/types/env';

type PageMediaRecord = {
  badgeEn?: string | null; badgeKm?: string | null; benefitsEn?: string | null; benefitsKm?: string | null;
  bodyEn: string | null; bodyKm: string | null; createdAt: string; displayOrder: number; id: string;
  imageKey: string; placement: 'HOME_PROMOTIONS' | 'ABOUT_PROFESSIONAL_DEVELOPMENT' | 'ABOUT_ADVANCED_FACILITIES' | 'DOCTORS_PATIENT_EDUCATION'; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  discountEn?: string | null; discountKm?: string | null; titleEn: string | null; titleKm: string | null; updatedAt: string; validUntil?: string | null;
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
  listAdmin: async (_db: unknown, placement: PageMediaRecord['placement']) => state.items.filter((item) => item.placement === placement),
  listPublic: async (_db: unknown, placement: PageMediaRecord['placement']) => state.items.filter((item) => item.placement === placement && item.status === 'PUBLISHED'),
  remove: async (_db: unknown, id: string) => { state.items = state.items.filter((item) => item.id !== id); },
  update: async (_db: unknown, id: string, input: Partial<PageMediaRecord>) => {
    const item = state.items.find((record) => record.id === id); if (!item) return undefined; Object.assign(item, input); return item;
  },
}));
vi.mock('../src/repositories/image-presentation.repository', () => ({
  listForPageMedia: async () => [],
  removeForPageMedia: async () => undefined,
  upsertForPageMedia: async () => undefined,
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

  it('accepts the Advanced Facilities placement for public CMS content', async () => {
    state.items = [{ id: 'facility', placement: 'ABOUT_ADVANCED_FACILITIES', status: 'PUBLISHED', titleEn: 'Digital scanning', titleKm: 'ការស្កេនឌីជីថល', bodyEn: 'A digital impression workflow.', bodyKm: 'ប្រព័ន្ធស្កេនឌីជីថល។', imageKey: 'clinic/digital-scanning.jpg', displayOrder: 10, createdAt: '2026-09-07T00:00:00.000Z', updatedAt: '2026-09-07T00:00:00.000Z' }];

    const response = await app.request('http://localhost/api/public/page-media?placement=ABOUT_ADVANCED_FACILITIES&lang=en', undefined, bindings);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ success: true, data: { items: [{ id: 'facility', title: 'Digital scanning' }] } });
  });

  it('accepts the Home Promotions placement for public CMS content', async () => {
    state.items = [{ id: 'promotion', placement: 'HOME_PROMOTIONS', status: 'PUBLISHED', titleEn: 'Care campaign', titleKm: 'កម្មវិធីថែទាំ', bodyEn: 'Current clinic information.', bodyKm: 'ព័ត៌មានបច្ចុប្បន្នពីគ្លីនិក។', badgeEn: 'Limited time', badgeKm: 'រយៈពេលកំណត់', discountEn: '20% OFF', discountKm: 'បញ្ចុះតម្លៃ 20%', benefitsEn: 'Friendly care\nClear next steps', benefitsKm: 'ការថែទាំប្រកបដោយក្តីស្រឡាញ់\nជំហានបន្ទាប់ច្បាស់លាស់', validUntil: '2026-12-31', imageKey: 'clinic/care-campaign.jpg', displayOrder: 10, createdAt: '2026-09-14T00:00:00.000Z', updatedAt: '2026-09-14T00:00:00.000Z' }];

    const response = await app.request('http://localhost/api/public/page-media?placement=HOME_PROMOTIONS&lang=en', undefined, bindings);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ success: true, data: { items: [{ id: 'promotion', title: 'Care campaign', badge: 'Limited time', discount: '20% OFF', benefits: 'Friendly care\nClear next steps', imagePresentation: { positionX: 50, positionY: 50, zoom: 1 }, validUntil: '2026-12-31' }] } });
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
