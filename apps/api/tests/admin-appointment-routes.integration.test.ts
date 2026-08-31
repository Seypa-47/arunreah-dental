import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedAdmin } from '../src/types/auth';
import type { Bindings } from '../src/types/env';

type AppointmentRecord = {
  id: string;
  reference: string;
  idempotencyKey: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  serviceId: string;
  doctorId: string | null;
  branchId: string;
  serviceNameSnapshot: string;
  doctorNameSnapshot: string | null;
  branchNameSnapshot: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null;
  patientNote: string | null;
  preferredDate: string;
  preferredTime: string;
  locale: 'en' | 'km';
  statusUpdatedAt: string | null;
  statusUpdatedByAdminId: string | null;
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
  appointments: [] as AppointmentRecord[],
  sessions: new Map<string, SessionRecord>(),
  currentRecordsAvailable: true,
}));

vi.mock('../src/db/client', () => ({ createDbClient: () => ({}) }));
vi.mock('../src/repositories/session.repository', () => ({
  findAuthenticatedSession: async (_database: unknown, tokenHash: string) =>
    state.sessions.get(tokenHash),
}));
vi.mock('../src/repositories/appointment.repository', () => ({
  findAppointmentByIdempotencyKey: async () => undefined,
  createAppointment: async () => undefined,
  getAppointmentRequestRateLimit: async () => undefined,
  saveAppointmentRequestRateLimit: async () => undefined,
  findAppointmentById: async (_database: unknown, id: string) =>
    state.appointments.find((appointment) => appointment.id === id),
  findAdminAppointmentDetailById: async (_database: unknown, id: string) => {
    const appointment = state.appointments.find((item) => item.id === id);
    if (!appointment) return undefined;
    const current = state.currentRecordsAvailable
      ? {
          id: appointment.serviceId,
          slug: 'dental-implants',
          nameEn: 'Current Dental Implants',
          nameKm: 'ការដាំធ្មេញបច្ចុប្បន្ន',
          status: 'ARCHIVED' as const,
        }
      : null;
    return {
      appointment,
      service: current,
      doctor: appointment.doctorId
        ? { ...current, id: appointment.doctorId, slug: 'dr-dara', nameEn: 'Current Dr. Dara' }
        : null,
      branch: current
        ? {
            ...current,
            id: appointment.branchId,
            slug: 'main-branch',
            nameEn: 'Current Main Branch',
          }
        : null,
    };
  },
  listAdminAppointments: async (
    _database: unknown,
    query: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      serviceId?: string;
      doctorId?: string;
      branchId?: string;
      fromDate?: string;
      toDate?: string;
      sort: 'createdAt' | 'preferredDate' | 'updatedAt' | 'status';
      order: 'asc' | 'desc';
    },
  ) => {
    let items = [...state.appointments];
    if (query.search) {
      const search = query.search.toLowerCase();
      items = items.filter((appointment) =>
        [
          appointment.reference,
          appointment.patientName,
          appointment.patientPhone,
          appointment.patientEmail,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(search),
      );
    }
    if (query.status) items = items.filter((appointment) => appointment.status === query.status);
    if (query.serviceId)
      items = items.filter((appointment) => appointment.serviceId === query.serviceId);
    if (query.doctorId)
      items = items.filter((appointment) => appointment.doctorId === query.doctorId);
    if (query.branchId)
      items = items.filter((appointment) => appointment.branchId === query.branchId);
    if (query.fromDate)
      items = items.filter((appointment) => appointment.preferredDate >= query.fromDate!);
    if (query.toDate)
      items = items.filter((appointment) => appointment.preferredDate <= query.toDate!);
    items.sort((left, right) => {
      const leftValue = left[query.sort];
      const rightValue = right[query.sort];
      const comparison = String(leftValue).localeCompare(String(rightValue));
      return query.order === 'desc' ? -comparison : comparison;
    });
    const total = items.length;
    return {
      items: items.slice((query.page - 1) * query.limit, query.page * query.limit),
      total,
    };
  },
  updateAppointmentStatus: async (
    _database: unknown,
    id: string,
    status: AppointmentRecord['status'],
    adminId: string,
  ) => {
    const appointment = state.appointments.find((item) => item.id === id);
    if (!appointment) return undefined;
    appointment.status = status;
    appointment.statusUpdatedAt = '2026-09-01T12:00:00.000Z';
    appointment.statusUpdatedByAdminId = adminId;
    appointment.updatedAt = '2026-09-01T12:00:00.000Z';
    return appointment;
  },
}));

