import { z } from 'zod';

export const uuidPathParamSchema = z.object({ id: z.string().uuid() }).strict();
export const slugPathParamSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  })
  .strict();
