import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import type { Bindings } from '../src/types/env';

const testBindings = {
  APP_ENV: 'development',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  DB: {} as D1Database,
  ASSETS: {} as R2Bucket,
} satisfies Bindings;

describe('GET /api/health', () => {
  it('returns the infrastructure health response', async () => {
    const response = await app.request('http://localhost/api/health', undefined, testBindings);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        service: 'arunreah-api',
        status: 'ok',
      },
    });
  });

  it('allows the configured development origin', async () => {
    const response = await app.request(
      'http://localhost/api/health',
      { headers: { Origin: 'http://localhost:5173' } },
      testBindings,
    );

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173');
  });

  it('returns the standard error shape for an unknown route', async () => {
    const response = await app.request('http://localhost/api/unknown', undefined, testBindings);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
      },
    });
  });
});
