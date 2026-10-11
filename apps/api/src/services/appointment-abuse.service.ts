import type { DatabaseClient } from '../db/client';
import { saveAppointmentRequestRateLimit } from '../repositories/appointment.repository';
import { HttpError } from '../shared/http-error';
import { getClientIp } from './auth.service';
import { hashSessionToken } from './session.service';

const appointmentRequestLimit = 10;
const appointmentRequestWindowMilliseconds = 15 * 60 * 1000;

export async function createAppointmentRequestRateLimitKey(headers: Headers) {
  return hashSessionToken(getClientIp(headers));
}

/** Counts an attempt before remote verification, atomically with its limit check. */
export async function consumeAppointmentRequestAttempt(database: DatabaseClient, key: string) {
  const now = new Date();
  const consumed = await saveAppointmentRequestRateLimit(database, {
    key,
    now: now.toISOString(),
    windowCutoff: new Date(now.getTime() - appointmentRequestWindowMilliseconds).toISOString(),
    attemptLimit: appointmentRequestLimit,
  });
  if (consumed === false) {
    throw new HttpError(
      429,
      'RATE_LIMITED',
      'Too many appointment requests. Please try again later.',
    );
  }
}
