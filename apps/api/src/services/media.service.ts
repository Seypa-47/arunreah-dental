import type { MediaCategory } from '@arunreah/shared';
import { mediaCategoryValues } from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import { isMediaKeyReferenced } from '../repositories/media.repository';
import { HttpError } from '../shared/http-error';

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

const imageFormats = {
  'image/jpeg': {
    extension: 'jpg',
    signature: (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  'image/png': {
    extension: 'png',
    signature: (bytes: Uint8Array) =>
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
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50,
  },
} as const;

type ImageMimeType = keyof typeof imageFormats;

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

export async function validateImageFile(file: File) {
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new HttpError(400, 'MEDIA_TOO_LARGE', 'Image uploads must not exceed 5 MB.');
  }

  if (!isImageMimeType(file.type)) {
    throw new HttpError(400, 'INVALID_MEDIA_TYPE', 'Only JPEG, PNG, and WEBP images are allowed.');
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!imageFormats[file.type].signature(bytes)) {
    throw new HttpError(
      400,
      'INVALID_MEDIA_TYPE',
      'The image file does not match its declared type.',
    );
  }

  return file.type;
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
  if (await isMediaKeyReferenced(database, key)) {
    throw new HttpError(
      409,
      'MEDIA_IN_USE',
      'This image is currently used by website content and cannot be deleted.',
    );
  }

  try {
    const object = await bucket.head(key);
    if (!object) throw new HttpError(404, 'MEDIA_NOT_FOUND', 'The requested media was not found.');
    await bucket.delete(key);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('R2 media deletion failed', { key });
    throw new HttpError(500, 'INTERNAL_ERROR', 'The image could not be deleted.');
  }
}
