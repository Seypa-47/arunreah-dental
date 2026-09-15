import type { DatabaseClient } from '../db/client';
import { inTransaction } from '../db/transaction';
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

/** Counts an attempt before remote verification, atomically with its limit check. */
export async function consumeAppointmentRequestAttempt(database: DatabaseClient, key: string) {
  await inTransaction(database, async (transaction) => {
    const now = new Date();
    const current = await getAppointmentRequestRateLimit(transaction, key);
    const windowStartedAt = current ? new Date(current.windowStartedAt) : now;
    const withinWindow = now.getTime() - windowStartedAt.getTime() < appointmentRequestWindowMilliseconds;

    if (withinWindow && (current?.attempts ?? 0) >= appointmentRequestLimit) {
      throw new HttpError(429, 'RATE_LIMITED', 'Too many appointment requests. Please try again later.');
    }

    await saveAppointmentRequestRateLimit(transaction, {
      key,
      attempts: withinWindow ? (current?.attempts ?? 0) + 1 : 1,
      windowStartedAt: withinWindow ? windowStartedAt.toISOString() : now.toISOString(),
    });
  });
}
