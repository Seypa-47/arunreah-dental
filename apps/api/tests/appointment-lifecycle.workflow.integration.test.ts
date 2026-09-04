import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedAdmin } from '../src/types/auth';
import type { Bindings } from '../src/types/env';

type ContentRecord = {
  id: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  nameEn: string;
  nameKm: string;
  acceptsAppointments?: boolean;
};

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

const ids = {
  service: '550e8400-e29b-41d4-a716-446655440101',
  doctor: '550e8400-e29b-41d4-a716-446655440102',
  branch: '550e8400-e29b-41d4-a716-446655440103',
};

const state = vi.hoisted(() => ({
  services: [] as ContentRecord[],
  doctors: [] as ContentRecord[],
  branches: [] as ContentRecord[],
  appointments: [] as AppointmentRecord[],
  sessions: new Map<string, SessionRecord>(),
  rateLimits: new Map<string, { attempts: number; windowStartedAt: string }>(),
  notificationReferences: [] as string[],
}));

vi.mock('../src/db/client', () => ({ createDbClient: () => ({}) }));

vi.mock('../src/repositories/session.repository', () => ({
  findAuthenticatedSession: async (_database: unknown, tokenHash: string) =>
    state.sessions.get(tokenHash),
}));

vi.mock('../src/repositories/service.repository', () => ({
  findServiceById: async (_database: unknown, id: string) =>
    state.services.find((service) => service.id === id),
  findServiceBySlug: async (_database: unknown, slug: string) =>
    state.services.find((service) => service.slug === slug),
  updateService: async (_database: unknown, id: string, input: Record<string, unknown>) => {
    const service = state.services.find((item) => item.id === id);
    if (!service) return undefined;
    if (typeof input.nameEn === 'string') service.nameEn = input.nameEn;
    if (typeof input.nameKm === 'string') service.nameKm = input.nameKm;
    if (typeof input.status === 'string') service.status = input.status as ContentRecord['status'];
    return service;
  },
  countAppointmentsForService: async (_database: unknown, id: string) =>
    state.appointments.filter((appointment) => appointment.serviceId === id).length,
  deleteService: async (_database: unknown, id: string) => {
    state.services = state.services.filter((service) => service.id !== id);
  },
  servicesExist: async (_database: unknown, serviceIds: string[]) =>
    state.services.filter((service) => serviceIds.includes(service.id)),
  getBenefits: async () => [],
  getRelated: async () => [],
}));

vi.mock('../src/repositories/doctor.repository', () => ({
  findDoctorById: async (_database: unknown, id: string) =>
    state.doctors.find((doctor) => doctor.id === id),
  findDoctorBySlug: async (_database: unknown, slug: string) =>
    state.doctors.find((doctor) => doctor.slug === slug),
  updateDoctor: async (_database: unknown, id: string, input: Record<string, unknown>) => {
    const doctor = state.doctors.find((item) => item.id === id);
    if (!doctor) return undefined;
    if (typeof input.nameEn === 'string') doctor.nameEn = input.nameEn;
    if (typeof input.nameKm === 'string') doctor.nameKm = input.nameKm;
    if (typeof input.status === 'string') doctor.status = input.status as ContentRecord['status'];
    return doctor;
  },
  countAppointmentsForDoctor: async (_database: unknown, id: string) =>
    state.appointments.filter((appointment) => appointment.doctorId === id).length,
  deleteDoctor: async (_database: unknown, id: string) => {
    state.doctors = state.doctors.filter((doctor) => doctor.id !== id);
  },
  doctorsExist: async (_database: unknown, doctorIds: string[]) =>
    state.doctors.filter((doctor) => doctorIds.includes(doctor.id)),
  getExpertise: async () => [],
  getEducation: async () => [],
  getRelatedDoctors: async () => [],
}));

vi.mock('../src/repositories/branch.repository', () => ({
  findBranchById: async (_database: unknown, id: string) =>
    state.branches.find((branch) => branch.id === id),
  findBranchBySlug: async (_database: unknown, slug: string) =>
    state.branches.find((branch) => branch.slug === slug),
  updateBranch: async (_database: unknown, id: string, input: Record<string, unknown>) => {
    const branch = state.branches.find((item) => item.id === id);
    if (!branch) return undefined;
    if (typeof input.nameEn === 'string') branch.nameEn = input.nameEn;
    if (typeof input.nameKm === 'string') branch.nameKm = input.nameKm;
    if (typeof input.status === 'string') branch.status = input.status as ContentRecord['status'];
    if (typeof input.acceptsAppointments === 'boolean') {
      branch.acceptsAppointments = input.acceptsAppointments;
    }
    return branch;
  },
  countAppointmentsForBranch: async (_database: unknown, id: string) =>
    state.appointments.filter((appointment) => appointment.branchId === id).length,
  deleteBranch: async (_database: unknown, id: string) => {
    state.branches = state.branches.filter((branch) => branch.id !== id);
  },
}));

