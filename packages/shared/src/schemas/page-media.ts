import { z } from 'zod';
import { imagePresentationSchema } from './image-presentation';

export const pageMediaPlacementValues = ['HOME_PROMOTIONS', 'ABOUT_PROFESSIONAL_DEVELOPMENT', 'ABOUT_ADVANCED_FACILITIES', 'DOCTORS_HERO', 'DOCTORS_PATIENT_EDUCATION'] as const;
export const pageMediaPlacementSchema = z.enum(pageMediaPlacementValues);
const base = z.object({
  placement: pageMediaPlacementSchema,
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  titleEn: z.string().trim().max(160).nullable().optional(), titleKm: z.string().trim().max(160).nullable().optional(),
  bodyEn: z.string().trim().max(1200).nullable().optional(), bodyKm: z.string().trim().max(1200).nullable().optional(),
  badgeEn: z.string().trim().max(80).nullable().optional(), badgeKm: z.string().trim().max(80).nullable().optional(),
  discountEn: z.string().trim().max(40).nullable().optional(), discountKm: z.string().trim().max(40).nullable().optional(),
  benefitsEn: z.string().trim().max(600).nullable().optional(), benefitsKm: z.string().trim().max(600).nullable().optional(),
  validUntil: z.string().date().nullable().optional(),
  imagePresentation: imagePresentationSchema.optional(),
  imageKey: z.string().regex(/^clinic\/[a-z0-9][a-z0-9-]*\.(jpg|png|webp)$/),
  displayOrder: z.number().int().min(0).max(999).default(0),
});
export const createPageMediaSchema = base.strict();
export const updatePageMediaSchema = base.partial().strict();
export const pageMediaPublicQuerySchema = z.object({ placement: pageMediaPlacementSchema, lang: z.enum(['en', 'km']).default('en') });
export const pageMediaAdminQuerySchema = z.object({ placement: pageMediaPlacementSchema }).strict();
export type PageMediaPlacement = z.infer<typeof pageMediaPlacementSchema>;
export type CreatePageMediaInput = z.infer<typeof createPageMediaSchema>;
export type UpdatePageMediaInput = z.infer<typeof updatePageMediaSchema>;
