import type {
  AdminPasswordResetInput,
  AdminPasswordResetRequestInput,
} from '@arunreah/shared';
import type { DatabaseClient } from '../db/client';
import { findAdminByEmail } from '../repositories/admin.repository';
import {
  consumePasswordResetToken,
  createPasswordResetToken,
  updateAdminPassword,
} from '../repositories/password-reset.repository';
import {
  getLoginRateLimit,
  revokeAllAdminSessions,
  saveLoginRateLimit,
} from '../repositories/session.repository';
import { HttpError } from '../shared/http-error';
import type { Bindings } from '../types/env';
import { getClientIp, normalizeAdminEmail } from './auth.service';
import { hashPassword } from './password.service';
import { sendAdminPasswordResetEmail } from './password-reset-email.service';
import { createSessionToken, hashSessionToken } from './session.service';
import { verifyTurnstile } from './turnstile.service';

const resetTokenLifetimeMs = 30 * 60 * 1000;
const rateLimitWindowMs = 15 * 60 * 1000;
const genericRequestMessage =
  'If an active administrator account matches that email, a reset link will be sent shortly.';

async function consumeRateLimit(
  database: DatabaseClient,
  key: string,
  attemptLimit: number,
) {
  const now = new Date();
  const existing = await getLoginRateLimit(database, key);
  if (existing?.lockedUntil && existing.lockedUntil > now.toISOString()) {
    throw new HttpError(429, 'RATE_LIMITED', 'Too many requests. Please try again later.');
  }
  const result = await saveLoginRateLimit(database, {
    key,
    attemptLimit,
    now: now.toISOString(),
    windowCutoff: new Date(now.getTime() - rateLimitWindowMs).toISOString(),
    lockedUntil: new Date(now.getTime() + rateLimitWindowMs).toISOString(),
  });
  if (result?.lockedUntil && result.lockedUntil > now.toISOString()) {
    throw new HttpError(429, 'RATE_LIMITED', 'Too many requests. Please try again later.');
  }
}

async function requestRateLimitKeys(email: string, clientIp: string) {
  return [
    { key: await hashSessionToken(`password-reset:email:${email}`), limit: 5 },
    { key: await hashSessionToken(`password-reset:ip:${clientIp}`), limit: 20 },
  ];
}

export async function requestAdminPasswordReset(
  database: DatabaseClient,
  input: AdminPasswordResetRequestInput,
  environment: Bindings,
  headers: Headers,
) {
  const email = normalizeAdminEmail(input.email);
  const clientIp = getClientIp(headers);
  const keys = await requestRateLimitKeys(email, clientIp);
  for (const { key, limit } of keys) await consumeRateLimit(database, key, limit);

  await verifyTurnstile(
    input.turnstileToken,
    environment.TURNSTILE_SECRET_KEY,
    environment.TURNSTILE_HOSTNAMES,
    clientIp,
    environment.APP_ENV,
    'admin_password_reset',
  );

  const admin = await findAdminByEmail(database, email);
  if (!admin?.isActive) return { message: genericRequestMessage };

  const token = createSessionToken();
  const now = new Date();
  await createPasswordResetToken(database, {
    adminId: admin.id,
    tokenHash: await hashSessionToken(token),
    expiresAt: new Date(now.getTime() + resetTokenLifetimeMs).toISOString(),
  });
  await sendAdminPasswordResetEmail(admin.email, token, environment);
  return { message: genericRequestMessage };
}

export async function resetAdminPassword(
  database: DatabaseClient,
  input: AdminPasswordResetInput,
  headers: Headers,
) {
  await consumeRateLimit(
    database,
    await hashSessionToken(`password-reset:consume:${getClientIp(headers)}`),
    20,
  );

  const passwordHash = await hashPassword(input.password);
  const now = new Date().toISOString();
  const consumed = await consumePasswordResetToken(
    database,
    await hashSessionToken(input.token),
    now,
  );
  if (!consumed) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'This reset link is invalid or has expired.');
  }

  const updated = await updateAdminPassword(database, consumed.adminId, passwordHash);
  if (!updated) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'This reset link is invalid or has expired.');
  }
  await revokeAllAdminSessions(database, consumed.adminId);
  return { reset: true };
}
