import { z } from 'zod';
import { optionalMediaKeySchema } from './media';
import { imagePresentationSchema } from './image-presentation';

export const doctorStatusValues = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

/** The four public Our Team categories. All share the doctors table. */
export const teamCategoryValues = [
  'DENTIST',
  'GENERAL_PRACTITIONER',
  'RECEPTIONIST',
  'ASSISTANT',
] as const;

/**
 * Categories that may take appointments. Non-clinical staff must never be
 * attached to an appointment, so this list gates the `bookable` flag.
 */
export const clinicalTeamCategoryValues = ['DENTIST', 'GENERAL_PRACTITIONER'] as const;

export function isClinicalTeamCategory(category: string): boolean {
  return (clinicalTeamCategoryValues as readonly string[]).includes(category);
}

/** Ordered list blocks on a team member profile. */
export const profileItemKindValues = [
  'EXPERIENCE',
  'RESPONSIBILITY',
  'TRAINING',
  'LANGUAGE',
] as const;

/** Line icons the public responsibility cards can render. */
export const responsibilityIconValues = [
  'appointments',
  'comfort',
  'communication',
  'enquiries',
  'equipment',
  'hygiene',
  'records',
  'support',
  'welcome',
] as const;

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
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (value === null) return null;
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    })
    .pipe(
      z
        .string()
        .min(6)
        .max(32)
        .regex(/^[0-9+()\-\s]+$/)
        .nullable()
        .optional(),
    );
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

const profileItem = z
  .object({
    kind: z.enum(profileItemKindValues),
    icon: z.enum(responsibilityIconValues).nullable().optional(),
    titleEn: z.string().trim().min(1).max(160),
    titleKm: z.string().trim().min(1).max(160),
    subtitleEn: optionalText(300),
    subtitleKm: optionalText(300),
    meta: optionalText(100),
    displayOrder: displayOrder.default(0),
  })
  .superRefine((value, context) => {
    if (value.kind === 'RESPONSIBILITY' && !value.icon) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Responsibility items need an icon.',
        path: ['icon'],
      });
    }
    if (value.kind !== 'RESPONSIBILITY' && value.icon) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only responsibility items can carry an icon.',
        path: ['icon'],
      });
    }
  });

/**
 * `bookable` may only be true for a clinical category. On a partial update both
 * fields may be absent, so this can only decide when it sees both; the service
 * layer re-checks against the stored record.
 */
function bookableMatchesCategory(value: { bookable?: boolean; category?: string }) {
  if (value.bookable === undefined || value.category === undefined) return true;
  if (!value.bookable) return true;
  return isClinicalTeamCategory(value.category);
}

const bookableRefinement = {
  message: 'Only dentists and general practitioners can be bookable.',
  path: ['bookable'],
};

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
  photoKey: optionalMediaKeySchema,
  photoImagePresentation: imagePresentationSchema.optional(),
  yearsExperience: z.number().int().min(0).max(100).nullable().optional(),
  successfulProcedures: z.number().int().min(0).max(10_000_000).nullable().optional(),
  patientSatisfaction: z.number().int().min(0).max(100).nullable().optional(),
  phone: optionalPhone(),
  category: z.enum(teamCategoryValues).default('DENTIST'),
  bookable: z.boolean().default(true),
  departmentEn: optionalText(160),
  departmentKm: optionalText(160),
  teamNoteEn: optionalText(2_000),
  teamNoteKm: optionalText(2_000),
} as const;

export const createDoctorSchema = z
  .object({
    ...doctorFields,
    expertise: z.array(expertise).max(10).default([]),
    education: z.array(education).max(10).default([]),
    relatedDoctorIds: z.array(z.string().min(1)).max(3).default([]),
    branchIds: z.array(z.string().min(1)).default([]),
    profileItems: z.array(profileItem).max(24).default([]),
  })
  .strict()
  .refine(bookableMatchesCategory, bookableRefinement);

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
    photoImagePresentation: doctorFields.photoImagePresentation,
    yearsExperience: doctorFields.yearsExperience,
    successfulProcedures: doctorFields.successfulProcedures,
    patientSatisfaction: doctorFields.patientSatisfaction,
    phone: doctorFields.phone,
    expertise: z.array(expertise).max(10).optional(),
    education: z.array(education).max(10).optional(),
    relatedDoctorIds: z.array(z.string().min(1)).max(3).optional(),
    branchIds: z.array(z.string().min(1)).optional(),
    category: z.enum(teamCategoryValues).optional(),
    bookable: z.boolean().optional(),
    departmentEn: doctorFields.departmentEn,
    departmentKm: doctorFields.departmentKm,
    teamNoteEn: doctorFields.teamNoteEn,
    teamNoteKm: doctorFields.teamNoteKm,
    profileItems: z.array(profileItem).max(24).optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: 'Provide at least one field to update.',
  })
  .refine(bookableMatchesCategory, bookableRefinement);

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
  category: z.enum(teamCategoryValues).optional(),
  bookable: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  sort: z.enum(['name', 'displayOrder', 'createdAt', 'updatedAt']).default('displayOrder'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export const reorderDoctorsSchema = z
  .object({
    category: z.enum(teamCategoryValues),
    ids: z.array(z.string().trim().min(1)).min(1).max(100),
  })
  .strict()
  .refine((value) => new Set(value.ids).size === value.ids.length, {
    message: 'Doctor IDs must be unique.',
    path: ['ids'],
  });

export const publicDoctorQuerySchema = z.object({
  lang: z.enum(['en', 'km']).default('en'),
  category: z.enum(teamCategoryValues).optional(),
  bookable: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
}).strict();

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
/**
 * Request-body types for API clients. Fields with a schema default are optional
 * on the way in and guaranteed on the way out, so clients build a *Payload and
 * the server works with the parsed *Input.
 */
export type CreateDoctorPayload = z.input<typeof createDoctorSchema>;
export type UpdateDoctorPayload = z.input<typeof updateDoctorSchema>;
export type AdminDoctorListQuery = z.infer<typeof adminDoctorListQuerySchema>;
export type ReorderDoctorsInput = z.infer<typeof reorderDoctorsSchema>;
export type DoctorLanguage = z.infer<typeof publicDoctorQuerySchema>['lang'];
export type PublicDoctorQuery = z.infer<typeof publicDoctorQuerySchema>;
export type TeamCategory = (typeof teamCategoryValues)[number];
export type ClinicalTeamCategory = (typeof clinicalTeamCategoryValues)[number];
export type ProfileItemKind = (typeof profileItemKindValues)[number];
export type ResponsibilityIcon = (typeof responsibilityIconValues)[number];
export type TeamProfileItemInput = z.infer<typeof profileItem>;
