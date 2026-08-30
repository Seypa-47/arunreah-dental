import { z } from 'zod';
export const serviceStatusValues = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
const text = (n: number) => z.string().trim().max(n).nullable().optional();
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const benefit = z.object({
  titleEn: z.string().trim().min(1).max(160),
  titleKm: z.string().trim().min(1).max(160),
  descriptionEn: text(1000),
  descriptionKm: text(1000),
  icon: text(100),
  displayOrder: z.number().int().min(0).max(1000000).default(0),
});
const fields = {
  slug,
  status: z.enum(serviceStatusValues).default('DRAFT'),
  featured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).max(1000000).default(0),
  nameEn: z.string().trim().min(1).max(160),
  nameKm: z.string().trim().min(1).max(160),
  summaryEn: text(1000),
  summaryKm: text(1000),
  descriptionEn: text(10000),
  descriptionKm: text(10000),
  imageKey: text(1024),
  category: text(120),
  heroEyebrowEn: text(160),
  heroEyebrowKm: text(160),
  heroTitleEn: text(300),
  heroTitleKm: text(300),
  heroSummaryEn: text(2000),
  heroSummaryKm: text(2000),
  heroImageKey: text(1024),
  aboutTitleEn: text(300),
  aboutTitleKm: text(300),
  aboutBodyEn: text(10000),
  aboutBodyKm: text(10000),
  aboutImageKey: text(1024),
  durationEn: text(300),
  durationKm: text(300),
  recoveryEn: text(300),
  recoveryKm: text(300),
  visitsEn: text(300),
  visitsKm: text(300),
  consultationEn: text(300),
  consultationKm: text(300),
  ctaTitleEn: text(300),
  ctaTitleKm: text(300),
  ctaDescriptionEn: text(2000),
  ctaDescriptionKm: text(2000),
  primaryCtaLabelEn: text(120),
  primaryCtaLabelKm: text(120),
  secondaryCtaLabelEn: text(120),
  secondaryCtaLabelKm: text(120),
  metaTitleEn: text(160),
  metaTitleKm: text(160),
  metaDescriptionEn: text(320),
  metaDescriptionKm: text(320),
} as const;
export const createServiceSchema = z
  .object({
    ...fields,
    benefits: z.array(benefit).max(6).default([]),
    relatedServiceIds: z.array(z.string().min(1)).max(3).default([]),
  })
  .strict();
export const updateServiceSchema = z
  .object({
    ...Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [
        k,
        k === 'slug' ? slug.optional() : (v as z.ZodTypeAny).optional(),
      ]),
    ),
    benefits: z.array(benefit).max(6).optional(),
    relatedServiceIds: z.array(z.string().min(1)).max(3).optional(),
  })
  .strict()
  .refine((v) => Object.values(v).some((x) => x !== undefined));
export const serviceListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(160).optional(),
  status: z.enum(serviceStatusValues).optional(),
  featured: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  category: z.string().trim().max(120).optional(),
  sort: z.enum(['name', 'displayOrder', 'createdAt', 'updatedAt']).default('displayOrder'),
  order: z.enum(['asc', 'desc']).default('asc'),
});
export const servicePublicQuerySchema = z.object({ lang: z.enum(['en', 'km']).default('en') });
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceListQuery = z.infer<typeof serviceListQuerySchema>;
export type ServiceLanguage = z.infer<typeof servicePublicQuerySchema>['lang'];
