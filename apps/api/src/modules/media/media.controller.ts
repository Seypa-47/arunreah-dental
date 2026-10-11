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
  const contentLengthHeader = context.req.header('Content-Length');
  const contentLength = contentLengthHeader === undefined ? undefined : Number(contentLengthHeader);
  if (contentLength !== undefined && (!Number.isSafeInteger(contentLength) || contentLength < 0)) {
    throw new HttpError(
      400,
      'VALIDATION_ERROR',
      'Content-Length must be a valid non-negative integer.',
    );
  }
  if (contentLength !== undefined && contentLength > MAX_MEDIA_MULTIPART_BYTES) {
    throw new HttpError(400, 'MEDIA_TOO_LARGE', 'Image uploads must not exceed 5 MB.');
  }

  const body = context.req.raw.body;
  if (!body) throw new HttpError(400, 'VALIDATION_ERROR', 'A multipart request body is required.');
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_MEDIA_MULTIPART_BYTES) {
      await reader.cancel();
      throw new HttpError(400, 'MEDIA_TOO_LARGE', 'Image uploads must not exceed 5 MB.');
    }
    chunks.push(value);
  }
  const buffered = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buffered.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const formData = await new Response(buffered, {
    headers: { 'Content-Type': context.req.header('Content-Type') ?? '' },
  })
    .formData()
    .catch(() => undefined);
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
