import { eq } from 'drizzle-orm';
import type { CreateClinicSettingsInput, UpdateClinicSettingsInput } from '@arunreah/shared';
import { clinicSettings } from '../db/schema';
import type { DatabaseClient } from '../db/client';
import { inTransaction } from '../db/transaction';
import { upsert } from './image-presentation.repository';

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

  const { logoImagePresentation, ...row } = input;
  await inTransaction(database, async (transaction) => {
    await transaction.insert(clinicSettings).values({ id: clinicSettingsId, ...row, createdAt: now, updatedAt: now });
    if (logoImagePresentation) await upsert(transaction, { ownerType: 'CLINIC_SETTINGS', ownerId: clinicSettingsId, slot: 'LOGO' }, logoImagePresentation);
  });

  return findClinicSettings(database);
}

export async function updateClinicSettings(
  database: DatabaseClient,
  input: UpdateClinicSettingsInput,
) {
  const { logoImagePresentation, ...row } = input;
  await inTransaction(database, async (transaction) => {
    if (Object.keys(row).length > 0) await transaction.update(clinicSettings).set({ ...row, updatedAt: new Date().toISOString() }).where(eq(clinicSettings.id, clinicSettingsId));
    if (logoImagePresentation) await upsert(transaction, { ownerType: 'CLINIC_SETTINGS', ownerId: clinicSettingsId, slot: 'LOGO' }, logoImagePresentation);
  });

  return findClinicSettings(database);
}
