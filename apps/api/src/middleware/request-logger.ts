import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../types/env';

export const requestLogger: MiddlewareHandler<AppEnv> = async (context, next) => {
  const requestId = crypto.randomUUID();
  const requestStartedAt = Date.now();

  context.set('requestId', requestId);
  context.set('requestStartedAt', requestStartedAt);
  context.header('X-Request-Id', requestId);

  await next();

  console.info('API request completed', {
    requestId,
    method: context.req.method,
    path: context.req.path,
    status: context.res.status,
    durationMs: Date.now() - requestStartedAt,
  });
};
