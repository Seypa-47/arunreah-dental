import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyTurnstile } from '../src/services/turnstile.service';

afterEach(() => vi.unstubAllGlobals());

describe('Turnstile verification', () => {
  it('allows local development without a configured secret', async () => {
    await expect(
      verifyTurnstile(undefined, undefined, '127.0.0.1', 'development'),
    ).resolves.toBeUndefined();
  });

  it('fails closed when production configuration or tokens are missing', async () => {
    await expect(
      verifyTurnstile(undefined, undefined, '127.0.0.1', 'production'),
    ).rejects.toMatchObject({ status: 500 });
    await expect(
      verifyTurnstile(undefined, 'secret', '127.0.0.1', 'production'),
    ).rejects.toMatchObject({ status: 400, code: 'TURNSTILE_FAILED' });
  });

  it('accepts only a successful server-side Turnstile response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    vi.stubGlobal('fetch', fetchMock);
    await expect(
      verifyTurnstile('valid-token', 'secret', '127.0.0.1', 'production'),
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({ method: 'POST' }),
    );

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false }), { status: 200 })),
    );
    await expect(
      verifyTurnstile('invalid-token', 'secret', '127.0.0.1', 'production'),
    ).rejects.toMatchObject({
      status: 400,
      code: 'TURNSTILE_FAILED',
    });
  });
});
