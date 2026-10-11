import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../types/env';

/** Minimal API-specific headers; frontend CSP belongs at the Pages layer. */
export const securityHeaders: MiddlewareHandler<AppEnv> = async (context, next) => {
  context.header('X-Content-Type-Options', 'nosniff');
  context.header('Referrer-Policy', 'no-referrer');
  await next();
};
