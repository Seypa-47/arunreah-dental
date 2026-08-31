import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedAdmin } from '../src/types/auth';
import type { Bindings } from '../src/types/env';

const state = vi.hoisted(() => ({
  sessions: new Map<
    string,
    {
      sessionId: string;
      adminId: string;
      displayName: string;
      email: string;
      role: AuthenticatedAdmin['role'];
    }
  >(),
  referenced: false,
  failPut: false,
  failDelete: false,
  objects: new Map<
    string,
    { body: ReadableStream<Uint8Array>; contentType?: string; cacheControl?: string }
  >(),
}));

vi.mock('../src/db/client', () => ({ createDbClient: () => ({}) }));
vi.mock('../src/repositories/media.repository', () => ({
  isMediaKeyReferenced: async () => state.referenced,
}));
vi.mock('../src/repositories/session.repository', () => ({
  findAuthenticatedSession: async (_database: unknown, tokenHash: string) =>
    state.sessions.get(tokenHash),
  createAdminSession: async () => undefined,
  revokeAdminSession: async () => undefined,
  getLoginRateLimit: async () => undefined,
  saveLoginRateLimit: async () => undefined,
  clearLoginRateLimit: async () => undefined,
}));

const { app } = await import('../src/app');
const { hashSessionToken } = await import('../src/services/session.service');
const bindings = {
  APP_ENV: 'development',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  MEDIA_PUBLIC_BASE_URL: 'https://media.example.com',
  DB: {} as D1Database,
  ASSETS: {
    put: async (key: string, body: ReadableStream<Uint8Array>, options: R2PutOptions) => {
      if (state.failPut) throw new Error('R2 unavailable');
      const metadata = options.httpMetadata;
      state.objects.set(key, {
        body,
        contentType: metadata && 'contentType' in metadata ? metadata.contentType : undefined,
        cacheControl: metadata && 'cacheControl' in metadata ? metadata.cacheControl : undefined,
      });
      return null;
    },
    head: async (key: string) => (state.objects.has(key) ? ({} as R2Object) : null),
    delete: async (key: string) => {
      if (state.failDelete) throw new Error('R2 unavailable');
      state.objects.delete(key);
    },
  } as unknown as R2Bucket,
} satisfies Bindings;

async function headers(role: AuthenticatedAdmin['role']) {
  const token = `media-${role}`;
  state.sessions.set(await hashSessionToken(token), {
    sessionId: `${role}-session`,
    adminId: `${role}-admin`,
    displayName: `${role} Admin`,
    email: `${role}@example.com`,
    role,
  });
  return { Cookie: `arunreah_admin_session=${token}` };
}

function jpegFile(name = 'Dr Profile!!.jpg') {
  return new File([new Uint8Array([0xff, 0xd8, 0xff, 0x00])], name, { type: 'image/jpeg' });
}

async function upload(role: AuthenticatedAdmin['role'], file: File, category = 'doctors') {
  const form = new FormData();
  form.set('category', category);
  form.set('file', file);
  return app.request(
    new Request('http://localhost/api/admin/media', {
      method: 'POST',
      headers: await headers(role),
      body: form,
    }),
    undefined,
    bindings,
  );
}

beforeEach(() => {
  state.sessions.clear();
  state.objects.clear();
  state.referenced = false;
  state.failPut = false;
  state.failDelete = false;
});

