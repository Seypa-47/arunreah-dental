import { z } from 'zod';

const phonePattern = /^[0-9+()\-\s]+$/;

function optionalText(maxLength: number) {
  return z.string().trim().max(maxLength).nullable().optional();
}

function optionalUrl() {
  return z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : value))
    .pipe(z.string().url().max(2_048).nullable())
    .optional();
}

function optionalEmail() {
  return z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : value))
    .pipe(z.string().email().max(254).nullable())
    .optional();
}

function optionalPhone() {
  return z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : value))
    .pipe(z.string().min(6).max(32).regex(phonePattern).nullable())
    .optional();
}

const primaryPhoneSchema = z
  .string()
  .trim()
  .min(6)
  .max(32)
  .regex(phonePattern, 'Phone number contains unsupported characters.');

const contactSettingsFields = {
  primaryPhone: primaryPhoneSchema,
  secondaryPhone: optionalPhone(),
  primaryEmail: optionalEmail(),
  businessHoursEn: optionalText(1_000),
  businessHoursKm: optionalText(1_000),
  mainGoogleMapsUrl: optionalUrl(),
  facebookUrl: optionalUrl(),
  telegramUrl: optionalUrl(),
  instagramUrl: optionalUrl(),
} as const;

export const createContactSettingsSchema = z.object(contactSettingsFields);

export const updateContactSettingsSchema = z
  .object({
    primaryPhone: primaryPhoneSchema.optional(),
    secondaryPhone: contactSettingsFields.secondaryPhone,
    primaryEmail: contactSettingsFields.primaryEmail,
    businessHoursEn: contactSettingsFields.businessHoursEn,
    businessHoursKm: contactSettingsFields.businessHoursKm,
    mainGoogleMapsUrl: contactSettingsFields.mainGoogleMapsUrl,
    facebookUrl: contactSettingsFields.facebookUrl,
    telegramUrl: contactSettingsFields.telegramUrl,
    instagramUrl: contactSettingsFields.instagramUrl,
  })
  .strict()
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: 'Provide at least one field to update.',
  });

export const contactSettingsAdminReadSchema = z.object({
  id: z.string(),
  primaryPhone: z.string(),
  secondaryPhone: z.string().nullable(),
  primaryEmail: z.string().nullable(),
  businessHoursEn: z.string().nullable(),
  businessHoursKm: z.string().nullable(),
  mainGoogleMapsUrl: z.string().nullable(),
  facebookUrl: z.string().nullable(),
  telegramUrl: z.string().nullable(),
  instagramUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const contactSettingsPublicReadSchema = contactSettingsAdminReadSchema.pick({
  primaryPhone: true,
  secondaryPhone: true,
  primaryEmail: true,
  businessHoursEn: true,
  businessHoursKm: true,
  mainGoogleMapsUrl: true,
  facebookUrl: true,
  telegramUrl: true,
  instagramUrl: true,
});

export type CreateContactSettingsInput = z.infer<typeof createContactSettingsSchema>;
export type UpdateContactSettingsInput = z.infer<typeof updateContactSettingsSchema>;
export type ContactSettingsAdminRead = z.infer<typeof contactSettingsAdminReadSchema>;
export type ContactSettingsPublicRead = z.infer<typeof contactSettingsPublicReadSchema>;
