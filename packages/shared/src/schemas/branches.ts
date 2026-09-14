import { z } from 'zod';

export const branchStatusValues = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export const publicBranchLanguageValues = ['en', 'km'] as const;

const phonePattern = /^[0-9+()\-\s]+$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function optionalText(maxLength: number) {
  return z.string().trim().max(maxLength).nullable().optional();
}

function optionalPhone() {
  return z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : value))
    .pipe(z.string().min(6).max(32).regex(phonePattern).nullable())
    .optional();
}

function optionalUrl() {
  return z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : value))
    .pipe(z.string().url().max(2_048).nullable())
    .optional();
}

const branchFields = {
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(160)
    .regex(slugPattern, 'Slug must use lowercase letters, numbers, and hyphens.'),
  status: z.enum(branchStatusValues).default('DRAFT'),
  displayOrder: z.number().int().min(0).max(1_000_000).default(0),
  nameEn: z.string().trim().min(1).max(160),
  nameKm: z.string().trim().min(1).max(160),
  badgeEn: optionalText(100),
  badgeKm: optionalText(100),
  addressEn: z.string().trim().min(1).max(1_000),
  addressKm: z.string().trim().min(1).max(1_000),
  cityProvince: optionalText(160),
  shortLocationLabelEn: optionalText(160),
  shortLocationLabelKm: optionalText(160),
  openingHoursEn: optionalText(1_000),
  openingHoursKm: optionalText(1_000),
  openingDaysEn: optionalText(300),
  openingDaysKm: optionalText(300),
  openingTime: z.string().regex(timePattern, 'Opening time must use HH:mm format.').nullable().optional(),
  closingTime: z.string().regex(timePattern, 'Closing time must use HH:mm format.').nullable().optional(),
  phone: z.string().trim().min(6).max(32).regex(phonePattern),
  secondaryPhone: optionalPhone(),
  googleMapsUrl: optionalUrl(),
  heroImageKey: optionalText(1_024),
  branchImageKey: optionalText(1_024),
  heroHeadlineEn: optionalText(300),
  heroHeadlineKm: optionalText(300),
  heroSupportingTextEn: optionalText(1_000),
  heroSupportingTextKm: optionalText(1_000),
  heroCtaLabelEn: optionalText(120),
  heroCtaLabelKm: optionalText(120),
  shortSummaryEn: optionalText(2_000),
  shortSummaryKm: optionalText(2_000),
  featured: z.boolean().default(false),
  acceptsAppointments: z.boolean().default(true),
  showOnBranchesPage: z.boolean().default(true),
  showOnHomepage: z.boolean().default(true),
  includeInHomepageHero: z.boolean().default(false),
} as const;

export const createBranchSchema = z.object(branchFields).strict();

export const updateBranchSchema = z
  .object({
    slug: branchFields.slug.optional(),
    status: z.enum(branchStatusValues).optional(),
    displayOrder: z.number().int().min(0).max(1_000_000).optional(),
    nameEn: branchFields.nameEn.optional(),
    nameKm: branchFields.nameKm.optional(),
    badgeEn: branchFields.badgeEn,
    badgeKm: branchFields.badgeKm,
    addressEn: branchFields.addressEn.optional(),
    addressKm: branchFields.addressKm.optional(),
    cityProvince: branchFields.cityProvince,
    shortLocationLabelEn: branchFields.shortLocationLabelEn,
    shortLocationLabelKm: branchFields.shortLocationLabelKm,
    openingHoursEn: branchFields.openingHoursEn,
    openingHoursKm: branchFields.openingHoursKm,
    openingDaysEn: branchFields.openingDaysEn,
    openingDaysKm: branchFields.openingDaysKm,
    openingTime: branchFields.openingTime,
    closingTime: branchFields.closingTime,
    phone: branchFields.phone.optional(),
    secondaryPhone: branchFields.secondaryPhone,
    googleMapsUrl: branchFields.googleMapsUrl,
    heroImageKey: branchFields.heroImageKey,
    branchImageKey: branchFields.branchImageKey,
    heroHeadlineEn: branchFields.heroHeadlineEn,
    heroHeadlineKm: branchFields.heroHeadlineKm,
    heroSupportingTextEn: branchFields.heroSupportingTextEn,
    heroSupportingTextKm: branchFields.heroSupportingTextKm,
    heroCtaLabelEn: branchFields.heroCtaLabelEn,
    heroCtaLabelKm: branchFields.heroCtaLabelKm,
    shortSummaryEn: branchFields.shortSummaryEn,
    shortSummaryKm: branchFields.shortSummaryKm,
    featured: z.boolean().optional(),
    acceptsAppointments: z.boolean().optional(),
    showOnBranchesPage: z.boolean().optional(),
    showOnHomepage: z.boolean().optional(),
    includeInHomepageHero: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: 'Provide at least one field to update.',
  });