vi.mock('../src/repositories/appointment.repository', () => ({
  findAppointmentByIdempotencyKey: async (_database: unknown, key: string) =>
    state.appointments.find((appointment) => appointment.idempotencyKey === key),
  createAppointment: async (_database: unknown, appointment: AppointmentRecord) => {
    state.appointments.push(appointment);
    return appointment;
  },
  getAppointmentRequestRateLimit: async (_database: unknown, key: string) =>
    state.rateLimits.get(key),
  saveAppointmentRequestRateLimit: async (
    _database: unknown,
    input: { key: string; attempts: number; windowStartedAt: string },
  ) => {
    state.rateLimits.set(input.key, input);
  },
  findAppointmentById: async (_database: unknown, id: string) =>
    state.appointments.find((appointment) => appointment.id === id),
  findAdminAppointmentDetailById: async (_database: unknown, id: string) => {
    const appointment = state.appointments.find((item) => item.id === id);
    if (!appointment) return undefined;
    return {
      appointment,
      service: state.services.find((service) => service.id === appointment.serviceId) ?? null,
      doctor: appointment.doctorId
        ? (state.doctors.find((doctor) => doctor.id === appointment.doctorId) ?? null)
        : null,
      branch: state.branches.find((branch) => branch.id === appointment.branchId) ?? null,
    };
  },
  listAdminAppointments: async () => ({
    items: [...state.appointments].sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt),
    ),
    total: state.appointments.length,
  }),
  updateAppointmentStatus: async (
    _database: unknown,
    id: string,
    expectedStatus: AppointmentRecord['status'],
    status: AppointmentRecord['status'],
    adminId: string,
  ) => {
    const appointment = state.appointments.find(
      (item) => item.id === id && item.status === expectedStatus,
    );
    if (!appointment) return undefined;
    appointment.status = status;
    appointment.statusUpdatedAt = '2026-09-02T12:00:00.000Z';
    appointment.statusUpdatedByAdminId = adminId;
    appointment.updatedAt = '2026-09-02T12:00:00.000Z';
    return appointment;
  },
}));

vi.mock('../src/repositories/dashboard.repository', () => ({
  getAppointmentDashboardSummary: async () => ({
    pending: state.appointments.filter((appointment) => appointment.status === 'PENDING').length,
    confirmedToday: state.appointments.filter((appointment) => appointment.status === 'CONFIRMED')
      .length,
    confirmedThisWeek: state.appointments.filter(
      (appointment) => appointment.status === 'CONFIRMED',
    ).length,
  }),
  getRecentDashboardAppointments: async () =>
    [...state.appointments]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 5)
      .map(
        ({
          id,
          reference,
          patientName,
          serviceNameSnapshot,
          preferredDate,
          preferredTime,
          status,
          createdAt,
        }) => ({
          id,
          reference,
          patientName,
          serviceNameSnapshot,
          preferredDate,
          preferredTime,
          status,
          createdAt,
        }),
      ),
  getContentDashboardSummary: async () => ({
    services: { total: state.services.length, published: 1, draft: 0, archived: 0 },
    doctors: { total: state.doctors.length, published: 1, draft: 0, archived: 0 },
    showcases: { total: 0, published: 0, draft: 0, archived: 0 },
    branches: { total: state.branches.length, published: 1, draft: 0, archived: 0 },
  }),
}));

