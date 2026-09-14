import { z } from 'zod';

/** Presentation metadata only; the original R2 object is never modified. */
export const imagePresentationSchema = z.object({
  positionX: z.number().min(0).max(100).default(50),
  positionY: z.number().min(0).max(100).default(50),
  zoom: z.number().min(1).max(2).default(1),
}).strict();

export type ImagePresentation = z.infer<typeof imagePresentationSchema>;
export const defaultImagePresentation: ImagePresentation = { positionX: 50, positionY: 50, zoom: 1 };