describe('media API routes', () => {
  it('requires CMS authentication and permits CMS roles only', async () => {
    const unauthenticated = await app.request(
      new Request('http://localhost/api/admin/media', { method: 'POST', body: new FormData() }),
      undefined,
      bindings,
    );
    expect(unauthenticated.status).toBe(401);
    expect((await upload('RECEPTIONIST', jpegFile())).status).toBe(403);
    expect((await upload('CMS_ADMIN', jpegFile())).status).toBe(201);
    expect((await upload('SUPER_ADMIN', jpegFile())).status).toBe(201);

    const unauthenticatedDelete = await app.request(
      new Request('http://localhost/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'doctors/550e8400-e29b-41d4-a716-446655440000-profile.jpg' }),
      }),
      undefined,
      bindings,
    );
    expect(unauthenticatedDelete.status).toBe(401);

    const receptionistDelete = await app.request(
      new Request('http://localhost/api/admin/media', {
        method: 'DELETE',
        headers: { ...(await headers('RECEPTIONIST')), 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'doctors/550e8400-e29b-41d4-a716-446655440000-profile.jpg' }),
      }),
      undefined,
      bindings,
    );
    expect(receptionistDelete.status).toBe(403);
  });

  it('validates image types, magic bytes, size, and categories', async () => {
    const missingFile = new FormData();
    missingFile.set('category', 'doctors');
    expect(
      (
        await app.request(
          new Request('http://localhost/api/admin/media', {
            method: 'POST',
            headers: await headers('CMS_ADMIN'),
            body: missingFile,
          }),
          undefined,
          bindings,
        )
      ).status,
    ).toBe(400);
    expect(
      (await upload('CMS_ADMIN', new File(['not an image'], 'bad.png', { type: 'image/png' })))
        .status,
    ).toBe(400);
    expect((await upload('CMS_ADMIN', jpegFile(), '../../private')).status).toBe(400);
    expect(
      (
        await upload(
          'CMS_ADMIN',
          new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.jpg', { type: 'image/jpeg' }),
        )
      ).status,
    ).toBe(400);
    expect(
      (await upload('CMS_ADMIN', new File(['x'], 'file.svg', { type: 'image/svg+xml' }))).status,
    ).toBe(400);
  });

  it('stores valid JPEG, PNG, and WEBP images using safe unique keys', async () => {
    const png = new File(
      [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
      'clinic logo.png',
      { type: 'image/png' },
    );
    const webp = new File(
      [new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])],
      'hero.webp',
      { type: 'image/webp' },
    );

    const jpegResponse = await upload('CMS_ADMIN', jpegFile());
    const jpeg = await jpegResponse.json<{
      data: { key: string; url: string; mimeType: string; size: number };
    }>();
    expect(jpegResponse.status).toBe(201);
    expect(jpeg.data).toMatchObject({
      key: expect.stringMatching(/^doctors\/[0-9a-f-]+-dr-profile\.jpg$/),
      url: expect.stringMatching(/^https:\/\/media\.example\.com\/doctors\//),
      mimeType: 'image/jpeg',
      size: 4,
    });
    expect((await upload('CMS_ADMIN', png, 'clinic')).status).toBe(201);
    expect((await upload('CMS_ADMIN', webp, 'services')).status).toBe(201);
    expect(state.objects.size).toBe(3);
  });

  it('only deletes orphaned managed keys', async () => {
    const created = await upload('CMS_ADMIN', jpegFile());
    const { data } = await created.json<{ data: { key: string } }>();
    const deleteHeaders = { ...(await headers('CMS_ADMIN')), 'Content-Type': 'application/json' };

    state.referenced = true;
    const inUse = await app.request(
      new Request('http://localhost/api/admin/media', {
        method: 'DELETE',
        headers: deleteHeaders,
        body: JSON.stringify({ key: data.key }),
      }),
      undefined,
      bindings,
    );
    expect(inUse.status).toBe(409);

    state.referenced = false;
    const removed = await app.request(
      new Request('http://localhost/api/admin/media', {
        method: 'DELETE',
        headers: deleteHeaders,
        body: JSON.stringify({ key: data.key }),
      }),
      undefined,
      bindings,
    );
    expect(removed.status).toBe(200);
    expect(state.objects.has(data.key)).toBe(false);
    expect(
      (
        await app.request(
          new Request('http://localhost/api/admin/media', {
            method: 'DELETE',
            headers: deleteHeaders,
            body: JSON.stringify({ key: data.key }),
          }),
          undefined,
          bindings,
        )
      ).status,
    ).toBe(404);
  });

  it('does not report R2 failures as successful operations', async () => {
    state.failPut = true;
    expect((await upload('CMS_ADMIN', jpegFile())).status).toBe(500);

    state.failPut = false;
    const created = await upload('CMS_ADMIN', jpegFile());
    const { data } = await created.json<{ data: { key: string } }>();
    state.failDelete = true;
    const failedDelete = await app.request(
      new Request('http://localhost/api/admin/media', {
        method: 'DELETE',
        headers: { ...(await headers('CMS_ADMIN')), 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: data.key }),
      }),
      undefined,
      bindings,
    );
    expect(failedDelete.status).toBe(500);
  });
});
