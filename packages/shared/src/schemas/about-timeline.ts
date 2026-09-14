import { z } from 'zod';

const base = z.object({
  year: z.number().int().min(1900).max(2100),
  titleEn: z.string().trim().min(1).max(180),
  titleKm: z.string().trim().min(1).max(180),
  bodyEn: z.string().trim().min(1).max(1200),
  bodyKm: z.string().trim().min(1).max(1200),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  displayOrder: z.number().int().min(0).max(999).default(0),
});

export const createAboutTimelineSchema = base.strict();
export const updateAboutTimelineSchema = base.partial().strict();
export const aboutTimelinePublicQuerySchema = z.object({ lang: z.enum(['en', 'km']).default('en') });
export type CreateAboutTimelineInput = z.infer<typeof createAboutTimelineSchema>;
export type UpdateAboutTimelineInput = z.infer<typeof updateAboutTimelineSchema>;