const { app } = await import('../src/app');
const { hashSessionToken } = await import('../src/services/session.service');

const bindings = {
  APP_ENV: 'development',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
} satisfies Bindings;

function appointmentFixture(overrides: Partial<AppointmentRecord> = {}): AppointmentRecord {
  return {
    id: '550e8400-e29b-41d4-a716-446655440001',
    reference: 'AR-20260901-ABC123',
    idempotencyKey: 'idempotency-key',
    status: 'PENDING',
    serviceId: '550e8400-e29b-41d4-a716-446655440011',
    doctorId: '550e8400-e29b-41d4-a716-446655440012',
    branchId: '550e8400-e29b-41d4-a716-446655440013',
    serviceNameSnapshot: 'Dental Implants',
    doctorNameSnapshot: 'Dr. Dara',
    branchNameSnapshot: 'Main Branch',
    patientName: 'Sok Dara',
    patientPhone: '+855 12 345 678',
    patientEmail: 'sok@example.com',
    patientNote: 'Please call first.',
    preferredDate: '2026-09-15',
    preferredTime: '10:30',
    locale: 'en',
    statusUpdatedAt: null,
    statusUpdatedByAdminId: null,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    ...overrides,
  };
}

async function headersFor(role: AuthenticatedAdmin['role']) {
  const token = `appointments-${role}`;
  state.sessions.set(await hashSessionToken(token), {
    sessionId: `${role}-session-id`,
    adminId: `${role}-admin-id`,
    displayName: `${role} Admin`,
    email: `${role.toLowerCase()}@example.com`,
    role,
  });
  return { Cookie: `arunreah_admin_session=${token}` };
}

async function request(path: string, role?: AuthenticatedAdmin['role'], init?: RequestInit) {
  return app.request(
    `http://localhost${path}`,
    { ...init, headers: { ...(role ? await headersFor(role) : {}), ...(init?.headers ?? {}) } },
    bindings,
  );
}

beforeEach(() => {
  state.appointments = [];
  state.sessions.clear();
  state.currentRecordsAvailable = true;
});

