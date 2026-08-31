import type { DatabaseClient } from '../db/client';
import {
  getAppointmentRequestRateLimit,
  saveAppointmentRequestRateLimit,
} from '../repositories/appointment.repository';
import { HttpError } from '../shared/http-error';
import { getClientIp } from './auth.service';
import { hashSessionToken } from './session.service';

const appointmentRequestLimit = 10;
const appointmentRequestWindowMilliseconds = 15 * 60 * 1000;

export async function createAppointmentRequestRateLimitKey(headers: Headers) {
  return hashSessionToken(getClientIp(headers));
}

export async function assertAppointmentRequestAllowed(database: DatabaseClient, key: string) {
  const record = await getAppointmentRequestRateLimit(database, key);
  if (!record) return;

  const elapsed = Date.now() - new Date(record.windowStartedAt).valueOf();
  if (
    elapsed >= 0 &&
    elapsed < appointmentRequestWindowMilliseconds &&
    record.attempts >= appointmentRequestLimit
  ) {
    throw new HttpError(
      429,
      'RATE_LIMITED',
      'Too many appointment requests. Please try again later.',
    );
  }
}

export async function recordAppointmentRequestAttempt(database: DatabaseClient, key: string) {
  const now = new Date();
  const current = await getAppointmentRequestRateLimit(database, key);
  const windowStartedAt = current ? new Date(current.windowStartedAt) : now;
  const withinWindow =
    now.getTime() - windowStartedAt.getTime() < appointmentRequestWindowMilliseconds;

  await saveAppointmentRequestRateLimit(database, {
    key,
    attempts: withinWindow ? (current?.attempts ?? 0) + 1 : 1,
    windowStartedAt: withinWindow ? windowStartedAt.toISOString() : now.toISOString(),
  });
}
