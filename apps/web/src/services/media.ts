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
  return client.post<UploadedMedia>('/api/admin/media', { authenticated: true, body: form });
}

export async function deleteMedia(key: string, client: Pick<ApiClient, 'delete'> = getApiClient()): Promise<void> {
  await client.delete<{ deleted: boolean }>('/api/admin/media', { authenticated: true, json: { key } });
}
