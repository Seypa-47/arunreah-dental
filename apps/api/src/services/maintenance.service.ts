import type { DatabaseClient } from '../db/client';
import { cleanupExpiredAppointmentRateLimits } from '../repositories/appointment.repository';
import { cleanupStaleMediaDeletionLocks } from '../repositories/media.repository';
import { cleanupExpiredAuthenticationRecords } from '../repositories/session.repository';

const cleanupLimit = 100;
const fifteenMinutes = 15 * 60 * 1000;
const fiveMinutes = 5 * 60 * 1000;
const revokedSessionRetention = 7 * 24 * 60 * 60 * 1000;

/** Opportunistic, bounded cleanup for short-lived operational records. */
export async function runBoundedMaintenance(database: DatabaseClient, date = new Date()) {
  const now = date.toISOString();
  const inactiveRateLimitCutoff = new Date(date.getTime() - fifteenMinutes).toISOString();

  await cleanupExpiredAuthenticationRecords(database, {
    now,
    inactiveRateLimitCutoff,
    revokedSessionCutoff: new Date(date.getTime() - revokedSessionRetention).toISOString(),
    limit: cleanupLimit,
  });
  await cleanupExpiredAppointmentRateLimits(database, inactiveRateLimitCutoff, cleanupLimit);
  await cleanupStaleMediaDeletionLocks(
    database,
    new Date(date.getTime() - fiveMinutes).toISOString(),
    cleanupLimit,
  );
}

export async function runBestEffortMaintenance(database: DatabaseClient) {
  try {
    await runBoundedMaintenance(database);
  } catch {
    console.warn('Bounded database maintenance failed', { operation: 'expired-record-cleanup' });
  }
}
