import { z } from 'zod';

export const showcaseStatusValues = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must use lowercase letters, numbers, and hyphens.');
const text = (maxLength: number) => z.string().trim().max(maxLength).nullable().optional();
const displayOrder = z.number().int().min(0).max(1_000_000);
const section = z.object({
  sectionType: z.enum(['TEXT', 'IMAGE', 'QUOTE']).default('TEXT'),
  headingEn: text(300),
  headingKm: text(300),
  bodyEn: text(10_000),
  bodyKm: text(10_000),
  imageKey: text(1_024),
  displayOrder: displayOrder.default(0),
});

const fields = {
  slug,
  status: z.enum(showcaseStatusValues).default('DRAFT'),
  showOnHomepage: z.boolean().default(false),
  displayOrder: displayOrder.default(0),
  titleEn: z.string().trim().min(1).max(300),
  titleKm: z.string().trim().min(1).max(300),
  categoryEn: text(160),
  categoryKm: text(160),
  summaryEn: text(2_000),
  summaryKm: text(2_000),
  bodyEn: text(20_000),
  bodyKm: text(20_000),
  coverImageKey: text(1_024),
  metaTitleEn: text(160),
  metaTitleKm: text(160),
  metaDescriptionEn: text(320),
  metaDescriptionKm: text(320),
} as const;

export const createShowcaseSchema = z
  .object({
    ...fields,
    sections: z.array(section).max(12).default([]),
    relatedShowcaseIds: z.array(z.string().min(1)).max(3).default([]),
  })
  .strict();

export const updateShowcaseSchema = z
  .object({
    slug: fields.slug.optional(),
    status: z.enum(showcaseStatusValues).optional(),
    showOnHomepage: z.boolean().optional(),
    displayOrder: displayOrder.optional(),
    titleEn: fields.titleEn.optional(),
    titleKm: fields.titleKm.optional(),
    categoryEn: fields.categoryEn,
    categoryKm: fields.categoryKm,
    summaryEn: fields.summaryEn,
    summaryKm: fields.summaryKm,
    bodyEn: fields.bodyEn,
    bodyKm: fields.bodyKm,
    coverImageKey: fields.coverImageKey,
    metaTitleEn: fields.metaTitleEn,
    metaTitleKm: fields.metaTitleKm,
    metaDescriptionEn: fields.metaDescriptionEn,
    metaDescriptionKm: fields.metaDescriptionKm,
    sections: z.array(section).max(12).optional(),
    relatedShowcaseIds: z.array(z.string().min(1)).max(3).optional(),
  })
  .strict()
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: 'Provide at least one field to update.',
  });

export const adminShowcaseListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(160).optional(),
  status: z.enum(showcaseStatusValues).optional(),
  showOnHomepage: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  category: z.string().trim().max(160).optional(),
  sort: z.enum(['title', 'displayOrder', 'createdAt', 'updatedAt']).default('displayOrder'),
  order: z.enum(['asc', 'desc']).default('asc'),
});
export const publicShowcaseQuerySchema = z.object({
  lang: z.enum(['en', 'km']).default('en'),
  homepage: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export type CreateShowcaseInput = z.infer<typeof createShowcaseSchema>;
export type UpdateShowcaseInput = z.infer<typeof updateShowcaseSchema>;
export type AdminShowcaseListQuery = z.infer<typeof adminShowcaseListQuerySchema>;
export type ShowcaseLanguage = z.infer<typeof publicShowcaseQuerySchema>['lang'];
