import { deleteMediaSchema, successResponse } from '@arunreah/shared';
import type { Context } from 'hono';
import { getRuntimeConfig } from '../../config/env';
import { createDbClient } from '../../db/client';
import { HttpError } from '../../shared/http-error';
import { parseRequestBody } from '../../shared/request';
import {
  deleteOrphanedMedia,
  MAX_MEDIA_MULTIPART_BYTES,
  uploadImage,
  validateMediaCategory,
} from '../../services/media.service';
import type { AppEnv } from '../../types/env';

export async function uploadMediaController(context: Context<AppEnv>) {
  const contentLength = Number(context.req.header('Content-Length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_MEDIA_MULTIPART_BYTES) {
    throw new HttpError(400, 'MEDIA_TOO_LARGE', 'Image uploads must not exceed 5 MB.');
  }

  const formData = await context.req.formData().catch(() => undefined);
  const file = formData?.get('file');
  const category = formData?.get('category');

  if (!file || typeof file === 'string') {
    throw new HttpError(400, 'VALIDATION_ERROR', 'An image file is required.');
  }
  if (!category || typeof category !== 'string') {
    throw new HttpError(400, 'VALIDATION_ERROR', 'A media category is required.');
  }

  const media = await uploadImage(
    context.env.ASSETS,
    validateMediaCategory(category),
    file,
    getRuntimeConfig(context.env).mediaPublicBaseUrl,
  );
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse(media), 201);
}

export async function deleteMediaController(context: Context<AppEnv>) {
  const input = await parseRequestBody(context, deleteMediaSchema);
  await deleteOrphanedMedia(createDbClient(context.env.DB), context.env.ASSETS, input.key);
  context.header('Cache-Control', 'private, no-store');
  return context.json(successResponse({ deleted: true }));
}
