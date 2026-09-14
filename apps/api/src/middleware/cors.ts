import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';
import { getAllowedOrigins } from '../config/env';
import type { AppEnv } from '../types/env';

export const corsMiddleware: MiddlewareHandler<AppEnv> = async (context, next) => {
  const allowedOrigins = new Set(getAllowedOrigins(context.env));

  return cors({
    origin: (origin) => (allowedOrigins.has(origin) ? origin : undefined),
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Request-Id'],
  })(context, next);
};