describe('admin appointment inbox API', () => {
  it('enforces appointment-management permissions', async () => {
    state.appointments = [appointmentFixture()];

    expect((await request('/api/admin/appointments')).status).toBe(401);
    expect((await request('/api/admin/appointments', 'CMS_ADMIN')).status).toBe(403);
    expect((await request('/api/admin/appointments', 'RECEPTIONIST')).status).toBe(200);
    expect(
      (await request('/api/admin/appointments/550e8400-e29b-41d4-a716-446655440001', 'SUPER_ADMIN'))
        .status,
    ).toBe(200);
  });

  it('lists lightweight inbox rows with pagination, searching, filters, and safe sorting', async () => {
    state.appointments = [
      appointmentFixture(),
      appointmentFixture({
        id: '550e8400-e29b-41d4-a716-446655440002',
        reference: 'AR-20260902-DEF456',
        patientName: 'Chan Vanna',
        patientPhone: '098 701 302',
        patientEmail: 'chan@example.com',
        status: 'CONFIRMED',
        serviceId: '550e8400-e29b-41d4-a716-446655440021',
        doctorId: null,
        branchId: '550e8400-e29b-41d4-a716-446655440023',
        preferredDate: '2026-09-20',
        createdAt: '2026-09-02T10:00:00.000Z',
      }),
      appointmentFixture({
        id: '550e8400-e29b-41d4-a716-446655440003',
        reference: 'AR-20260830-GHI789',
        patientName: 'Sok Secondary',
        patientEmail: 'secondary@example.com',
        preferredDate: '2026-10-01',
        createdAt: '2026-08-30T10:00:00.000Z',
      }),
    ];

    const response = await request('/api/admin/appointments?page=1&limit=2', 'RECEPTIONIST');
    const body = await response.json<{
      data: { appointments: AppointmentRecord[]; meta: { total: number; totalPages: number } };
    }>();
    expect(response.status).toBe(200);
    expect(body.data.appointments.map((appointment) => appointment.reference)).toEqual([
      'AR-20260902-DEF456',
      'AR-20260901-ABC123',
    ]);
    expect(body.data.meta).toMatchObject({ total: 3, totalPages: 2 });
    expect(body.data.appointments[0]).not.toHaveProperty('patientNote');

    for (const search of ['Sok Dara', '098 701 302', 'chan@example.com', 'ABC123']) {
      const searched = await request(
        `/api/admin/appointments?search=${encodeURIComponent(search)}`,
        'RECEPTIONIST',
      );
      expect((await searched.json<{ data: { meta: { total: number } } }>()).data.meta.total).toBe(
        1,
      );
    }

    const filtered = await request(
      '/api/admin/appointments?status=PENDING&serviceId=550e8400-e29b-41d4-a716-446655440011&doctorId=550e8400-e29b-41d4-a716-446655440012&branchId=550e8400-e29b-41d4-a716-446655440013&fromDate=2026-09-01&toDate=2026-09-30&sort=preferredDate&order=asc',
      'SUPER_ADMIN',
    );
    expect((await filtered.json<{ data: { meta: { total: number } } }>()).data.meta.total).toBe(1);
  });

  it('rejects invalid inbox query parameters', async () => {
    for (const query of [
      'page=0',
      'limit=101',
      'sort=raw_sql',
      'fromDate=2026-10-01&toDate=2026-09-01',
    ]) {
      expect((await request(`/api/admin/appointments?${query}`, 'RECEPTIONIST')).status).toBe(400);
    }
  });

  it('returns authoritative snapshots in detail even without current CMS records', async () => {
    state.currentRecordsAvailable = false;
    state.appointments = [appointmentFixture({ doctorId: null, doctorNameSnapshot: null })];

    const response = await request(
      '/api/admin/appointments/550e8400-e29b-41d4-a716-446655440001',
      'RECEPTIONIST',
    );
    const body = await response.json<{ data: { appointment: Record<string, unknown> } }>();
    expect(response.status).toBe(200);
    expect(body.data.appointment).toMatchObject({
      reference: 'AR-20260901-ABC123',
      service: { nameSnapshot: 'Dental Implants', current: null },
      doctor: null,
      branch: { nameSnapshot: 'Main Branch', current: null },
    });
    expect(
      (await request('/api/admin/appointments/550e8400-e29b-41d4-a716-446655440099', 'SUPER_ADMIN'))
        .status,
    ).toBe(404);
  });

  it('applies the centralized status transitions safely and records the responsible admin', async () => {
    state.appointments = [appointmentFixture()];
    const id = '550e8400-e29b-41d4-a716-446655440001';

    const confirm = await request(`/api/admin/appointments/${id}/status`, 'RECEPTIONIST', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONFIRMED' }),
    });
    expect(confirm.status).toBe(200);
    expect(state.appointments[0]).toMatchObject({
      status: 'CONFIRMED',
      statusUpdatedByAdminId: 'RECEPTIONIST-admin-id',
      updatedAt: '2026-09-01T12:00:00.000Z',
    });

    const sameStatus = await request(`/api/admin/appointments/${id}/status`, 'RECEPTIONIST', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONFIRMED' }),
    });
    expect(sameStatus.status).toBe(200);

    expect(
      (
        await request(`/api/admin/appointments/${id}/status`, 'SUPER_ADMIN', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'COMPLETED' }),
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await request(`/api/admin/appointments/${id}/status`, 'SUPER_ADMIN', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'PENDING' }),
        })
      ).status,
    ).toBe(409);

    state.appointments = [appointmentFixture()];
    expect(
      (
        await request(`/api/admin/appointments/${id}/status`, 'RECEPTIONIST', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'CANCELLED' }),
        })
      ).status,
    ).toBe(200);

    state.appointments = [appointmentFixture({ status: 'CONFIRMED' })];
    expect(
      (
        await request(`/api/admin/appointments/${id}/status`, 'SUPER_ADMIN', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'CANCELLED' }),
        })
      ).status,
    ).toBe(200);

    state.appointments = [appointmentFixture({ status: 'CANCELLED' })];
    expect(
      (
        await request(`/api/admin/appointments/${id}/status`, 'SUPER_ADMIN', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'CONFIRMED' }),
        })
      ).status,
    ).toBe(409);
    expect(
      (
        await request(`/api/admin/appointments/${id}/status`, 'SUPER_ADMIN', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'UNKNOWN' }),
        })
      ).status,
    ).toBe(400);
  });
});
