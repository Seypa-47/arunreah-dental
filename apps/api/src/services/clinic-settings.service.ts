import { createClinicSettingsSchema } from '@arunreah/shared';
import type {
  ClinicSettingsAdminRead,
  ClinicSettingsPublicRead,
  UpdateClinicSettingsInput,
} from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import {
  createClinicSettings,
  findClinicSettings,
  updateClinicSettings,
} from '../repositories/clinic-settings.repository';
import { HttpError } from '../shared/http-error';

function toAdminClinicSettings(settings: NonNullable<Awaited<ReturnType<typeof findClinicSettings>>>)
  : ClinicSettingsAdminRead {
  return {
    id: settings.id,
    clinicNameEn: settings.clinicNameEn,
    clinicNameKm: settings.clinicNameKm,
    taglineEn: settings.taglineEn,
    taglineKm: settings.taglineKm,
    shortAboutEn: settings.shortAboutEn,
    shortAboutKm: settings.shortAboutKm,
    logoKey: settings.logoKey,
    yearsExperience: settings.yearsExperience,
    successfulCases: settings.successfulCases,
    patientSatisfaction: settings.patientSatisfaction,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}

function toPublicClinicSettings(settings: ClinicSettingsAdminRead): ClinicSettingsPublicRead {
  return {
    clinicNameEn: settings.clinicNameEn,
    clinicNameKm: settings.clinicNameKm,
    taglineEn: settings.taglineEn,
    taglineKm: settings.taglineKm,
    shortAboutEn: settings.shortAboutEn,
    shortAboutKm: settings.shortAboutKm,
    logoKey: settings.logoKey,
    yearsExperience: settings.yearsExperience,
    successfulCases: settings.successfulCases,
    patientSatisfaction: settings.patientSatisfaction,
  };
}

export async function getAdminClinicSettings(
  database: DatabaseClient,
): Promise<ClinicSettingsAdminRead> {
  const settings = await findClinicSettings(database);

  if (!settings) {
    throw new HttpError(404, 'NOT_FOUND', 'Clinic information has not been configured.');
  }

  return toAdminClinicSettings(settings);
}

export async function getPublicClinicSettings(
  database: DatabaseClient,
): Promise<ClinicSettingsPublicRead> {
  return toPublicClinicSettings(await getAdminClinicSettings(database));
}

export async function saveClinicSettings(
  database: DatabaseClient,
  input: UpdateClinicSettingsInput,
): Promise<ClinicSettingsAdminRead> {
  const current = await findClinicSettings(database);

  if (current) {
    const updated = await updateClinicSettings(database, input);
    if (!updated) throw new Error('Updated clinic settings could not be loaded.');
    return toAdminClinicSettings(updated);
  }

  const initial = createClinicSettingsSchema.safeParse(input);
  if (!initial.success) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'Clinic name in English and Khmer are required for initial setup.',
    );
  }

  const created = await createClinicSettings(database, initial.data);
  if (!created) throw new Error('Created clinic settings could not be loaded.');
  return toAdminClinicSettings(created);
}
