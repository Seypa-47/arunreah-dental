import type { MediaCategory } from '@arunreah/shared';
import { getApiClient, type ApiClient } from '@/lib/api';

export type UploadedMedia = { key: string; mimeType: 'image/jpeg' | 'image/png' | 'image/webp'; size: number; url: string | null };

/**
 * CMS records persist an R2 object key, not a browser URL. A deployment can opt
 * into image previews by setting the public, non-secret media base URL.
 */
export function getPublicMediaUrl(key: string | null | undefined): string | undefined {
  if (!key) return undefined;
  if (/^https?:\/\//i.test(key)) return key;
  const baseUrl = import.meta.env.VITE_MEDIA_PUBLIC_BASE_URL?.replace(/\/+$/, '');
  return baseUrl ? `${baseUrl}/${key.replace(/^\/+/, '')}` : undefined;
}

export async function uploadMedia(
  category: MediaCategory,
  file: File,
  client: Pick<ApiClient, 'post'> = getApiClient(),
): Promise<UploadedMedia> {
  const form = new FormData();
  form.set('category', category);
  form.set('file', file);
  // Uploads can legitimately take longer than regular JSON API requests on a
  // slow connection, so use an explicit longer limit than the shared 15s one.
  return client.post<UploadedMedia>('/api/admin/media', {
    authenticated: true,
    body: form,
    signal: AbortSignal.timeout(60_000),
  });
}

export async function deleteMedia(key: string, client: Pick<ApiClient, 'delete'> = getApiClient()): Promise<void> {
  await client.delete<{ deleted: boolean }>('/api/admin/media', { authenticated: true, json: { key } });
}

/**
 * Safe R2 object key extractor for CMS payloads.
 * Strips full public URLs, protocol/origin prefixes, and rejects local/dummy asset paths,
 * ensuring values sent to the API strictly match optionalMediaKeySchema.
 */
export function toMediaKey(value?: string | null): string | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('/') || trimmed.startsWith('.')) return null;
  const match = trimmed.match(
    /(?:^|https?:\/\/[^/]+\/)(clinic|branches|services|doctors|showcases)\/((?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*[a-z0-9]+(?:-[a-z0-9]+)*\.(?:jpg|png|webp))(?=[?#]|$)/i,
  );
  if (!match) return null;
  const category = match[1];
  const relativePath = match[2];
  if (!category || !relativePath) return null;
  return `${category.toLowerCase()}/${relativePath.toLowerCase()}`;
}
