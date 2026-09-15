import { z } from 'zod';

export const mediaCategoryValues = [
  'clinic',
  'branches',
  'services',
  'doctors',
  'showcases',
] as const;

export const mediaCategorySchema = z.enum(mediaCategoryValues);

/**
 * Safe R2 object keys produced by the CMS uploader.  Nested legacy paths are
 * accepted so existing content remains editable, while traversal, protocols,
 * query strings, and unsupported extensions remain invalid.
 */
export const mediaKeySchema = z
  .string()
  .regex(
    /^(clinic|branches|services|doctors|showcases)\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|png|webp)$/,
    'Use a valid CMS media key.',
  );

export const optionalMediaKeySchema = mediaKeySchema.nullable().optional();

export const deleteMediaSchema = z
  .object({
    key: mediaKeySchema,
  })
  .strict();

export type MediaCategory = z.infer<typeof mediaCategorySchema>;
export type DeleteMediaInput = z.infer<typeof deleteMediaSchema>;
