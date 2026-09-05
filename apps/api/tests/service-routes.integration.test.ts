import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedAdmin } from '../src/types/auth';
import type { Bindings } from '../src/types/env';

type ServiceRecord = {
  id: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  displayOrder: number;
  nameEn: string;
  nameKm: string;
  summaryEn: string | null;
  summaryKm: string | null;
  descriptionEn: string | null;
  descriptionKm: string | null;
  imageKey: string | null;
  category: string | null;
  heroEyebrowEn: string | null;
  heroEyebrowKm: string | null;
  heroTitleEn: string | null;
  heroTitleKm: string | null;
  heroSummaryEn: string | null;
  heroSummaryKm: string | null;
  heroImageKey: string | null;
  aboutTitleEn: string | null;
  aboutTitleKm: string | null;
  aboutBodyEn: string | null;
  aboutBodyKm: string | null;
  aboutImageKey: string | null;
  durationEn: string | null;
  durationKm: string | null;
  recoveryEn: string | null;
  recoveryKm: string | null;
  visitsEn: string | null;
  visitsKm: string | null;
  consultationEn: string | null;
  consultationKm: string | null;
  ctaTitleEn: string | null;
  ctaTitleKm: string | null;
  ctaDescriptionEn: string | null;
  ctaDescriptionKm: string | null;
  primaryCtaLabelEn: string | null;
  primaryCtaLabelKm: string | null;
  secondaryCtaLabelEn: string | null;
  secondaryCtaLabelKm: string | null;
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

type ServiceInput = Partial<ServiceRecord> & {
  benefits?: Array<Record<string, unknown>>;
  relatedServiceIds?: string[];
};

const state = vi.hoisted(() => ({
  services: [] as ServiceRecord[],
  benefits: new Map<string, Array<Record<string, unknown>>>(),
  related: new Map<string, string[]>(),
  sessions: new Map<string, SessionRecord>(),
  appointmentServiceIds: new Set<string>(),
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

vi.mock('../src/repositories/service.repository', () => ({
  findServiceById: async (_database: unknown, id: string) =>
    state.services.find((service) => service.id === id),
  findServiceBySlug: async (_database: unknown, slug: string) =>
    state.services.find((service) => service.slug === slug),
  findPublicServiceBySlug: async (_database: unknown, slug: string) =>
    state.services.find((service) => service.slug === slug && service.status === 'PUBLISHED'),
  createService: async (_database: unknown, input: ServiceInput) => {
    const service = {
      ...serviceFixture({ id: `service-${state.services.length + 1}`, slug: input.slug ?? 'new' }),
      ...input,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as ServiceRecord;
    state.services.push(service);
    state.benefits.set(service.id, input.benefits ?? []);
    state.related.set(service.id, input.relatedServiceIds ?? []);
    return service;
  },
  updateService: async (_database: unknown, id: string, input: ServiceInput) => {
    const service = state.services.find((item) => item.id === id);
    if (!service) return undefined;
    const { benefits, relatedServiceIds, ...updates } = input;
    Object.assign(service, updates, { updatedAt: '2026-01-02T00:00:00.000Z' });
    if (benefits !== undefined) state.benefits.set(id, benefits);
    if (relatedServiceIds !== undefined) state.related.set(id, relatedServiceIds);
    return service;
  },
  getBenefits: async (_database: unknown, id: string) => state.benefits.get(id) ?? [],
  getRelated: async (_database: unknown, id: string) =>
    (state.related.get(id) ?? [])
      .map((relatedId) => state.services.find((service) => service.id === relatedId))
      .filter((service): service is ServiceRecord => service !== undefined)
      .map((service, index) => ({
        relation: { relatedServiceId: service.id, displayOrder: index },
        service,
      })),
  countAppointmentsForService: async (_database: unknown, id: string) =>
    state.appointmentServiceIds.has(id) ? 1 : 0,
  deleteService: async (_database: unknown, id: string) => {
    state.services = state.services.filter((service) => service.id !== id);
  },
  listPublicServices: async () =>
    state.services
      .filter((service) => service.status === 'PUBLISHED')
      .sort((left, right) => left.displayOrder - right.displayOrder),
  listAdminServices: async (_database: unknown, query: { page: number; limit: number }) => ({
    items: state.services.slice((query.page - 1) * query.limit, query.page * query.limit),
    total: state.services.length,
  }),
  servicesExist: async (_database: unknown, ids: string[]) =>
    state.services
      .filter((service) => ids.includes(service.id))
      .map((service) => ({ id: service.id })),
}));

const { app } = await import('../src/app');
const { hashSessionToken } = await import('../src/services/session.service');

const testBindings = {
  APP_ENV: 'development',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
} satisfies Bindings;

function serviceFixture(overrides: Partial<ServiceRecord> = {}): ServiceRecord {
  return {
    id: 'service-1',
    slug: 'dental-implants',
    status: 'PUBLISHED',
    featured: true,
    displayOrder: 10,
    nameEn: 'Dental Implants',
    nameKm: 'ដាំធ្មេញ',
    summaryEn: 'Restore your smile.',
    summaryKm: 'ស្ដារស្នាមញញឹមរបស់អ្នក។',
    descriptionEn: null,
    descriptionKm: null,
    imageKey: 'services/implants/card.webp',
    category: 'Restorative',
    heroEyebrowEn: null,
    heroEyebrowKm: null,
    heroTitleEn: 'Dental Implants',
    heroTitleKm: 'ដាំធ្មេញ',
    heroSummaryEn: null,
    heroSummaryKm: null,
    heroImageKey: 'services/implants/hero.webp',
    aboutTitleEn: null,
    aboutTitleKm: null,
    aboutBodyEn: null,
    aboutBodyKm: null,
    aboutImageKey: null,
    durationEn: '3-9 Months',
    durationKm: '៣-៩ ខែ',
    recoveryEn: null,
    recoveryKm: null,
    visitsEn: null,
    visitsKm: null,
    consultationEn: null,
    consultationKm: null,
    ctaTitleEn: null,
    ctaTitleKm: null,
    ctaDescriptionEn: null,
    ctaDescriptionKm: null,
    primaryCtaLabelEn: null,
    primaryCtaLabelKm: null,
    secondaryCtaLabelEn: null,
    secondaryCtaLabelKm: null,
    metaTitleEn: null,
    metaTitleKm: null,
    metaDescriptionEn: null,
    metaDescriptionKm: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

async function authenticatedHeaders(role: AuthenticatedAdmin['role']) {
  const token = `services-${role}`;
  state.sessions.set(await hashSessionToken(token), {
    sessionId: `${role}-session-id`,
    adminId: `${role}-admin-id`,
    displayName: `${role} Admin`,
    email: `${role.toLowerCase()}@example.com`,
    role,
  });
  return { Cookie: `arunreah_admin_session=${token}` };
}

function createPayload(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'teeth-whitening',
    nameEn: 'Teeth Whitening',
    nameKm: 'ធ្វើឱ្យធ្មេញស',
    ...overrides,
  };
}

beforeEach(() => {
  state.services = [];
  state.benefits.clear();
  state.related.clear();
  state.sessions.clear();
  state.appointmentServiceIds.clear();
});

describe('service API routes', () => {
  it('returns published summaries and localized public details without authentication', async () => {
    state.services = [
      serviceFixture(),
      serviceFixture({ id: 'service-2', slug: 'draft', status: 'DRAFT' }),
    ];
    state.benefits.set('service-1', [
      {
        titleEn: 'Durable',
        titleKm: 'រឹងមាំ',
        descriptionEn: null,
        descriptionKm: null,
        icon: 'check',
        displayOrder: 0,
      },
    ]);
    const list = await app.request(
      'http://localhost/api/public/services?lang=km',
      undefined,
      testBindings,
    );
    expect(list.status).toBe(200);
    await expect(list.json()).resolves.toMatchObject({
      success: true,
      data: { services: [{ id: 'service-1', slug: 'dental-implants', name: 'ដាំធ្មេញ' }] },
    });
    const detail = await app.request(
      'http://localhost/api/public/services/dental-implants?lang=en',
      undefined,
      testBindings,
    );
    expect(detail.status).toBe(200);
    await expect(detail.json()).resolves.toMatchObject({
      success: true,
      data: { service: { hero: { title: 'Dental Implants' }, benefits: [{ title: 'Durable' }] } },
    });
    expect(
      (await app.request('http://localhost/api/public/services/draft', undefined, testBindings))
        .status,
    ).toBe(404);
  });

  it('enforces CMS authorization on service management', async () => {
    expect(
      (await app.request('http://localhost/api/admin/services', undefined, testBindings)).status,
    ).toBe(401);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/services',
          { headers: await authenticatedHeaders('RECEPTIONIST') },
          testBindings,
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/services',
          { headers: await authenticatedHeaders('CMS_ADMIN') },
          testBindings,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/services',
          { headers: await authenticatedHeaders('SUPER_ADMIN') },
          testBindings,
        )
      ).status,
    ).toBe(200);
  });

  it('creates, reads, and partially updates a service without resetting nested content', async () => {
    const headers = await authenticatedHeaders('CMS_ADMIN');
    const create = await app.request(
      'http://localhost/api/admin/services',
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(
          createPayload({
            benefits: [{ titleEn: 'Safe', titleKm: 'សុវត្ថិភាព', displayOrder: 0 }],
          }),
        ),
      },
      testBindings,
    );
    expect(create.status).toBe(201);
    const duplicate = await app.request(
      'http://localhost/api/admin/services',
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload()),
      },
      testBindings,
    );
    expect(duplicate.status).toBe(409);
    const update = await app.request(
      'http://localhost/api/admin/services/service-1',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: true }),
      },
      testBindings,
    );
    expect(update.status).toBe(200);
    expect(state.benefits.get('service-1')).toHaveLength(1);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/services/service-1',
          { headers },
          testBindings,
        )
      ).status,
    ).toBe(200);
  });

  it('validates related services and protects appointment-referenced records from deletion', async () => {
    state.services = [serviceFixture(), serviceFixture({ id: 'service-2', slug: 'whitening' })];
    const headers = await authenticatedHeaders('SUPER_ADMIN');
    const selfReference = await app.request(
      'http://localhost/api/admin/services/service-1',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ relatedServiceIds: ['service-1'] }),
      },
      testBindings,
    );
    expect(selfReference.status).toBe(400);
    const relatedUpdate = await app.request(
      'http://localhost/api/admin/services/service-1',
      {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ relatedServiceIds: ['service-2'] }),
      },
      testBindings,
    );
    expect(relatedUpdate.status).toBe(200);
    state.appointmentServiceIds.add('service-1');
    expect(
      (
        await app.request(
          'http://localhost/api/admin/services/service-1',
          { method: 'DELETE', headers },
          testBindings,
        )
      ).status,
    ).toBe(409);
    expect(
      (
        await app.request(
          'http://localhost/api/admin/services/service-2',
          { method: 'DELETE', headers },
          testBindings,
        )
      ).status,
    ).toBe(200);
  });
});
