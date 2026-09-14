import type { MiddlewareHandler } from 'hono';
import { isAllowedOrigin } from '../config/env';
import { HttpError } from '../shared/http-error';
import type { AppEnv } from '../types/env';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Admin authentication is cookie-based. Production and staging mutations must
 * therefore originate from a configured frontend origin, in addition to the
 * session cookie's SameSite policy. Development remains permissive so local
 * command-line and test workflows do not need a browser Origin header.
 */
export const requireTrustedOrigin: MiddlewareHandler<AppEnv> = async (context, next) => {
  if (safeMethods.has(context.req.method) || context.env.APP_ENV === 'development') {
    await next();
    return;
  }

  const origin = context.req.header('Origin');
  if (!origin || !isAllowedOrigin(context.env, origin)) {
    throw new HttpError(403, 'FORBIDDEN', 'Request origin is not allowed.');
  }

  await next();
};
