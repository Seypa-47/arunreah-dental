import { eq } from 'drizzle-orm';
import { appointmentRequestRateLimits, appointments } from '../db/schema';
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
