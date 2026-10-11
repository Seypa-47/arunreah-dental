import { getCookie } from 'hono/cookie';
import type { MiddlewareHandler } from 'hono';
import { createDbClient } from '../db/client';
import { findAuthenticatedSession } from '../repositories/session.repository';
import { HttpError } from '../shared/http-error';
import { toAuthenticatedAdmin } from '../shared/admin';
import { hashSessionToken, sessionCookieName } from '../services/session.service';
import type { AppEnv } from '../types/env';

export const requireAdmin: MiddlewareHandler<AppEnv> = async (context, next) => {
  const token = getCookie(context, sessionCookieName);

  if (!token) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Authentication is required.');
  }

  const database = createDbClient(context.env.DB);
  const session = await findAuthenticatedSession(
    database,
    await hashSessionToken(token),
    new Date().toISOString(),
  );

  if (!session) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Authentication is required.');
  }

  context.set('authenticatedAdmin', toAuthenticatedAdmin({ ...session, id: session.adminId }));
  context.set('authenticatedSessionId', session.sessionId);

  await next();
};
