import { eq } from 'drizzle-orm';
import type { CreateClinicSettingsInput, UpdateClinicSettingsInput } from '@arunreah/shared';
import { clinicSettings } from '../db/schema';
import type { DatabaseClient } from '../db/client';
import { atomicBatch, type AtomicBatchStatement } from '../db/transaction';
import { upsertStatement } from './image-presentation.repository';

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
  const statements: [AtomicBatchStatement, ...AtomicBatchStatement[]] = [
    database
      .insert(clinicSettings)
      .values({ id: clinicSettingsId, ...row, createdAt: now, updatedAt: now }),
  ];
  if (logoImagePresentation)
    statements.push(
      upsertStatement(
        database,
        { ownerType: 'CLINIC_SETTINGS', ownerId: clinicSettingsId, slot: 'LOGO' },
        logoImagePresentation,
      ),
    );
  await atomicBatch(database, statements);

  return findClinicSettings(database);
}

export async function updateClinicSettings(
  database: DatabaseClient,
  input: UpdateClinicSettingsInput,
) {
  const { logoImagePresentation, ...row } = input;
  const statements: AtomicBatchStatement[] = [];
  if (Object.keys(row).length > 0)
    statements.push(
      database
        .update(clinicSettings)
        .set({ ...row, updatedAt: new Date().toISOString() })
        .where(eq(clinicSettings.id, clinicSettingsId)),
    );
  if (logoImagePresentation)
    statements.push(
      upsertStatement(
        database,
        { ownerType: 'CLINIC_SETTINGS', ownerId: clinicSettingsId, slot: 'LOGO' },
        logoImagePresentation,
      ),
    );
  if (statements.length > 0)
    await atomicBatch(database, statements as [AtomicBatchStatement, ...AtomicBatchStatement[]]);

  return findClinicSettings(database);
}
