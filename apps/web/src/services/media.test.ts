import { describe, expect, it } from 'vitest';
import type { ApiClient } from '@/lib/api';
import { uploadMedia } from './media';

describe('media API service', () => {
  it('uploads an approved category as authenticated multipart data without forcing a content type', async () => {
    let options: unknown;
    const client = { post: async <T>(_path: string, request?: unknown) => { options = request; return { key: 'doctors/550e8400-e29b-41d4-a716-446655440000-profile.webp', mimeType: 'image/webp', size: 1, url: null } as T; } } satisfies Pick<ApiClient, 'post'>;
    await uploadMedia('doctors', new File(['x'], 'profile.webp', { type: 'image/webp' }), client);
    expect(options).toMatchObject({ authenticated: true });
    expect((options as { body: FormData }).body).toBeInstanceOf(FormData);
    expect((options as { body: FormData }).body.get('category')).toBe('doctors');
  });
});
