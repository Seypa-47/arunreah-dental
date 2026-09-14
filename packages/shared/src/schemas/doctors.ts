import { z } from 'zod';

export const doctorStatusValues = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must use lowercase letters, numbers, and hyphens.');
const optionalText = (maxLength: number) => z.string().trim().max(maxLength).nullable().optional();
const optionalPhone = () =>
  z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : value))
    .pipe(
      z
        .string()
        .min(6)
        .max(32)
        .regex(/^[0-9+()\-\s]+$/)
        .nullable(),
    )
    .optional();
const displayOrder = z.number().int().min(0).max(1_000_000);
const expertise = z.object({
  titleEn: z.string().trim().min(1).max(160),
  titleKm: z.string().trim().min(1).max(160),
  displayOrder: displayOrder.default(0),
});
const education = z.object({
  qualificationEn: z.string().trim().min(1).max(300),
  qualificationKm: z.string().trim().min(1).max(300),
  institutionEn: z.string().trim().min(1).max(300),
  institutionKm: z.string().trim().min(1).max(300),
  yearLabel: optionalText(100),
  displayOrder: displayOrder.default(0),
});

const doctorFields = {
  slug,
  status: z.enum(doctorStatusValues).default('DRAFT'),
  featured: z.boolean().default(false),
  displayOrder: displayOrder.default(0),
  nameEn: z.string().trim().min(1).max(160),
  nameKm: z.string().trim().min(1).max(160),
  titleEn: optionalText(160),
  titleKm: optionalText(160),
  specialtyEn: optionalText(160),
  specialtyKm: optionalText(160),
  shortBioEn: optionalText(2_000),
  shortBioKm: optionalText(2_000),
  aboutEn: optionalText(10_000),
  aboutKm: optionalText(10_000),
  photoKey: optionalText(1_024),
  yearsExperience: z.number().int().min(0).max(100).nullable().optional(),
  successfulProcedures: z.number().int().min(0).max(10_000_000).nullable().optional(),
  patientSatisfaction: z.number().int().min(0).max(100).nullable().optional(),
  phone: optionalPhone(),
} as const;

export const createDoctorSchema = z
  .object({
    ...doctorFields,
    expertise: z.array(expertise).max(10).default([]),
    education: z.array(education).max(10).default([]),
    relatedDoctorIds: z.array(z.string().min(1)).max(3).default([]),
  })
  .strict();

export const updateDoctorSchema = z
  .object({
    slug: doctorFields.slug.optional(),
    status: z.enum(doctorStatusValues).optional(),
    featured: z.boolean().optional(),
    displayOrder: displayOrder.optional(),
    nameEn: doctorFields.nameEn.optional(),
    nameKm: doctorFields.nameKm.optional(),
    titleEn: doctorFields.titleEn,
    titleKm: doctorFields.titleKm,
    specialtyEn: doctorFields.specialtyEn,
    specialtyKm: doctorFields.specialtyKm,
    shortBioEn: doctorFields.shortBioEn,
    shortBioKm: doctorFields.shortBioKm,
    aboutEn: doctorFields.aboutEn,
    aboutKm: doctorFields.aboutKm,
    photoKey: doctorFields.photoKey,
    yearsExperience: doctorFields.yearsExperience,
    successfulProcedures: doctorFields.successfulProcedures,
    patientSatisfaction: doctorFields.patientSatisfaction,
    phone: doctorFields.phone,
    expertise: z.array(expertise).max(10).optional(),
    education: z.array(education).max(10).optional(),
    relatedDoctorIds: z.array(z.string().min(1)).max(3).optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: 'Provide at least one field to update.',
  });

export const adminDoctorListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(160).optional(),
  status: z.enum(doctorStatusValues).optional(),
  featured: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  specialty: z.string().trim().max(160).optional(),
  sort: z.enum(['name', 'displayOrder', 'createdAt', 'updatedAt']).default('displayOrder'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export const publicDoctorQuerySchema = z.object({ lang: z.enum(['en', 'km']).default('en') });

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type AdminDoctorListQuery = z.infer<typeof adminDoctorListQuerySchema>;
export type DoctorLanguage = z.infer<typeof publicDoctorQuerySchema>['lang'];
