import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedAdmin } from '../src/types/auth';
import type { Bindings } from '../src/types/env';

type BranchRecord = {
  id: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  displayOrder: number;
  nameEn: string;
  nameKm: string;
  badgeEn: string | null;
  badgeKm: string | null;
  addressEn: string;
  addressKm: string;
  cityProvince: string | null;
  shortLocationLabelEn: string | null;
  shortLocationLabelKm: string | null;
  openingHoursEn: string | null;
  openingHoursKm: string | null;
  openingDaysEn: string | null;
  openingDaysKm: string | null;
  openingTime: string | null;
  closingTime: string | null;
  phone: string;
  secondaryPhone: string | null;
  googleMapsUrl: string | null;
  heroImageKey: string | null;
  branchImageKey: string | null;
  heroHeadlineEn: string | null;
  heroHeadlineKm: string | null;
  heroSupportingTextEn: string | null;
  heroSupportingTextKm: string | null;
  heroCtaLabelEn: string | null;
  heroCtaLabelKm: string | null;
  shortSummaryEn: string | null;
  shortSummaryKm: string | null;
  featured: boolean;
  acceptsAppointments: boolean;
  showOnBranchesPage: boolean;
  showOnHomepage: boolean;
  includeInHomepageHero: boolean;
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
  branches: [] as BranchRecord[],
  sessions: new Map<string, SessionRecord>(),
  appointmentBranchIds: new Set<string>(),
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

vi.mock('../src/repositories/branch.repository', () => ({
  findBranchById: async (_database: unknown, id: string) =>
    state.branches.find((branch) => branch.id === id),
  findBranchBySlug: async (_database: unknown, slug: string) =>
    state.branches.find((branch) => branch.slug === slug),
  findPublicBranchBySlug: async (_database: unknown, slug: string) =>
    state.branches.find(
      (branch) =>
        branch.slug === slug && branch.status === 'PUBLISHED' && branch.showOnBranchesPage,
    ),
  createBranch: async (_database: unknown, input: Partial<BranchRecord>) => {
    const branch = {
      ...branchFixture({ id: `branch-${state.branches.length + 1}`, slug: input.slug ?? 'new' }),
      ...input,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    } as BranchRecord;
    state.branches.push(branch);
    return branch;
  },
  updateBranch: async (_database: unknown, id: string, input: Partial<BranchRecord>) => {
    const branch = state.branches.find((item) => item.id === id);
    if (!branch) return undefined;
    Object.assign(branch, input, { updatedAt: '2026-01-02T00:00:00.000Z' });
    return branch;
  },
  deleteBranch: async (_database: unknown, id: string) => {
    state.branches = state.branches.filter((branch) => branch.id !== id);
  },
  countAppointmentsForBranch: async (_database: unknown, id: string) =>
    state.appointmentBranchIds.has(id) ? 1 : 0,
  listPublicBranches: async () =>
    state.branches
      .filter((branch) => branch.status === 'PUBLISHED' && branch.showOnBranchesPage)
      .sort((left, right) => left.displayOrder - right.displayOrder),
  listAdminBranches: async (_database: unknown, query: { page: number; limit: number; status?: string; search?: string; sort: string; order: string }) => {
    let items = [...state.branches];
    if (query.status) items = items.filter((branch) => branch.status === query.status);
    if (query.search) {
      const search = query.search.toLowerCase();
      items = items.filter((branch) =>
        [branch.nameEn, branch.nameKm, branch.addressEn, branch.addressKm, branch.phone]
          .join(' ')
          .toLowerCase()
          .includes(search),
      );
    }
    items.sort((left, right) => {
      const comparison =
        query.sort === 'name'
          ? left.nameEn.localeCompare(right.nameEn)
          : query.sort === 'createdAt'
            ? left.createdAt.localeCompare(right.createdAt)
            : query.sort === 'updatedAt'
              ? left.updatedAt.localeCompare(right.updatedAt)
              : left.displayOrder - right.displayOrder;
      return query.order === 'desc' ? -comparison : comparison;
    });
    const total = items.length;
    return { items: items.slice((query.page - 1) * query.limit, query.page * query.limit), total };
  },
}));

const { app } = await import('../src/app');
const { hashSessionToken } = await import('../src/services/session.service');

const testBindings = {
  APP_ENV: 'development',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
} satisfies Bindings;

function branchFixture(overrides: Partial<BranchRecord> = {}): BranchRecord {
  return {
    id: 'branch-1',
    slug: 'main-branch',
    status: 'PUBLISHED',
    displayOrder: 10,
    nameEn: 'Main Branch',
    nameKm: 'សាខាចម្បង',
    badgeEn: 'Main',
    badgeKm: 'ចម្បង',
    addressEn: 'Phnom Penh',
    addressKm: 'ភ្នំពេញ',
    cityProvince: 'Phnom Penh',
    shortLocationLabelEn: 'TTP',
    shortLocationLabelKm: 'ទួលទំពូង',
    openingHoursEn: '8 AM - 8 PM',
    openingHoursKm: '៨ ព្រឹក - ៨ ល្ងាច',
    openingDaysEn: 'Mon-Sun',
    openingDaysKm: 'ចន្ទ-អាទិត្យ',
    openingTime: '08:00',
    closingTime: '20:00',
    phone: '098 701 302',
    secondaryPhone: '+855 12 964 200',
    googleMapsUrl: 'https://maps.google.com/?q=Arunreah',
    heroImageKey: 'branches/main/hero.webp',
    branchImageKey: 'branches/main/branch.webp',
    heroHeadlineEn: 'Main branch care',
    heroHeadlineKm: 'ការថែទាំសាខាចម្បង',
    heroSupportingTextEn: 'Trusted dental care.',
    heroSupportingTextKm: 'ការថែទាំធ្មេញដែលទុកចិត្តបាន។',
    heroCtaLabelEn: 'Book now',
    heroCtaLabelKm: 'កក់ឥឡូវនេះ',
    shortSummaryEn: 'Convenient city location.',
    shortSummaryKm: 'ទីតាំងងាយស្រួលក្នុងទីក្រុង។',
    featured: true,
    acceptsAppointments: true,
    showOnBranchesPage: true,
    showOnHomepage: true,
    includeInHomepageHero: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createPayload(overrides: Record<string, unknown> = {}) {
  return {
    slug: 'city-branch',
    nameEn: 'City Branch',
    nameKm: 'សាខាក្រុង',
    addressEn: 'Phnom Penh',
    addressKm: 'ភ្នំពេញ',
    phone: '012 964 200',
    ...overrides,
  };
}

async function authenticatedHeaders(role: AuthenticatedAdmin['role']) {
  const token = `branches-${role}`;
  state.sessions.set(await hashSessionToken(token), {
    sessionId: `${role}-session-id`,
    adminId: `${role}-admin-id`,
    displayName: `${role} Admin`,
    email: `${role.toLowerCase()}@example.com`,
    role,
  });
  return { Cookie: `arunreah_admin_session=${token}` };
}

beforeEach(() => {
  state.branches = [];
  state.sessions.clear();
  state.appointmentBranchIds.clear();
});

describe('branch API routes', () => {
  it('returns only published visible branches and localizes public content', async () => {
    state.branches = [
      branchFixture(),
      branchFixture({ id: 'branch-2', slug: 'draft-branch', status: 'DRAFT' }),
      branchFixture({ id: 'branch-3', slug: 'hidden-branch', showOnBranchesPage: false }),
    ];

    const listResponse = await app.request(
      'http://localhost/api/public/branches?lang=km',
      undefined,
      testBindings,
    );
    expect(listResponse.status).toBe(200);
    expect(listResponse.headers.get('Cache-Control')).toBe('public, max-age=300');
    await expect(listResponse.json()).resolves.toMatchObject({
      success: true,
      data: { branches: [{ slug: 'main-branch', name: 'សាខាចម្បង' }] },
    });

    const detailResponse = await app.request(
      'http://localhost/api/public/branches/main-branch?lang=en',
      undefined,
      testBindings,
    );
    expect(detailResponse.status).toBe(200);
    await expect(detailResponse.json()).resolves.toMatchObject({
      success: true,
      data: { branch: { name: 'Main Branch', acceptsAppointments: true } },
    });

    expect(
      (
        await app.request(
          'http://localhost/api/public/branches/draft-branch',
          undefined,
          testBindings,
        )
      ).status,
    ).toBe(404);
  });

  it('enforces CMS permissions for all admin branch routes', async () => {
    const unauthenticatedResponse = await app.request(
      'http://localhost/api/admin/branches',
      undefined,
      testBindings,
    );
    expect(unauthenticatedResponse.status).toBe(401);

    const receptionistHeaders = await authenticatedHeaders('RECEPTIONIST');
    const forbiddenResponse = await app.request(
      'http://localhost/api/admin/branches',
      { headers: receptionistHeaders },
      testBindings,
    );
    expect(forbiddenResponse.status).toBe(403);
  });

  it('creates branches, rejects duplicate slugs, and allows CMS admins to read paginated lists', async () => {
    const headers = await authenticatedHeaders('CMS_ADMIN');
    const createResponse = await app.request(
      'http://localhost/api/admin/branches',
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload({ status: 'PUBLISHED', displayOrder: 20 })),
      },
      testBindings,
    );
    expect(createResponse.status).toBe(201);
    await expect(createResponse.json()).resolves.toMatchObject({
      success: true,
      data: { branch: { slug: 'city-branch', status: 'PUBLISHED' } },
    });

    const duplicateResponse = await app.request(
      'http://localhost/api/admin/branches',
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload()),
      },
      testBindings,
    );
    expect(duplicateResponse.status).toBe(409);

    const invalidResponse = await app.request(
      'http://localhost/api/admin/branches',
      {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload({ slug: 'Invalid Slug', phone: 'not a phone!' })),
      },
      testBindings,
    );
    expect(invalidResponse.status).toBe(400);

    state.branches.push(branchFixture());
    const listResponse = await app.request(
      'http://localhost/api/admin/branches?page=1&limit=1&search=Main&sort=name&order=asc',
      { headers },
      testBindings,
    );
    expect(listResponse.status).toBe(200);
    await expect(listResponse.json()).resolves.toMatchObject({
      success: true,
      data: { branches: [{ slug: 'main-branch' }], meta: { page: 1, limit: 1, total: 1 } },
    });

    const detailResponse = await app.request(
      'http://localhost/api/admin/branches/branch-1',
      { headers },
      testBindings,
    );
    expect(detailResponse.status).toBe(200);

    const unsafeSortResponse = await app.request(
      'http://localhost/api/admin/branches?sort=drop-table',
      { headers },
      testBindings,
    );
    expect(unsafeSortResponse.status).toBe(400);
  });

  it('supports partial updates without resetting fields and rejects duplicate-slug updates', async () => {
    state.branches = [branchFixture(), branchFixture({ id: 'branch-2', slug: 'city-branch' })];
    const cmsHeaders = await authenticatedHeaders('CMS_ADMIN');

    const updateResponse = await app.request(
      'http://localhost/api/admin/branches/branch-1',
      {
        method: 'PATCH',
        headers: { ...cmsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '012 964 200',
          acceptsAppointments: false,
          showOnBranchesPage: false,
        }),
      },
      testBindings,
    );
    expect(updateResponse.status).toBe(200);
    await expect(updateResponse.json()).resolves.toMatchObject({
      success: true,
      data: {
        branch: {
          phone: '012 964 200',
          acceptsAppointments: false,
          showOnBranchesPage: false,
          addressEn: 'Phnom Penh',
          heroImageKey: 'branches/main/hero.webp',
        },
      },
    });

    const duplicateSlugResponse = await app.request(
      'http://localhost/api/admin/branches/branch-1',
      {
        method: 'PATCH',
        headers: {
          ...(await authenticatedHeaders('SUPER_ADMIN')),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: 'city-branch' }),
      },
      testBindings,
    );
    expect(duplicateSlugResponse.status).toBe(409);
  });

  it('deletes unused branches but protects appointment-referenced branches', async () => {
    state.branches = [branchFixture(), branchFixture({ id: 'branch-2', slug: 'in-use' })];
    state.appointmentBranchIds.add('branch-2');
    const headers = await authenticatedHeaders('SUPER_ADMIN');

    const conflictResponse = await app.request(
      'http://localhost/api/admin/branches/branch-2',
      { method: 'DELETE', headers },
      testBindings,
    );
    expect(conflictResponse.status).toBe(409);
    await expect(conflictResponse.json()).resolves.toMatchObject({
      success: false,
      error: { code: 'CONFLICT' },
    });

    const deleteResponse = await app.request(
      'http://localhost/api/admin/branches/branch-1',
      { method: 'DELETE', headers },
      testBindings,
    );
    expect(deleteResponse.status).toBe(200);
    await expect(deleteResponse.json()).resolves.toEqual({ success: true, data: { deleted: true } });
  });
});
