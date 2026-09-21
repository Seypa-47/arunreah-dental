import type { MediaCategory } from '@arunreah/shared';
import { mediaCategoryValues } from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import {
  createMediaDeletionLock,
  isMediaKeyReferenced,
  removeMediaDeletionLock,
} from '../repositories/media.repository';
import { inTransaction } from '../db/transaction';
import { HttpError } from '../shared/http-error';

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;
/** Allows multipart boundaries and the small category field without accepting large bodies. */
export const MAX_MEDIA_MULTIPART_BYTES = MAX_IMAGE_UPLOAD_BYTES + 64 * 1024;

const imageFormats = {
  'image/jpeg': {
    extension: 'jpg',
    signature: (bytes: Uint8Array) => bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8,
  },
  'image/png': {
    extension: 'png',
    signature: (bytes: Uint8Array) =>
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a,
  },
  'image/webp': {
    extension: 'webp',
    signature: (bytes: Uint8Array) =>
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50,
  },
  'image/avif': {
    extension: 'avif',
    signature: (bytes: Uint8Array) =>
      bytes.length >= 12 &&
      bytes[4] === 0x66 &&
      bytes[5] === 0x74 &&
      bytes[6] === 0x79 &&
      bytes[7] === 0x70 &&
      bytes[8] === 0x61 &&
      bytes[9] === 0x76 &&
      bytes[10] === 0x69 &&
      (bytes[11] === 0x66 || bytes[11] === 0x73),
  },
  'image/gif': {
    extension: 'gif',
    signature: (bytes: Uint8Array) =>
      bytes.length >= 6 &&
      bytes[0] === 0x47 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x38 &&
      (bytes[4] === 0x37 || bytes[4] === 0x39) &&
      bytes[5] === 0x61,
  },
} as const;

export type ImageMimeType = keyof typeof imageFormats;

export function detectImageMimeType(bytes: Uint8Array): ImageMimeType | null {
  for (const [mimeType, format] of Object.entries(imageFormats)) {
    if (format.signature(bytes)) {
      return mimeType as ImageMimeType;
    }
  }
  return null;
}

export type UploadedMedia = {
  key: string;
  url: string | null;
  mimeType: ImageMimeType;
  size: number;
};

function isImageMimeType(value: string): value is ImageMimeType {
  return Object.hasOwn(imageFormats, value);
}

function sanitizeFilename(name: string) {
  const withoutExtension = name.replace(/\.[^.]*$/, '');
  const normalized = withoutExtension
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return normalized || 'image';
}

export function createMediaObjectKey(
  category: MediaCategory,
  filename: string,
  mimeType: ImageMimeType,
) {
  return `${category}/${crypto.randomUUID()}-${sanitizeFilename(filename)}.${imageFormats[mimeType].extension}`;
}

export async function validateImageFile(file: File): Promise<ImageMimeType> {
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new HttpError(400, 'MEDIA_TOO_LARGE', 'Image uploads must not exceed 5 MB.');
  }

  const bytes = new Uint8Array(await file.slice(0, 24).arrayBuffer());

  // 1. Sniff actual magic bytes to reliably determine real image type
  const detectedType = detectImageMimeType(bytes);
  if (detectedType) {
    return detectedType;
  }

  // 2. If declared type matches and signature passes
  if (isImageMimeType(file.type) && imageFormats[file.type].signature(bytes)) {
    return file.type;
  }

  throw new HttpError(
    400,
    'INVALID_MEDIA_TYPE',
    'Only JPEG, PNG, WEBP, and AVIF images are allowed.',
  );
}

function isMediaCategory(value: string): value is MediaCategory {
  return (mediaCategoryValues as readonly string[]).includes(value);
}

export function validateMediaCategory(value: string) {
  if (!isMediaCategory(value)) {
    throw new HttpError(400, 'INVALID_MEDIA_CATEGORY', 'The media category is not allowed.');
  }
  return value;
}

function publicUrl(baseUrl: string, key: string) {
  return baseUrl ? `${baseUrl}/${key}` : null;
}

export async function uploadImage(
  bucket: R2Bucket,
  category: MediaCategory,
  file: File,
  publicBaseUrl: string,
): Promise<UploadedMedia> {
  const mimeType = await validateImageFile(file);
  const key = createMediaObjectKey(category, file.name, mimeType);

  try {
    await bucket.put(key, file.stream(), {
      httpMetadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    console.error('R2 media upload failed', { category, mimeType, size: file.size });
    throw new HttpError(500, 'MEDIA_UPLOAD_FAILED', 'The image could not be uploaded.');
  }

  return { key, url: publicUrl(publicBaseUrl, key), mimeType, size: file.size };
}

export async function deleteOrphanedMedia(database: DatabaseClient, bucket: R2Bucket, key: string) {
  await inTransaction(database, async (transaction) => {
    if (await isMediaKeyReferenced(transaction, key)) {
      throw new HttpError(409, 'MEDIA_IN_USE', 'This image is currently used by website content and cannot be deleted.');
    }
    await createMediaDeletionLock(transaction, key);
  });

  try {
    const object = await bucket.head(key);
    if (!object) throw new HttpError(404, 'MEDIA_NOT_FOUND', 'The requested media was not found.');
    await bucket.delete(key);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('R2 media deletion failed', { key });
    throw new HttpError(500, 'INTERNAL_ERROR', 'The image could not be deleted.');
  } finally {
    await removeMediaDeletionLock(database, key);
  }
}
