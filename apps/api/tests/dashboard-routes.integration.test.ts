import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedAdmin } from '../src/types/auth';
import type { Bindings } from '../src/types/env';

type SessionRecord = {
  sessionId: string;
  adminId: string;
  displayName: string;
  email: string;
  role: AuthenticatedAdmin['role'];
};

const state = vi.hoisted(() => ({
  sessions: new Map<string, SessionRecord>(),
  appointmentSummary: { pending: 3, confirmedToday: 2, confirmedThisWeek: 4 },
  recentAppointments: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      reference: 'AR-20260902-ABC123',
      patientName: 'Sok Dara',
      serviceNameSnapshot: 'Dental Implants',
      preferredDate: '2026-09-02',
      preferredTime: '10:30',
      status: 'PENDING' as const,
      createdAt: '2026-09-02T10:00:00.000Z',
    },
  ],
  contentSummary: {
    services: { total: 4, published: 3, draft: 1, archived: 0 },
    doctors: { total: 3, published: 2, draft: 0, archived: 1 },
    showcases: { total: 2, published: 1, draft: 1, archived: 0 },
    branches: { total: 2, published: 2, draft: 0, archived: 0 },
  },
  calls: { appointments: 0, recentAppointments: 0, content: 0 },
}));

vi.mock('../src/db/client', () => ({ createDbClient: () => ({}) }));
vi.mock('../src/repositories/session.repository', () => ({
  findAuthenticatedSession: async (_database: unknown, tokenHash: string) =>
    state.sessions.get(tokenHash),
}));
vi.mock('../src/repositories/dashboard.repository', () => ({
  getAppointmentDashboardSummary: async () => {
    state.calls.appointments += 1;
    return state.appointmentSummary;
  },
  getRecentDashboardAppointments: async () => {
    state.calls.recentAppointments += 1;
    return state.recentAppointments;
  },
  getContentDashboardSummary: async () => {
    state.calls.content += 1;
    return state.contentSummary;
  },
}));

const { app } = await import('../src/app');
const { hashSessionToken } = await import('../src/services/session.service');
const { getClinicWeekRange } = await import('../src/config/time');

const bindings = {
  APP_ENV: 'development',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
} satisfies Bindings;

async function headersFor(role: AuthenticatedAdmin['role']) {
  const token = `dashboard-${role}`;
  state.sessions.set(await hashSessionToken(token), {
    sessionId: `${role}-session`,
    adminId: `${role}-admin`,
    displayName: `${role} Admin`,
    email: `${role.toLowerCase()}@example.com`,
    role,
  });
  return { Cookie: `arunreah_admin_session=${token}` };
}

async function dashboard(role?: AuthenticatedAdmin['role'], suffix = '') {
  return app.request(
    `http://localhost/api/admin/dashboard${suffix}`,
    { headers: role ? await headersFor(role) : undefined },
    bindings,
  );
}

beforeEach(() => {
  state.sessions.clear();
  state.calls = { appointments: 0, recentAppointments: 0, content: 0 };
  state.appointmentSummary = { pending: 3, confirmedToday: 2, confirmedThisWeek: 4 };
  state.recentAppointments = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      reference: 'AR-20260902-ABC123',
      patientName: 'Sok Dara',
      serviceNameSnapshot: 'Dental Implants',
      preferredDate: '2026-09-02',
      preferredTime: '10:30',
      status: 'PENDING',
      createdAt: '2026-09-02T10:00:00.000Z',
    },
  ];
  state.contentSummary = {
    services: { total: 4, published: 3, draft: 1, archived: 0 },
    doctors: { total: 3, published: 2, draft: 0, archived: 1 },
    showcases: { total: 2, published: 1, draft: 1, archived: 0 },
    branches: { total: 2, published: 2, draft: 0, archived: 0 },
  };
});

describe('admin dashboard API', () => {
  it('requires a valid authenticated session', async () => {
    expect((await dashboard()).status).toBe(401);
    const expired = await app.request(
      'http://localhost/api/admin/dashboard',
      { headers: { Cookie: 'arunreah_admin_session=expired-token' } },
      bindings,
    );
    expect(expired.status).toBe(401);
  });

  it('returns only appointment operations data for receptionists', async () => {
    const response = await dashboard('RECEPTIONIST');
    const body = await response.json<{ data: Record<string, unknown> }>();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      role: 'RECEPTIONIST',
      appointments: { pending: 3, confirmedToday: 2, confirmedThisWeek: 4 },
      recentAppointments: [
        {
          reference: 'AR-20260902-ABC123',
          patientName: 'Sok Dara',
          serviceNameSnapshot: 'Dental Implants',
        },
      ],
    });
    expect(body.data).not.toHaveProperty('content');
    expect(JSON.stringify(body.data)).not.toContain('patientEmail');
    expect(JSON.stringify(body.data)).not.toContain('patientNote');
    expect(state.calls).toEqual({ appointments: 1, recentAppointments: 1, content: 0 });
  });

  it('returns content metrics only for CMS admins, ignoring a client-supplied role', async () => {
    const response = await dashboard('CMS_ADMIN', '?role=SUPER_ADMIN');
    const body = await response.json<{ data: Record<string, unknown> }>();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      role: 'CMS_ADMIN',
      content: { services: { total: 4, published: 3, draft: 1, archived: 0 } },
    });
    expect(body.data).not.toHaveProperty('appointments');
    expect(body.data).not.toHaveProperty('recentAppointments');
    expect(JSON.stringify(body.data)).not.toContain('Sok Dara');
    expect(state.calls).toEqual({ appointments: 0, recentAppointments: 0, content: 1 });
  });

  it('returns both authorized dashboard sections for super admins', async () => {
    const response = await dashboard('SUPER_ADMIN');
    const body = await response.json<{ data: Record<string, unknown> }>();

    expect(response.status).toBe(200);
    expect(body.data).toHaveProperty('appointments');
    expect(body.data).toHaveProperty('content');
    expect(body.data).toHaveProperty('recentAppointments');
    expect(state.calls).toEqual({ appointments: 1, recentAppointments: 1, content: 1 });
  });

  it('returns zero metrics and an empty recent list for a fresh system', async () => {
    state.appointmentSummary = { pending: 0, confirmedToday: 0, confirmedThisWeek: 0 };
    state.recentAppointments = [];
    state.contentSummary = {
      services: { total: 0, published: 0, draft: 0, archived: 0 },
      doctors: { total: 0, published: 0, draft: 0, archived: 0 },
      showcases: { total: 0, published: 0, draft: 0, archived: 0 },
      branches: { total: 0, published: 0, draft: 0, archived: 0 },
    };

    const body = await (await dashboard('SUPER_ADMIN')).json<{ data: Record<string, unknown> }>();
    expect(body.data).toMatchObject({
      appointments: { pending: 0, confirmedToday: 0, confirmedThisWeek: 0 },
      content: { services: { total: 0 } },
      recentAppointments: [],
    });
  });
});

describe('Cambodia dashboard date ranges', () => {
  it('uses Cambodia local calendar boundaries for Monday-through-Sunday confirmation metrics', () => {
    const range = getClinicWeekRange(new Date('2026-09-06T17:30:00.000Z'));
    expect(range).toEqual({ today: '2026-09-07', fromDate: '2026-09-07', toDate: '2026-09-13' });
  });
});
