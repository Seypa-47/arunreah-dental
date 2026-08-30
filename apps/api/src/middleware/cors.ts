import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';
import { getRuntimeConfig } from '../config/env';
import type { AppEnv } from '../types/env';

export const corsMiddleware: MiddlewareHandler<AppEnv> = async (context, next) => {
  const { corsAllowedOrigins } = getRuntimeConfig(context.env);
  const allowedOrigins = new Set(corsAllowedOrigins);

  return cors({
    origin: (origin) => (allowedOrigins.has(origin) ? origin : undefined),
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Request-Id'],
  })(context, next);
};
