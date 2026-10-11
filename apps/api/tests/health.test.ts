import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import type { Bindings } from '../src/types/env';

const testBindings = {
  APP_ENV: 'development',
  CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
  DB: {
    prepare: () => ({
      first: async () => ({ ready: 1 }),
    }),
  } as unknown as D1Database,
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

  it('reports readiness only after checking essential bindings and D1', async () => {
    const response = await app.request(
      'http://localhost/api/health/ready',
      undefined,
      testBindings,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { service: 'arunreah-api', status: 'ready' },
    });
  });

  it('returns a generic 503 when readiness configuration is missing', async () => {
    const response = await app.request('http://localhost/api/health/ready', undefined, {
      ...testBindings,
      DB: undefined as unknown as D1Database,
    });

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'The service is not ready.' },
    });
  });

  it('returns the same generic 503 when D1 is unavailable', async () => {
    const response = await app.request('http://localhost/api/health/ready', undefined, {
      ...testBindings,
      DB: {
        prepare: () => ({ first: async () => Promise.reject(new Error('provider detail')) }),
      } as unknown as D1Database,
    });

    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain('provider detail');
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