vi.mock('../src/services/appointment-notification.service', () => ({
  notifyClinicOfAppointment: async ({ reference }: { reference: string }) => {
    state.notificationReferences.push(reference);
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

async function headersFor(role: AuthenticatedAdmin['role']) {
  const token = `workflow-${role}`;
  state.sessions.set(await hashSessionToken(token), {
    sessionId: `${role}-session`,
    adminId: `${role}-admin`,
    displayName: `${role} Admin`,
    email: `${role.toLowerCase()}@example.com`,
    role,
  });
  return { Cookie: `arunreah_admin_session=${token}` };
}

async function request(path: string, init?: RequestInit) {
  return app.request(`http://localhost${path}`, init, bindings);
}

beforeEach(() => {
  state.services = [
    {
      id: ids.service,
      slug: 'dental-implants',
      status: 'PUBLISHED',
      nameEn: 'Dental Implants',
      nameKm: 'ដាំធ្មេញ',
    },
  ];
  state.doctors = [
    {
      id: ids.doctor,
      slug: 'dr-dara',
      status: 'PUBLISHED',
      nameEn: 'Dr. Dara',
      nameKm: 'វេជ្ជបណ្ឌិត ដារ៉ា',
    },
  ];
  state.branches = [
    {
      id: ids.branch,
      slug: 'main-branch',
      status: 'PUBLISHED',
      nameEn: 'Main Branch',
      nameKm: 'សាខាចម្បង',
      acceptsAppointments: true,
    },
  ];
  state.appointments = [];
  state.sessions.clear();
  state.rateLimits.clear();
  state.notificationReferences = [];
});

describe('appointment lifecycle workflow', () => {
  it('preserves snapshots across CMS edits, exposes the request to reception, advances statuses, and updates the role-aware dashboard', async () => {
    const submission = await request('/api/public/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: 'Sok Dara',
        phone: '+855 12 345 678',
        email: 'sok@example.com',
        serviceId: ids.service,
        doctorId: ids.doctor,
        branchId: ids.branch,
        preferredDate: '2099-01-01',
        preferredTime: '10:30',
        notes: 'Please call first.',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440199',
      }),
    });
    const submitted = await submission.json<{ data: { reference: string; status: string } }>();

    expect(submission.status).toBe(201);
    expect(submitted.data).toMatchObject({
      reference: expect.stringMatching(/^AR-/),
      status: 'PENDING',
    });
    expect(state.notificationReferences).toEqual([submitted.data.reference]);
    expect(state.appointments).toHaveLength(1);

    const cmsHeaders = await headersFor('CMS_ADMIN');
    for (const [path, body] of [
      [`/api/admin/services/${ids.service}`, { nameEn: 'Implant Dentistry', status: 'ARCHIVED' }],
      [`/api/admin/doctors/${ids.doctor}`, { nameEn: 'Dr. Dara Updated', status: 'ARCHIVED' }],
      [
        `/api/admin/branches/${ids.branch}`,
        { nameEn: 'Main Branch Updated', status: 'ARCHIVED', acceptsAppointments: false },
      ],
    ] as const) {
      expect(
        (
          await request(path, {
            method: 'PATCH',
            headers: { ...cmsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        ).status,
      ).toBe(200);
    }

    const receptionistHeaders = await headersFor('RECEPTIONIST');
    const inbox = await request('/api/admin/appointments', { headers: receptionistHeaders });
    expect(inbox.status).toBe(200);
    await expect(inbox.json()).resolves.toMatchObject({
      success: true,
      data: { appointments: [{ reference: submitted.data.reference, status: 'PENDING' }] },
    });

    const appointmentId = state.appointments[0]!.id;
    const detail = await request(`/api/admin/appointments/${appointmentId}`, {
      headers: receptionistHeaders,
    });
    expect(detail.status).toBe(200);
    await expect(detail.json()).resolves.toMatchObject({
      data: {
        appointment: {
          service: { nameSnapshot: 'Dental Implants' },
          doctor: { nameSnapshot: 'Dr. Dara' },
          branch: { nameSnapshot: 'Main Branch' },
        },
      },
    });

    const beforeConfirmation = await request('/api/admin/dashboard', {
      headers: receptionistHeaders,
    });
    await expect(beforeConfirmation.json()).resolves.toMatchObject({
      data: {
        role: 'RECEPTIONIST',
        appointments: { pending: 1 },
        recentAppointments: [{ reference: submitted.data.reference }],
      },
    });

    for (const status of ['CONFIRMED', 'COMPLETED'] as const) {
      const response = await request(`/api/admin/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { ...receptionistHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      expect(response.status).toBe(200);
    }
    expect(state.appointments[0]).toMatchObject({
      status: 'COMPLETED',
      statusUpdatedByAdminId: 'RECEPTIONIST-admin',
    });

    const afterCompletion = await request('/api/admin/dashboard', { headers: receptionistHeaders });
    await expect(afterCompletion.json()).resolves.toMatchObject({
      data: { appointments: { pending: 0 } },
    });

    const cmsDashboard = await request('/api/admin/dashboard', { headers: cmsHeaders });
    const cmsBody = await cmsDashboard.json<{ data: Record<string, unknown> }>();
    expect(cmsBody.data).toHaveProperty('content');
    expect(cmsBody.data).not.toHaveProperty('appointments');
    expect(JSON.stringify(cmsBody.data)).not.toContain('Sok Dara');

    for (const path of [
      `/api/admin/services/${ids.service}`,
      `/api/admin/doctors/${ids.doctor}`,
      `/api/admin/branches/${ids.branch}`,
    ]) {
      const response = await request(path, { method: 'DELETE', headers: cmsHeaders });
      expect(response.status).toBe(409);
      await expect(response.json()).resolves.toMatchObject({
        success: false,
        error: { code: 'CONFLICT' },
      });
    }
  });

  it('accepts No Preference without a doctor and keeps the doctor snapshot absent', async () => {
    const response = await request('/api/public/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: 'Chan Vanna',
        phone: '098 701 302',
        email: 'chan@example.com',
        serviceId: ids.service,
        branchId: ids.branch,
        preferredDate: '2099-01-02',
        preferredTime: '11:00',
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440200',
      }),
    });

    expect(response.status).toBe(201);
    expect(state.appointments[0]).toMatchObject({
      doctorId: null,
      doctorNameSnapshot: null,
      status: 'PENDING',
    });
  });
});
