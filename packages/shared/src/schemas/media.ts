import { z } from 'zod';

export const mediaCategoryValues = [
  'clinic',
  'branches',
  'services',
  'doctors',
  'showcases',
] as const;

export const mediaCategorySchema = z.enum(mediaCategoryValues);

export const deleteMediaSchema = z
  .object({
    key: z
      .string()
      .regex(
        /^(clinic|branches|services|doctors|showcases)\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|png|webp)$/,
      ),
  })
  .strict();

export type MediaCategory = z.infer<typeof mediaCategorySchema>;
export type DeleteMediaInput = z.infer<typeof deleteMediaSchema>;
