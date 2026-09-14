import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedAdmin } from '../src/types/auth';
import type { Bindings } from '../src/types/env';

type ShowcaseRecord = {
  id: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  showOnHomepage: boolean;
  displayOrder: number;
  titleEn: string;
  titleKm: string;
  categoryEn: string | null;
  categoryKm: string | null;
  excerptEn: string | null;
  excerptKm: string | null;
  bodyEn: string | null;
  bodyKm: string | null;
  coverImageKey: string | null;
  metaTitleEn: string | null;
  metaTitleKm: string | null;
  metaDescriptionEn: string | null;
  metaDescriptionKm: string | null;
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
type ShowcaseInput = Partial<ShowcaseRecord> & {
  summaryEn?: string | null;
  summaryKm?: string | null;
  sections?: Array<Record<string, unknown>>;
  relatedShowcaseIds?: string[];
};

const state = vi.hoisted(() => ({
  showcases: [] as ShowcaseRecord[],
  sections: new Map<string, Array<Record<string, unknown>>>(),
  related: new Map<string, string[]>(),
  sessions: new Map<string, SessionRecord>(),
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
vi.mock('../src/repositories/showcase.repository', () => ({
  findShowcaseById: async (_database: unknown, id: string) =>
    state.showcases.find((item) => item.id === id),
  findShowcaseBySlug: async (_database: unknown, slug: string) =>
    state.showcases.find((item) => item.slug === slug),
  findPublicShowcaseBySlug: async (_database: unknown, slug: string) =>
    state.showcases.find((item) => item.slug === slug && item.status === 'PUBLISHED'),
  createShowcase: async (_database: unknown, input: ShowcaseInput) => {
    const showcase = {
      ...fixture({ id: `showcase-${state.showcases.length + 1}`, slug: input.slug ?? 'new' }),
      ...input,
      excerptEn: input.summaryEn,
      excerptKm: input.summaryKm,
    } as ShowcaseRecord;
    state.showcases.push(showcase);
    state.sections.set(showcase.id, input.sections ?? []);
    state.related.set(showcase.id, input.relatedShowcaseIds ?? []);
    return showcase;
  },
  updateShowcase: async (_database: unknown, id: string, input: ShowcaseInput) => {
    const showcase = state.showcases.find((item) => item.id === id);
    if (!showcase) return undefined;
    const { summaryEn, summaryKm, sections, relatedShowcaseIds, ...updates } = input;
    Object.assign(showcase, updates);
    if (summaryEn !== undefined) showcase.excerptEn = summaryEn;
    if (summaryKm !== undefined) showcase.excerptKm = summaryKm;
    if (sections !== undefined) state.sections.set(id, sections);
    if (relatedShowcaseIds !== undefined) state.related.set(id, relatedShowcaseIds);
    return showcase;
  },
  getSections: async (_database: unknown, id: string) => state.sections.get(id) ?? [],
  getRelatedShowcases: async (_database: unknown, id: string) =>
    (state.related.get(id) ?? [])
      .map((relatedId) => state.showcases.find((item) => item.id === relatedId))
      .filter((item): item is ShowcaseRecord => item !== undefined)
      .map((showcase, index) => ({
        relation: { relatedShowcaseId: showcase.id, displayOrder: index },
        showcase,
      })),
  showcasesExist: async (_database: unknown, ids: string[]) =>
    state.showcases.filter((item) => ids.includes(item.id)).map((item) => ({ id: item.id })),
  deleteShowcase: async (_database: unknown, id: string) => {
    state.showcases = state.showcases.filter((item) => item.id !== id);
  },
  listAdminShowcases: async (_database: unknown, query: { page: number; limit: number }) => ({
    items: state.showcases.slice((query.page - 1) * query.limit, query.page * query.limit),
    total: state.showcases.length,
  }),
  listPublicShowcases: async (_database: unknown, homepageOnly = false) =>
    state.showcases
      .filter((item) => item.status === 'PUBLISHED' && (!homepageOnly || item.showOnHomepage))
      .sort((a, b) => a.displayOrder - b.displayOrder),
}));

const { app } = await import('../src/app');
const { hashSessionToken } = await import('../src/services/session.service');
const bindings = {
  APP_ENV: 'development',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
} satisfies Bindings;
function fixture(overrides: Partial<ShowcaseRecord> = {}): ShowcaseRecord {
  return {
    id: 'showcase-1',
    slug: 'smile-transformation',
    status: 'PUBLISHED',
    showOnHomepage: true,
    displayOrder: 10,
    titleEn: 'Smile Transformation',
    titleKm: 'ការផ្លាស់ប្តូរស្នាមញញឹម',
    categoryEn: 'Case Study',
    categoryKm: 'ករណីសិក្សា',
    excerptEn: 'A modern result.',
    excerptKm: 'លទ្ធផលទំនើប។',
    bodyEn: 'Full article.',
    bodyKm: 'អត្ថបទពេញលេញ។',
    coverImageKey: 'showcases/smile/cover.webp',
    metaTitleEn: null,
    metaTitleKm: null,
    metaDescriptionEn: null,
    metaDescriptionKm: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}
async function headers(role: AuthenticatedAdmin['role']) {
  const token = `showcase-${role}`;
  state.sessions.set(await hashSessionToken(token), {
    sessionId: `${role}-session`,
    adminId: `${role}-admin`,
    displayName: `${role} Admin`,
    email: `${role}@example.com`,
    role,
  });
  return { Cookie: `arunreah_admin_session=${token}` };
}
function payload(overrides: Record<string, unknown> = {}) {
  return { slug: 'implant-case', titleEn: 'Implant Case', titleKm: 'ករណីដាំធ្មេញ', ...overrides };
}
beforeEach(() => {
  state.showcases = [];
  state.sections.clear();
  state.related.clear();
  state.sessions.clear();
});

describe('showcase API routes', () => {
  it('returns localized public card/detail content and hides drafts', async () => {
    state.showcases = [
      fixture(),
      fixture({ id: 'showcase-2', slug: 'draft', status: 'DRAFT' }),
      fixture({ id: 'showcase-3', slug: 'not-home', showOnHomepage: false }),
    ];
    state.sections.set('showcase-1', [
      {
        sectionType: 'TEXT',
        headingEn: 'Plan',
        headingKm: 'ផែនការ',
        bodyEn: 'Details',
        bodyKm: 'ព័ត៌មាន',
        imageKey: null,
        displayOrder: 0,
      },
    ]);
    const list = await app.request(
      'http://localhost/api/public/showcases?lang=km',
      undefined,
      bindings,
    );
    await expect(list.json()).resolves.toMatchObject({
      success: true,
      data: {
        showcases: expect.arrayContaining([
          expect.objectContaining({ title: 'ការផ្លាស់ប្តូរស្នាមញញឹម' }),
        ]),
      },
    });
    const homepage = await app.request(
      'http://localhost/api/public/showcases?homepage=true',
      undefined,
      bindings,
    );
    await expect(homepage.json()).resolves.toMatchObject({
      data: { showcases: [{ slug: 'smile-transformation' }] },
    });
    const detail = await app.request(
      'http://localhost/api/public/showcases/smile-transformation?lang=en',
      undefined,
      bindings,
    );
    await expect(detail.json()).resolves.toMatchObject({
      data: { showcase: { body: 'Full article.', sections: [{ heading: 'Plan' }] } },
    });
    expect(
      (await app.request('http://localhost/api/public/showcases/draft', undefined, bindings))
        .status,
    ).toBe(404);
  });
  it('enforces CMS authorization', async () => {
    expect(
      (await app.request('http://localhost/api/admin/showcases', undefined, bindings)).status,
    ).toBe(401);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/showcases',
          { headers: await headers('RECEPTIONIST') },
          bindings,
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/showcases',
          { headers: await headers('CMS_ADMIN') },
          bindings,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/showcases',
          { headers: await headers('SUPER_ADMIN') },
          bindings,
        )
      ).status,
    ).toBe(200);
  });
  it('creates, updates, and preserves omitted sections', async () => {
    const cmsHeaders = await headers('CMS_ADMIN');
    expect(
      (
        await app.request(
          'http://localhost/api/admin/showcases',
          {
            method: 'POST',
            headers: { ...cmsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify(
              payload({ sections: [{ headingEn: 'Step', headingKm: 'ជំហាន' }] }),
            ),
          },
          bindings,
        )
      ).status,
    ).toBe(201);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/showcases',
          {
            method: 'POST',
            headers: { ...cmsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload()),
          },
          bindings,
        )
      ).status,
    ).toBe(409);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/showcases/showcase-1',
          {
            method: 'PATCH',
            headers: { ...cmsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ showOnHomepage: true }),
          },
          bindings,
        )
      ).status,
    ).toBe(200);
    expect(state.sections.get('showcase-1')).toHaveLength(1);
  });
  it('validates related showcases and cleans up relationships during deletion', async () => {
    state.showcases = [fixture(), fixture({ id: 'showcase-2', slug: 'implant-case' })];
    const superHeaders = await headers('SUPER_ADMIN');
    expect(
      (
        await app.request(
          'http://localhost/api/admin/showcases/showcase-1',
          {
            method: 'PATCH',
            headers: { ...superHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ relatedShowcaseIds: ['showcase-1'] }),
          },
          bindings,
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/showcases/showcase-1',
          {
            method: 'PATCH',
            headers: { ...superHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ relatedShowcaseIds: ['missing'] }),
          },
          bindings,
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/showcases/showcase-2',
          { method: 'DELETE', headers: superHeaders },
          bindings,
        )
      ).status,
    ).toBe(200);
  });
});
