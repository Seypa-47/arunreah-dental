import { adminLoginSchema, successResponse } from '@arunreah/shared';
import { Hono } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import { createDbClient } from '../../db/client';
import { requireAdmin } from '../../middleware/require-admin';
import { findAdminByEmail } from '../../repositories/admin.repository';
import { createAdminSession, revokeAdminSession } from '../../repositories/session.repository';
import { toAuthenticatedAdmin } from '../../shared/admin';
import { HttpError } from '../../shared/http-error';
import { parseRequestBody } from '../../shared/request';
import {
  assertLoginAllowed,
  clearFailedLogins,
  createLoginRateLimitKey,
  getClientIp,
  normalizeAdminEmail,
  recordFailedLogin,
} from '../../services/auth.service';
import { hashPassword, verifyPassword } from '../../services/password.service';
import {
  createSessionToken,
  getSessionCookieOptions,
  getSessionExpiry,
  hashSessionToken,
  sessionCookieName,
} from '../../services/session.service';
import type { AppEnv } from '../../types/env';

export const authModule = new Hono<AppEnv>();

authModule.post('/login', async (context) => {
  const input = await parseRequestBody(context, adminLoginSchema);
  const email = normalizeAdminEmail(input.email);
  const database = createDbClient(context.env.DB);
  const rateLimitKey = await createLoginRateLimitKey(email, getClientIp(context.req.raw.headers));

  await assertLoginAllowed(database, rateLimitKey);

  const admin = await findAdminByEmail(database, email);
  const passwordIsValid = admin
    ? await verifyPassword(input.password, admin.passwordHash)
    : await hashPassword(input.password).then(() => false);

  if (!admin || !admin.isActive || !passwordIsValid) {
    await recordFailedLogin(database, rateLimitKey);
    throw new HttpError(401, 'UNAUTHORIZED', 'Invalid email or password.');
  }

  await clearFailedLogins(database, rateLimitKey);

  const token = createSessionToken();
  await createAdminSession(database, {
    id: crypto.randomUUID(),
    adminId: admin.id,
    tokenHash: await hashSessionToken(token),
    expiresAt: getSessionExpiry(),
  });

  setCookie(context, sessionCookieName, token, getSessionCookieOptions(context.env));

  return context.json(successResponse({ admin: toAuthenticatedAdmin(admin) }));
});

authModule.post('/logout', requireAdmin, async (context) => {
  const database = createDbClient(context.env.DB);

  await revokeAdminSession(database, context.get('authenticatedSessionId'));
  deleteCookie(context, sessionCookieName, getSessionCookieOptions(context.env));

  return context.json(successResponse({ loggedOut: true }));
});

authModule.get('/me', requireAdmin, (context) => {
  return context.json(successResponse({ admin: context.get('authenticatedAdmin') }));
});
