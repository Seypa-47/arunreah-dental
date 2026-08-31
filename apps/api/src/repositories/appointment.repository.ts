import { and, asc, count, desc, eq, gte, like, lte, or } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { AdminAppointmentListQuery, AppointmentStatus } from '@arunreah/shared';
import {
  appointmentRequestRateLimits,
  appointments,
  branches,
  doctors,
  services,
} from '../db/schema';
import type { DatabaseClient } from '../db/client';

export async function findAppointmentByIdempotencyKey(
  database: DatabaseClient,
  idempotencyKey: string,
) {
  const [appointment] = await database
    .select()
    .from(appointments)
    .where(eq(appointments.idempotencyKey, idempotencyKey))
    .limit(1);
  return appointment;
}

export async function findAppointmentById(database: DatabaseClient, id: string) {
  const [appointment] = await database
    .select()
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1);
  return appointment;
}

export async function findAdminAppointmentDetailById(database: DatabaseClient, id: string) {
  const [row] = await database
    .select({
      appointment: appointments,
      service: {
        id: services.id,
        slug: services.slug,
        nameEn: services.nameEn,
        nameKm: services.nameKm,
        status: services.status,
      },
      doctor: {
        id: doctors.id,
        slug: doctors.slug,
        nameEn: doctors.nameEn,
        nameKm: doctors.nameKm,
        status: doctors.status,
      },
      branch: {
        id: branches.id,
        slug: branches.slug,
        nameEn: branches.nameEn,
        nameKm: branches.nameKm,
        status: branches.status,
      },
    })
    .from(appointments)
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
    .leftJoin(branches, eq(appointments.branchId, branches.id))
    .where(eq(appointments.id, id))
    .limit(1);
  return row;
}

export async function listAdminAppointments(
  database: DatabaseClient,
  query: AdminAppointmentListQuery,
) {
  const conditions: SQL<unknown>[] = [];
  if (query.status) conditions.push(eq(appointments.status, query.status));
  if (query.serviceId) conditions.push(eq(appointments.serviceId, query.serviceId));
  if (query.doctorId) conditions.push(eq(appointments.doctorId, query.doctorId));
  if (query.branchId) conditions.push(eq(appointments.branchId, query.branchId));
  if (query.fromDate) conditions.push(gte(appointments.preferredDate, query.fromDate));
  if (query.toDate) conditions.push(lte(appointments.preferredDate, query.toDate));
  if (query.search) {
    const search = `%${query.search}%`;
    conditions.push(
      or(
        like(appointments.reference, search),
        like(appointments.patientName, search),
        like(appointments.patientPhone, search),
        like(appointments.patientEmail, search),
      ) as SQL<unknown>,
    );
  }

  const where = and(...conditions);
  const sortableColumns = {
    createdAt: appointments.createdAt,
    preferredDate: appointments.preferredDate,
    updatedAt: appointments.updatedAt,
    status: appointments.status,
  } as const;
  const orderBy = query.order === 'asc' ? asc : desc;
  const fields = {
    id: appointments.id,
    reference: appointments.reference,
    patientName: appointments.patientName,
    patientPhone: appointments.patientPhone,
    patientEmail: appointments.patientEmail,
    serviceId: appointments.serviceId,
    serviceNameSnapshot: appointments.serviceNameSnapshot,
    doctorId: appointments.doctorId,
    doctorNameSnapshot: appointments.doctorNameSnapshot,
    branchId: appointments.branchId,
    branchNameSnapshot: appointments.branchNameSnapshot,
    preferredDate: appointments.preferredDate,
    preferredTime: appointments.preferredTime,
    status: appointments.status,
    createdAt: appointments.createdAt,
  };

  const [items, total] = await Promise.all([
    database
      .select(fields)
      .from(appointments)
      .where(where)
      .orderBy(orderBy(sortableColumns[query.sort]))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit),
    database.select({ value: count() }).from(appointments).where(where),
  ]);
  return { items, total: total[0]?.value ?? 0 };
}

export async function updateAppointmentStatus(
  database: DatabaseClient,
  id: string,
  status: AppointmentStatus,
  updatedByAdminId: string,
) {
  const now = new Date().toISOString();
  await database
    .update(appointments)
    .set({ status, statusUpdatedAt: now, statusUpdatedByAdminId: updatedByAdminId, updatedAt: now })
    .where(eq(appointments.id, id));
  return findAppointmentById(database, id);
}

export async function createAppointment(
  database: DatabaseClient,
  input: typeof appointments.$inferInsert,
) {
  await database.insert(appointments).values(input);
  const [appointment] = await database
    .select()
    .from(appointments)
    .where(eq(appointments.id, input.id))
    .limit(1);
  return appointment;
}

export async function getAppointmentRequestRateLimit(database: DatabaseClient, key: string) {
  const [record] = await database
    .select()
    .from(appointmentRequestRateLimits)
    .where(eq(appointmentRequestRateLimits.key, key))
    .limit(1);
  return record;
}

export async function saveAppointmentRequestRateLimit(
  database: DatabaseClient,
  input: { key: string; attempts: number; windowStartedAt: string },
) {
  const now = new Date().toISOString();
  const current = await getAppointmentRequestRateLimit(database, input.key);

  if (current) {
    await database
      .update(appointmentRequestRateLimits)
      .set({ ...input, updatedAt: now })
      .where(eq(appointmentRequestRateLimits.key, input.key));
    return;
  }

  await database.insert(appointmentRequestRateLimits).values({
    ...input,
    createdAt: now,
    updatedAt: now,
  });
}
