import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Bindings } from '../src/types/env';

type AppointmentRecord = {
  id: string;
  reference: string;
  idempotencyKey: string;
  status: 'PENDING';
  serviceId: string;
  doctorId: string | null;
  branchId: string;
  serviceNameSnapshot: string;
  doctorNameSnapshot: string | null;
  branchNameSnapshot: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientNote: string | null;
  preferredDate: string;
  preferredTime: string;
  locale: 'en' | 'km';
  statusUpdatedAt: string | null;
  statusUpdatedByAdminId: string | null;
  createdAt: string;
  updatedAt: string;
};

const ids = {
  service: '550e8400-e29b-41d4-a716-446655440001',
  doctor: '550e8400-e29b-41d4-a716-446655440002',
  branch: '550e8400-e29b-41d4-a716-446655440003',
};

const state = vi.hoisted(() => ({
  services: new Map<string, { id: string; status: 'DRAFT' | 'PUBLISHED'; nameEn: string }>(),
  doctors: new Map<string, { id: string; status: 'DRAFT' | 'PUBLISHED'; nameEn: string }>(),
  branches: new Map<
    string,
    { id: string; status: 'DRAFT' | 'PUBLISHED'; acceptsAppointments: boolean; nameEn: string }
  >(),
  appointments: [] as AppointmentRecord[],
  rateLimits: new Map<string, { attempts: number; windowStartedAt: string }>(),
  notificationReferences: [] as string[],
  notificationFails: false,
  createFails: false,
}));

vi.mock('../src/db/client', () => ({ createDbClient: () => ({}) }));
vi.mock('../src/repositories/service.repository', () => ({
  findServiceById: async (_database: unknown, id: string) => state.services.get(id),
}));
vi.mock('../src/repositories/doctor.repository', () => ({
  findDoctorById: async (_database: unknown, id: string) => state.doctors.get(id),
}));
vi.mock('../src/repositories/branch.repository', () => ({
  findBranchById: async (_database: unknown, id: string) => state.branches.get(id),
}));
vi.mock('../src/repositories/appointment.repository', () => ({
  findAppointmentByIdempotencyKey: async (_database: unknown, key: string) =>
    state.appointments.find((appointment) => appointment.idempotencyKey === key),
  createAppointment: async (_database: unknown, input: AppointmentRecord) => {
    if (state.createFails) throw new Error('D1 insert failed');
    state.appointments.push(input);
    return input;
  },
  getAppointmentRequestRateLimit: async (_database: unknown, key: string) =>
    state.rateLimits.get(key),
  saveAppointmentRequestRateLimit: async (
    _database: unknown,
    input: { key: string; attempts: number; windowStartedAt: string },
  ) => {
    state.rateLimits.set(input.key, input);
  },
}));
vi.mock('../src/services/appointment-notification.service', () => ({
  notifyClinicOfAppointment: async ({ reference }: { reference: string }) => {
    state.notificationReferences.push(reference);
    if (state.notificationFails) throw new Error('Notification provider failed');
  },
}));

const { app } = await import('../src/app');
const { createAppointmentRequestRateLimitKey } =
  await import('../src/services/appointment-abuse.service');
const bindings = {
  APP_ENV: 'development',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  MEDIA_PUBLIC_BASE_URL: '',
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
} satisfies Bindings;

function payload(overrides: Record<string, unknown> = {}) {
  return {
    patientName: 'Sok Dara',
    phone: '+855 12 345 678',
    email: 'patient@example.com',
    serviceId: ids.service,
    doctorId: ids.doctor,
    branchId: ids.branch,
    preferredDate: '2099-01-01',
    preferredTime: '10:30',
    notes: 'Please call before the appointment.',
    idempotencyKey: '550e8400-e29b-41d4-a716-446655440010',
    ...overrides,
  };
}

async function submit(overrides: Record<string, unknown> = {}) {
  return app.request(
    'http://localhost/api/public/appointments',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload(overrides)),
    },
    bindings,
  );
}

beforeEach(() => {
  state.services.clear();
  state.doctors.clear();
  state.branches.clear();
  state.appointments = [];
  state.rateLimits.clear();
  state.notificationReferences = [];
  state.notificationFails = false;
  state.createFails = false;
  state.services.set(ids.service, {
    id: ids.service,
    status: 'PUBLISHED',
    nameEn: 'Dental Implants',
  });
  state.doctors.set(ids.doctor, { id: ids.doctor, status: 'PUBLISHED', nameEn: 'Dr. Dara' });
  state.branches.set(ids.branch, {
    id: ids.branch,
    status: 'PUBLISHED',
    acceptsAppointments: true,
    nameEn: 'Main Branch',
  });
});

