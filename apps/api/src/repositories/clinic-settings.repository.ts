import { eq } from 'drizzle-orm';
import type { CreateClinicSettingsInput, UpdateClinicSettingsInput } from '@arunreah/shared';
import { clinicSettings } from '../db/schema';
import type { DatabaseClient } from '../db/client';

export const clinicSettingsId = 'clinic';

export async function findClinicSettings(database: DatabaseClient) {
  const [settings] = await database
    .select()
    .from(clinicSettings)
    .where(eq(clinicSettings.id, clinicSettingsId))
    .limit(1);

  return settings;
}

export async function createClinicSettings(
  database: DatabaseClient,
  input: CreateClinicSettingsInput,
) {
  const now = new Date().toISOString();

  await database.insert(clinicSettings).values({
    id: clinicSettingsId,
    ...input,
    createdAt: now,
    updatedAt: now,
  });

  return findClinicSettings(database);
}

export async function updateClinicSettings(
  database: DatabaseClient,
  input: UpdateClinicSettingsInput,
) {
  await database
    .update(clinicSettings)
    .set({ ...input, updatedAt: new Date().toISOString() })
    .where(eq(clinicSettings.id, clinicSettingsId));

  return findClinicSettings(database);
}
