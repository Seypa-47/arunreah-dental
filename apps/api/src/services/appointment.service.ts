import type { CreatePublicAppointmentInput } from '@arunreah/shared';
import { CLINIC_TIME_ZONE } from '../config/time';
import type { DatabaseClient } from '../db/client';
import { findBranchById } from '../repositories/branch.repository';
import { findDoctorById } from '../repositories/doctor.repository';
import {
  createAppointment,
  findAppointmentByIdempotencyKey,
} from '../repositories/appointment.repository';
import { findServiceById } from '../repositories/service.repository';
import { HttpError } from '../shared/http-error';
import { getClientIp } from './auth.service';
import {
  assertAppointmentRequestAllowed,
  recordAppointmentRequestAttempt,
} from './appointment-abuse.service';
import { notifyClinicOfAppointment } from './appointment-notification.service';
import { hashSessionToken } from './session.service';
import { verifyTurnstile } from './turnstile.service';
import type { Bindings } from '../types/env';

function clinicToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function assertPreferredDate(date: string) {
  if (date < clinicToday()) {
    throw new HttpError(
      400,
      'INVALID_APPOINTMENT_DATE',
      'Preferred appointment date cannot be in the past.',
    );
  }
}

function createReference() {
  const date = clinicToday().replaceAll('-', '');
  return `AR-${date}-${crypto.randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase()}`;
}

function acknowledgement(appointment: { reference: string; status: string }) {
  return { reference: appointment.reference, status: appointment.status };
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Error && /unique constraint|sqlite_constraint/i.test(error.message);
}

export async function createPublicAppointmentRequest(
  database: DatabaseClient,
  input: CreatePublicAppointmentInput,
  environment: 'development' | 'staging' | 'production',
  turnstileSecret: string | undefined,
  notificationEnvironment: Bindings,
  headers: Headers,
  rateLimitKey: string,
) {
  const idempotencyKey = await hashSessionToken(input.idempotencyKey);
  const existing = await findAppointmentByIdempotencyKey(database, idempotencyKey);
  if (existing) return { appointment: acknowledgement(existing), created: false };

  await assertAppointmentRequestAllowed(database, rateLimitKey);
  await verifyTurnstile(input.turnstileToken, turnstileSecret, getClientIp(headers), environment);
  assertPreferredDate(input.preferredDate);

  const [service, branch, doctor] = await Promise.all([
    findServiceById(database, input.serviceId),
    findBranchById(database, input.branchId),
    input.doctorId ? findDoctorById(database, input.doctorId) : undefined,
  ]);

  if (!service || service.status !== 'PUBLISHED') {
    throw new HttpError(404, 'SERVICE_NOT_AVAILABLE', 'The selected service is not available.');
  }
  if (!branch || branch.status !== 'PUBLISHED' || !branch.acceptsAppointments) {
    throw new HttpError(404, 'BRANCH_NOT_AVAILABLE', 'The selected branch is not available.');
  }
  if (input.doctorId && (!doctor || doctor.status !== 'PUBLISHED')) {
    throw new HttpError(404, 'DOCTOR_NOT_AVAILABLE', 'The selected doctor is not available.');
  }

  await recordAppointmentRequestAttempt(database, rateLimitKey);

  let appointment: Awaited<ReturnType<typeof createAppointment>> | undefined;
  for (let attempt = 0; attempt < 3 && !appointment; attempt += 1) {
    const now = new Date().toISOString();
    try {
      appointment = await createAppointment(database, {
        id: crypto.randomUUID(),
        reference: createReference(),
        idempotencyKey,
        status: 'PENDING',
        serviceId: service.id,
        doctorId: doctor?.id ?? null,
        branchId: branch.id,
        serviceNameSnapshot: service.nameEn,
        doctorNameSnapshot: doctor?.nameEn ?? null,
        branchNameSnapshot: branch.nameEn,
        patientName: input.patientName,
        patientPhone: input.phone,
        patientEmail: input.email,
        patientNote: input.notes ?? null,
        preferredDate: input.preferredDate,
        preferredTime: input.preferredTime,
        locale: 'en',
        statusUpdatedAt: null,
        statusUpdatedByAdminId: null,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      const duplicate = await findAppointmentByIdempotencyKey(database, idempotencyKey);
      if (duplicate) return { appointment: acknowledgement(duplicate), created: false };
      if (!isUniqueConstraintError(error) || attempt === 2) throw error;
    }
  }

  if (!appointment) throw new Error('Appointment request could not be created.');

  try {
    await notifyClinicOfAppointment(
      {
        reference: appointment.reference,
        patientName: appointment.patientName,
        phone: appointment.patientPhone,
        email: appointment.patientEmail ?? input.email,
        serviceName: appointment.serviceNameSnapshot,
        doctorName: appointment.doctorNameSnapshot,
        branchName: appointment.branchNameSnapshot,
        preferredDate: appointment.preferredDate,
        preferredTime: appointment.preferredTime,
        notes: appointment.patientNote,
        createdAt: appointment.createdAt,
      },
      notificationEnvironment,
    );
  } catch {
    console.error('Appointment notification failed', { reference: appointment.reference });
  }

  return { appointment: acknowledgement(appointment), created: true };
}