export const adminBranchListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(160).optional(),
  status: z.enum(branchStatusValues).optional(),
  sort: z.enum(['name', 'displayOrder', 'createdAt', 'updatedAt']).default('displayOrder'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export const publicBranchLanguageSchema = z.enum(publicBranchLanguageValues).default('en');
export const publicBranchQuerySchema = z.object({ lang: publicBranchLanguageSchema });

export const adminBranchReadSchema = z.object({
  id: z.string(),
  slug: z.string(),
  status: z.enum(branchStatusValues),
  displayOrder: z.number().int(),
  nameEn: z.string(),
  nameKm: z.string(),
  badgeEn: z.string().nullable(),
  badgeKm: z.string().nullable(),
  addressEn: z.string(),
  addressKm: z.string(),
  cityProvince: z.string().nullable(),
  shortLocationLabelEn: z.string().nullable(),
  shortLocationLabelKm: z.string().nullable(),
  openingHoursEn: z.string().nullable(),
  openingHoursKm: z.string().nullable(),
  openingDaysEn: z.string().nullable(),
  openingDaysKm: z.string().nullable(),
  openingTime: z.string().nullable(),
  closingTime: z.string().nullable(),
  phone: z.string(),
  secondaryPhone: z.string().nullable(),
  googleMapsUrl: z.string().nullable(),
  heroImageKey: z.string().nullable(),
  branchImageKey: z.string().nullable(),
  heroHeadlineEn: z.string().nullable(),
  heroHeadlineKm: z.string().nullable(),
  heroSupportingTextEn: z.string().nullable(),
  heroSupportingTextKm: z.string().nullable(),
  heroCtaLabelEn: z.string().nullable(),
  heroCtaLabelKm: z.string().nullable(),
  shortSummaryEn: z.string().nullable(),
  shortSummaryKm: z.string().nullable(),
  featured: z.boolean(),
  acceptsAppointments: z.boolean(),
  showOnBranchesPage: z.boolean(),
  showOnHomepage: z.boolean(),
  includeInHomepageHero: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const publicBranchReadSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  badge: z.string().nullable(),
  address: z.string(),
  cityProvince: z.string().nullable(),
  shortLocationLabel: z.string().nullable(),
  openingHours: z.string().nullable(),
  openingDays: z.string().nullable(),
  openingTime: z.string().nullable(),
  closingTime: z.string().nullable(),
  phone: z.string(),
  secondaryPhone: z.string().nullable(),
  googleMapsUrl: z.string().nullable(),
  heroImageKey: z.string().nullable(),
  branchImageKey: z.string().nullable(),
  heroHeadline: z.string().nullable(),
  heroSupportingText: z.string().nullable(),
  heroCtaLabel: z.string().nullable(),
  shortSummary: z.string().nullable(),
  featured: z.boolean(),
  acceptsAppointments: z.boolean(),
  showOnHomepage: z.boolean(),
  includeInHomepageHero: z.boolean(),
});

export type BranchStatus = z.infer<typeof createBranchSchema>['status'];
export type PublicBranchLanguage = z.infer<typeof publicBranchLanguageSchema>;
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
export type AdminBranchListQuery = z.infer<typeof adminBranchListQuerySchema>;
export type AdminBranchRead = z.infer<typeof adminBranchReadSchema>;
export type PublicBranchRead = z.infer<typeof publicBranchReadSchema>;
