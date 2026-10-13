import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendAdminPasswordResetEmail } from '../src/services/password-reset-email.service';
import type { Bindings } from '../src/types/env';

const bindings = {
  APP_ENV: 'production',
  CORS_ALLOWED_ORIGINS: 'https://arunreahdental.com',
  ADMIN_APP_BASE_URL: 'https://arunreahdental.com',
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
  EMAIL_FROM_ADDRESS: 'Arunreah Dental Clinic <appointments@send.arunreahdental.com>',
  RESEND_API_KEY: 'resend-secret',
} satisfies Bindings;

afterEach(() => vi.unstubAllGlobals());

describe('admin password reset email', () => {
  it('sends text and HTML with the expiring reset URL through Resend', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      sendAdminPasswordResetEmail('owner@example.com', 'safe-reset-token', bindings),
    ).resolves.toBe(true);

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(request.body)) as Record<string, unknown>;
    expect(body).toMatchObject({
      from: bindings.EMAIL_FROM_ADDRESS,
      to: ['owner@example.com'],
      subject: 'Reset your Arunreah Dental CMS password',
    });
    expect(body.text).toContain(
      'https://arunreahdental.com/admin/reset-password?token=safe-reset-token',
    );
    expect(body.html).toContain('safe-reset-token');
  });

  it('fails closed without sending when required configuration is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      sendAdminPasswordResetEmail('owner@example.com', 'safe-reset-token', {
        ...bindings,
        RESEND_API_KEY: undefined,
      }),
    ).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
