import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import type { Bindings } from '../src/types/env';

describe('GET /health', () => {
  it('returns the infrastructure health response', async () => {
    const response = await app.request('http://localhost/health', undefined, {
      APP_ENV: 'development',
      CORS_ALLOWED_ORIGIN: 'http://localhost:5173',
      DB: {} as D1Database,
      ASSETS: {} as R2Bucket,
    } satisfies Bindings);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: {
        service: 'arunreah-api',
        status: 'ok',
      },
    });
  });
});
