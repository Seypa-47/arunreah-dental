import {
  getBranchScheduleForDate,
  isClinicalTeamCategory,
  parseBranchScheduleRows,
  type CreatePublicAppointmentInput,
} from '@arunreah/shared';
import { CLINIC_TIME_ZONE } from '../config/time';
import type { DatabaseClient } from '../db/client';
import { findBranchById } from '../repositories/branch.repository';
import { findDoctorById, getDoctorBranchIds } from '../repositories/doctor.repository';
import {
  createAppointment,
  findAppointmentByIdempotencyKey,
} from '../repositories/appointment.repository';
import { findServiceById } from '../repositories/service.repository';
import { HttpError } from '../shared/http-error';
import { getClientIp } from './auth.service';
import { consumeAppointmentRequestAttempt } from './appointment-abuse.service';
import { notifyClinicOfAppointment } from './appointment-notification.service';
import { hashSessionToken } from './session.service';
import { verifyTurnstile } from './turnstile.service';
import type { Bindings } from '../types/env';

function clinicDateAndTime(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return {
    date: `${value('year')}-${value('month')}-${value('day')}`,
    time: `${value('hour')}:${value('minute')}`,
  };
}

function clinicToday() {
  return clinicDateAndTime().date;
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

function assertAppointmentTime(
  branch: Awaited<ReturnType<typeof findBranchById>>,
  date: string,
  time: string,
) {
  if (!branch) return;
  const now = clinicDateAndTime();
  if (date === now.date && time <= now.time) {
    throw new HttpError(
      400,
      'INVALID_APPOINTMENT_DATE',
      'Preferred appointment time must be in the future.',
    );
  }
  let rows;
  try {
    rows = parseBranchScheduleRows({
      openingDays: branch.openingDaysEn,
      openingDaysKm: branch.openingDaysKm,
      openingTime: branch.openingTime,
      closingTime: branch.closingTime,
    });
  } catch {
    throw new HttpError(
      409,
      'INVALID_APPOINTMENT_DATE',
      'This branch has an invalid appointment schedule.',
    );
  }
  const schedule =
    rows.length === 0
      ? { openTime: '08:00', closeTime: '18:00' }
      : getBranchScheduleForDate(
          {
            openingDays: branch.openingDaysEn,
            openingDaysKm: branch.openingDaysKm,
            openingTime: branch.openingTime,
            closingTime: branch.closingTime,
          },
          date,
        );
  if (!schedule) {
    throw new HttpError(
      400,
      'INVALID_APPOINTMENT_DATE',
      'The selected branch is closed on this date.',
    );
  }
  if (time < schedule.openTime || time > schedule.closeTime) {
    throw new HttpError(
      400,
      'INVALID_APPOINTMENT_DATE',
      'Preferred appointment time is outside branch operating hours.',
    );
  }
}

async function createRequestFingerprint(input: CreatePublicAppointmentInput) {
  const normalized = JSON.stringify({
    patientName: input.patientName,
    phone: input.phone,
    email: input.email.toLowerCase(),
    serviceId: input.serviceId ?? null,
    doctorId: input.doctorId ?? null,
    branchId: input.branchId,
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    notes: input.notes ?? null,
    locale: input.locale,
  });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
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

const UNSPECIFIED_SERVICE_SNAPSHOT = 'Not sure / No preference';

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
  const requestFingerprint = await createRequestFingerprint(input);
  const existing = await findAppointmentByIdempotencyKey(database, idempotencyKey);
  if (existing) {
    if (existing.requestFingerprint && existing.requestFingerprint !== requestFingerprint) {
      throw new HttpError(
        409,
        'CONFLICT',
        'This idempotency key was already used for different appointment data.',
      );
    }
    return { appointment: acknowledgement(existing), created: false };
  }

  // Failed Turnstile and invalid selections count too, before remote verification.
  await consumeAppointmentRequestAttempt(database, rateLimitKey);
  await verifyTurnstile(input.turnstileToken, turnstileSecret, getClientIp(headers), environment);
  assertPreferredDate(input.preferredDate);

  const [service, branch, doctor] = await Promise.all([
    input.serviceId ? findServiceById(database, input.serviceId) : undefined,
    findBranchById(database, input.branchId),
    input.doctorId ? findDoctorById(database, input.doctorId) : undefined,
  ]);

  if (input.serviceId && (!service || service.status !== 'PUBLISHED')) {
    throw new HttpError(404, 'SERVICE_NOT_AVAILABLE', 'The selected service is not available.');
  }
  if (!branch || branch.status !== 'PUBLISHED' || !branch.acceptsAppointments) {
    throw new HttpError(404, 'BRANCH_NOT_AVAILABLE', 'The selected branch is not available.');
  }
  if (
    input.doctorId &&
    (!doctor ||
      doctor.status !== 'PUBLISHED' ||
      !doctor.bookable ||
      !isClinicalTeamCategory(doctor.category))
  ) {
    throw new HttpError(404, 'DOCTOR_NOT_AVAILABLE', 'The selected doctor is not available.');
  }
  if (doctor) {
    const assignedBranchIds = await getDoctorBranchIds(database, doctor.id);
    if (assignedBranchIds.length > 0 && !assignedBranchIds.includes(branch.id)) {
      throw new HttpError(
        400,
        'DOCTOR_NOT_AVAILABLE',
        'The selected doctor is not available at this branch.',
      );
    }
  }
  assertAppointmentTime(branch, input.preferredDate, input.preferredTime);

  const localizedName = (english: string, khmer: string | null | undefined) =>
    input.locale === 'km' ? khmer?.trim() || english : english;

  let appointment: Awaited<ReturnType<typeof createAppointment>> | undefined;
  for (let attempt = 0; attempt < 3 && !appointment; attempt += 1) {
    const now = new Date().toISOString();
    try {
      appointment = await createAppointment(database, {
        id: crypto.randomUUID(),
        reference: createReference(),
        idempotencyKey,
        requestFingerprint,
        status: 'PENDING',
        serviceId: service?.id ?? null,
        doctorId: doctor?.id ?? null,
        branchId: branch.id,
        serviceNameSnapshot: service
          ? localizedName(service.nameEn, service.nameKm)
          : UNSPECIFIED_SERVICE_SNAPSHOT,
        doctorNameSnapshot: doctor ? localizedName(doctor.nameEn, doctor.nameKm) : null,
        branchNameSnapshot: localizedName(branch.nameEn, branch.nameKm),
        patientName: input.patientName,
        patientPhone: input.phone,
        patientEmail: input.email,
        patientNote: input.notes ?? null,
        preferredDate: input.preferredDate,
        preferredTime: input.preferredTime,
        locale: input.locale,
        statusUpdatedAt: null,
        statusUpdatedByAdminId: null,
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      const duplicate = await findAppointmentByIdempotencyKey(database, idempotencyKey);
      if (duplicate) {
        if (duplicate.requestFingerprint && duplicate.requestFingerprint !== requestFingerprint) {
          throw new HttpError(
            409,
            'CONFLICT',
            'This idempotency key was already used for different appointment data.',
          );
        }
        return { appointment: acknowledgement(duplicate), created: false };
      }
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
