import { errorResponse, successResponse } from '@arunreah/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../../types/env';

export const healthModule = new Hono<AppEnv>();

healthModule.get('/', (context) => {
  return context.json(
    successResponse({
      service: 'arunreah-api',
      status: 'ok',
    }),
  );
});

function hasEssentialBindings(environment: AppEnv['Bindings']) {
  if (!environment.DB || typeof environment.DB.prepare !== 'function') return false;
  if (!environment.ASSETS) return false;
  if (!['development', 'staging', 'production'].includes(environment.APP_ENV)) return false;
  if (!environment.CORS_ALLOWED_ORIGINS?.trim()) return false;
  if (environment.APP_ENV === 'production') {
    try {
      return new URL(environment.MEDIA_PUBLIC_BASE_URL ?? '').protocol === 'https:';
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Public but deliberately detail-free: load balancers can probe readiness,
 * while clients learn only whether the service can accept traffic.
 */
healthModule.get('/ready', async (context) => {
  if (!hasEssentialBindings(context.env)) {
    return context.json(
      errorResponse('SERVICE_UNAVAILABLE', 'The service is not ready.'),
      503,
    );
  }

  try {
    const result = await context.env.DB.prepare('SELECT 1 AS ready').first<{ ready: number }>();
    if (result?.ready !== 1) throw new Error('Readiness query did not return the expected value.');
  } catch {
    return context.json(
      errorResponse('SERVICE_UNAVAILABLE', 'The service is not ready.'),
      503,
    );
  }

  return context.json(successResponse({ service: 'arunreah-api', status: 'ready' }));
});
