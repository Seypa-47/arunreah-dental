import { createContactSettingsSchema } from '@arunreah/shared';
import type {
  ContactSettingsAdminRead,
  ContactSettingsPublicRead,
  UpdateContactSettingsInput,
} from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import {
  createContactSettings,
  findContactSettings,
  updateContactSettings,
} from '../repositories/contact-settings.repository';
import { HttpError } from '../shared/http-error';

function toAdminContactSettings(
  settings: NonNullable<Awaited<ReturnType<typeof findContactSettings>>>,
): ContactSettingsAdminRead {
  return {
    id: settings.id,
    primaryPhone: settings.primaryPhone,
    secondaryPhone: settings.secondaryPhone,
    primaryEmail: settings.primaryEmail,
    businessHoursEn: settings.businessHoursEn,
    businessHoursKm: settings.businessHoursKm,
    mainGoogleMapsUrl: settings.mainGoogleMapsUrl,
    facebookUrl: settings.facebookUrl,
    telegramUrl: settings.telegramUrl,
    instagramUrl: settings.instagramUrl,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}

function toPublicContactSettings(settings: ContactSettingsAdminRead): ContactSettingsPublicRead {
  return {
    primaryPhone: settings.primaryPhone,
    secondaryPhone: settings.secondaryPhone,
    primaryEmail: settings.primaryEmail,
    businessHoursEn: settings.businessHoursEn,
    businessHoursKm: settings.businessHoursKm,
    mainGoogleMapsUrl: settings.mainGoogleMapsUrl,
    facebookUrl: settings.facebookUrl,
    telegramUrl: settings.telegramUrl,
    instagramUrl: settings.instagramUrl,
  };
}

export async function getAdminContactSettings(
  database: DatabaseClient,
): Promise<ContactSettingsAdminRead> {
  const settings = await findContactSettings(database);

  if (!settings) {
    throw new HttpError(404, 'NOT_FOUND', 'Contact information has not been configured.');
  }

  return toAdminContactSettings(settings);
}

export async function getPublicContactSettings(
  database: DatabaseClient,
): Promise<ContactSettingsPublicRead> {
  return toPublicContactSettings(await getAdminContactSettings(database));
}

export async function saveContactSettings(
  database: DatabaseClient,
  input: UpdateContactSettingsInput,
): Promise<ContactSettingsAdminRead> {
  const current = await findContactSettings(database);

  if (current) {
    const updated = await updateContactSettings(database, input);
    if (!updated) throw new Error('Updated contact settings could not be loaded.');
    return toAdminContactSettings(updated);
  }

  const initial = createContactSettingsSchema.safeParse(input);
  if (!initial.success) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'A primary phone number is required for initial contact setup.',
    );
  }

  const created = await createContactSettings(database, initial.data);
  if (!created) throw new Error('Created contact settings could not be loaded.');
  return toAdminContactSettings(created);
}
