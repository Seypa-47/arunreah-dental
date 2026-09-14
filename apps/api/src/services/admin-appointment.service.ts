import type {
  AdminAppointmentListQuery,
  AppointmentStatus,
  UpdateAppointmentStatusInput,
} from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import * as repository from '../repositories/appointment.repository';
import { HttpError } from '../shared/http-error';

const allowedTransitions: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

function toInboxItem(
  appointment: Awaited<ReturnType<typeof repository.listAdminAppointments>>['items'][number],
) {
  return {
    id: appointment.id,
    reference: appointment.reference,
    patient: {
      name: appointment.patientName,
      phone: appointment.patientPhone,
      email: appointment.patientEmail,
    },
    service: { id: appointment.serviceId, nameSnapshot: appointment.serviceNameSnapshot },
    doctor: appointment.doctorId
      ? { id: appointment.doctorId, nameSnapshot: appointment.doctorNameSnapshot }
      : null,
    branch: { id: appointment.branchId, nameSnapshot: appointment.branchNameSnapshot },
    preferredDate: appointment.preferredDate,
    preferredTime: appointment.preferredTime,
    status: appointment.status,
    createdAt: appointment.createdAt,
  };
}

function currentRecord(
  record: {
    id: string | null;
    slug: string | null;
    nameEn: string | null;
    nameKm: string | null;
    status: string | null;
  } | null,
) {
  if (!record || !record.id || !record.slug || !record.nameEn || !record.nameKm || !record.status)
    return null;
  return {
    id: record.id,
    slug: record.slug,
    nameEn: record.nameEn,
    nameKm: record.nameKm,
    status: record.status,
  };
}

export async function getAdminAppointmentList(
  database: DatabaseClient,
  query: AdminAppointmentListQuery,
) {
  const result = await repository.listAdminAppointments(database, query);
  return {
    appointments: result.items.map(toInboxItem),
    meta: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / query.limit),
    },
  };
}

export async function getAdminAppointmentDetail(database: DatabaseClient, id: string) {
  const row = await repository.findAdminAppointmentDetailById(database, id);
  if (!row) throw new HttpError(404, 'NOT_FOUND', 'Appointment not found.');

  const appointment = row.appointment;
  return {
    id: appointment.id,
    reference: appointment.reference,
    patient: {
      name: appointment.patientName,
      phone: appointment.patientPhone,
      email: appointment.patientEmail,
    },
    service: {
      id: appointment.serviceId,
      nameSnapshot: appointment.serviceNameSnapshot,
      current: currentRecord(row.service),
    },
    doctor: appointment.doctorId
      ? {
          id: appointment.doctorId,
          nameSnapshot: appointment.doctorNameSnapshot,
          current: currentRecord(row.doctor),
        }
      : null,
    branch: {
      id: appointment.branchId,
      nameSnapshot: appointment.branchNameSnapshot,
      current: currentRecord(row.branch),
    },
    preferredDate: appointment.preferredDate,
    preferredTime: appointment.preferredTime,
    notes: appointment.patientNote,
    status: appointment.status,
    statusUpdatedAt: appointment.statusUpdatedAt,
    statusUpdatedByAdminId: appointment.statusUpdatedByAdminId,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  };
}

export async function changeAppointmentStatus(
  database: DatabaseClient,
  id: string,
  input: UpdateAppointmentStatusInput,
  adminId: string,
) {
  const current = await repository.findAppointmentById(database, id);
  if (!current) throw new HttpError(404, 'NOT_FOUND', 'Appointment not found.');
  if (current.status === input.status) return current;
  if (!allowedTransitions[current.status].includes(input.status)) {
    throw new HttpError(
      409,
      'CONFLICT',
      `Appointment status cannot transition from ${current.status} to ${input.status}.`,
    );
  }

  const updated = await repository.updateAppointmentStatus(
    database,
    id,
    current.status,
    input.status,
    adminId,
  );
  if (!updated) {
    throw new HttpError(
      409,
      'CONFLICT',
      'Appointment status was changed by another staff member. Reload and try again.',
    );
  }
  return updated;
}
