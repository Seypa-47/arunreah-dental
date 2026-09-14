import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../types/env';

/** Applies a safe default to authenticated and session-bearing API responses. */
export const privateResponse: MiddlewareHandler<AppEnv> = async (context, next) => {
  context.header('Cache-Control', 'private, no-store');
  await next();
};
