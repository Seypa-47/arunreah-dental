import { z } from 'zod';

const optionalText = (maxLength: number) => z.string().trim().max(maxLength).nullable().optional();

const clinicSettingsFields = {
  clinicNameEn: z.string().trim().min(1).max(160),
  clinicNameKm: z.string().trim().min(1).max(160),
  taglineEn: optionalText(300),
  taglineKm: optionalText(300),
  shortAboutEn: optionalText(5_000),
  shortAboutKm: optionalText(5_000),
  visionTitleEn: optionalText(300),
  visionTitleKm: optionalText(300),
  visionBodyEn: optionalText(2_000),
  visionBodyKm: optionalText(2_000),
  logoKey: optionalText(1_024),
  yearsExperience: z.number().int().min(0).max(200).nullable().optional(),
} as const;

export const createClinicSettingsSchema = z.object(clinicSettingsFields);

export const updateClinicSettingsSchema = z
  .object({
    clinicNameEn: clinicSettingsFields.clinicNameEn.optional(),
    clinicNameKm: clinicSettingsFields.clinicNameKm.optional(),
    taglineEn: clinicSettingsFields.taglineEn,
    taglineKm: clinicSettingsFields.taglineKm,
    shortAboutEn: clinicSettingsFields.shortAboutEn,
    shortAboutKm: clinicSettingsFields.shortAboutKm,
    visionTitleEn: clinicSettingsFields.visionTitleEn,
    visionTitleKm: clinicSettingsFields.visionTitleKm,
    visionBodyEn: clinicSettingsFields.visionBodyEn,
    visionBodyKm: clinicSettingsFields.visionBodyKm,
    logoKey: clinicSettingsFields.logoKey,
    yearsExperience: clinicSettingsFields.yearsExperience,
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: 'Provide at least one field to update.',
  });

export const clinicSettingsAdminReadSchema = z.object({
  id: z.string(),
  clinicNameEn: z.string(),
  clinicNameKm: z.string(),
  taglineEn: z.string().nullable(),
  taglineKm: z.string().nullable(),
  shortAboutEn: z.string().nullable(),
  shortAboutKm: z.string().nullable(),
  visionTitleEn: z.string().nullable(),
  visionTitleKm: z.string().nullable(),
  visionBodyEn: z.string().nullable(),
  visionBodyKm: z.string().nullable(),
  logoKey: z.string().nullable(),
  yearsExperience: z.number().int().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const clinicSettingsPublicReadSchema = clinicSettingsAdminReadSchema.pick({
  clinicNameEn: true,
  clinicNameKm: true,
  taglineEn: true,
  taglineKm: true,
  shortAboutEn: true,
  shortAboutKm: true,
  visionTitleEn: true,
  visionTitleKm: true,
  visionBodyEn: true,
  visionBodyKm: true,
  logoKey: true,
  yearsExperience: true,
});

export type CreateClinicSettingsInput = z.infer<typeof createClinicSettingsSchema>;
export type UpdateClinicSettingsInput = z.infer<typeof updateClinicSettingsSchema>;
export type ClinicSettingsAdminRead = z.infer<typeof clinicSettingsAdminReadSchema>;
export type ClinicSettingsPublicRead = z.infer<typeof clinicSettingsPublicReadSchema>;
