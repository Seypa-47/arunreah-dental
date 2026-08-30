import { eq } from 'drizzle-orm';
import type { CreateContactSettingsInput, UpdateContactSettingsInput } from '@arunreah/shared';
import { contactSettings } from '../db/schema';
import type { DatabaseClient } from '../db/client';

export const contactSettingsId = 'contact';

export async function findContactSettings(database: DatabaseClient) {
  const [settings] = await database
    .select()
    .from(contactSettings)
    .where(eq(contactSettings.id, contactSettingsId))
    .limit(1);

  return settings;
}

export async function createContactSettings(
  database: DatabaseClient,
  input: CreateContactSettingsInput,
) {
  const now = new Date().toISOString();

  await database.insert(contactSettings).values({
    id: contactSettingsId,
    ...input,
    createdAt: now,
    updatedAt: now,
  });

  return findContactSettings(database);
}

export async function updateContactSettings(
  database: DatabaseClient,
  input: UpdateContactSettingsInput,
) {
  await database
    .update(contactSettings)
    .set({ ...input, updatedAt: new Date().toISOString() })
    .where(eq(contactSettings.id, contactSettingsId));

  return findContactSettings(database);
}