describe('public appointment request API', () => {
  it('creates a PENDING request with immutable CMS snapshots and a patient-safe reference', async () => {
    const response = await submit();
    const body = await response.json<{ data: { reference: string; status: string } }>();

    expect(response.status).toBe(201);
    expect(body.data).toEqual({
      reference: expect.stringMatching(/^AR-\d{8}-[A-F0-9]{6}$/),
      status: 'PENDING',
    });
    expect(state.appointments).toHaveLength(1);
    expect(state.appointments[0]).toMatchObject({
      status: 'PENDING',
      serviceNameSnapshot: 'Dental Implants',
      doctorNameSnapshot: 'Dr. Dara',
      branchNameSnapshot: 'Main Branch',
      patientPhone: '+855 12 345 678',
    });
    expect(state.notificationReferences).toEqual([body.data.reference]);
  });

  it('accepts No Preference when doctorId is omitted or null', async () => {
    const omitted = await submit({
      doctorId: undefined,
      idempotencyKey: '550e8400-e29b-41d4-a716-446655440011',
    });
    const nullDoctor = await submit({
      doctorId: null,
      idempotencyKey: '550e8400-e29b-41d4-a716-446655440012',
    });

    expect(omitted.status).toBe(201);
    expect(nullDoctor.status).toBe(201);
    expect(state.appointments.map((appointment) => appointment.doctorId)).toEqual([null, null]);
    expect(state.appointments.map((appointment) => appointment.doctorNameSnapshot)).toEqual([
      null,
      null,
    ]);
  });

  it('enforces public request validation and bookable CMS entities', async () => {
    expect((await submit({ patientName: '' })).status).toBe(400);
    expect((await submit({ email: 'not-an-email' })).status).toBe(400);
    expect((await submit({ phone: '123' })).status).toBe(400);
    expect((await submit({ preferredDate: '2000-01-01' })).status).toBe(400);
    expect((await submit({ preferredDate: '2099-02-31' })).status).toBe(400);
    expect((await submit({ preferredTime: '29:95' })).status).toBe(400);
    expect((await submit({ notes: 'x'.repeat(2_001) })).status).toBe(400);
    expect((await submit({ serviceId: '550e8400-e29b-41d4-a716-446655440099' })).status).toBe(404);
    state.services.set(ids.service, { id: ids.service, status: 'DRAFT', nameEn: 'Draft' });
    expect((await submit()).status).toBe(404);
    state.services.set(ids.service, {
      id: ids.service,
      status: 'PUBLISHED',
      nameEn: 'Dental Implants',
    });
    state.doctors.set(ids.doctor, { id: ids.doctor, status: 'DRAFT', nameEn: 'Draft Doctor' });
    expect((await submit()).status).toBe(404);
    state.doctors.set(ids.doctor, { id: ids.doctor, status: 'PUBLISHED', nameEn: 'Dr. Dara' });
    state.branches.set(ids.branch, {
      id: ids.branch,
      status: 'PUBLISHED',
      acceptsAppointments: false,
      nameEn: 'Main Branch',
    });
    expect((await submit()).status).toBe(404);
  });

  it('is idempotent and generates distinct references for distinct requests', async () => {
    const first = await submit();
    const retry = await submit();
    const second = await submit({ idempotencyKey: '550e8400-e29b-41d4-a716-446655440013' });
    const firstBody = await first.json<{ data: { reference: string } }>();
    const retryBody = await retry.json<{ data: { reference: string } }>();
    const secondBody = await second.json<{ data: { reference: string } }>();

    expect(first.status).toBe(201);
    expect(retry.status).toBe(200);
    expect(state.appointments).toHaveLength(2);
    expect(retryBody.data.reference).toBe(firstBody.data.reference);
    expect(secondBody.data.reference).not.toBe(firstBody.data.reference);
  });

  it('applies the request rate limit and never rolls back a persisted request when notification fails', async () => {
    const rateLimitKey = await createAppointmentRequestRateLimitKey(new Headers());
    state.rateLimits.set(rateLimitKey, { attempts: 10, windowStartedAt: new Date().toISOString() });
    expect((await submit()).status).toBe(429);

    state.rateLimits.clear();
    state.notificationFails = true;
    const response = await submit();
    expect(response.status).toBe(201);
    expect(state.appointments).toHaveLength(1);
    expect(state.appointments[0]?.status).toBe('PENDING');
  });

  it('does not notify the clinic or return success when persistence fails', async () => {
    state.createFails = true;
    const response = await submit();
    expect(response.status).toBe(500);
    expect(state.appointments).toHaveLength(0);
    expect(state.notificationReferences).toEqual([]);
  });
});
