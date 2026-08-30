import { hashSessionToken } from './session.service';
import {
  clearLoginRateLimit,
  getLoginRateLimit,
  saveLoginRateLimit,
} from '../repositories/session.repository';
import type { DatabaseClient } from '../db/client';
import { HttpError } from '../shared/http-error';

const loginAttemptLimit = 5;
const loginWindowMilliseconds = 15 * 60 * 1000;
const loginLockoutMilliseconds = 15 * 60 * 1000;

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function createLoginRateLimitKey(email: string, clientIp: string): Promise<string> {
  return hashSessionToken(`${normalizeAdminEmail(email)}:${clientIp}`);
}

export async function assertLoginAllowed(database: DatabaseClient, key: string): Promise<void> {
  const record = await getLoginRateLimit(database, key);

  if (record?.lockedUntil && record.lockedUntil > new Date().toISOString()) {
    throw new HttpError(429, 'RATE_LIMITED', 'Too many login attempts. Please try again later.');
  }
}

export async function recordFailedLogin(database: DatabaseClient, key: string): Promise<void> {
  const now = new Date();
  const current = await getLoginRateLimit(database, key);
  const windowStartedAt = current ? new Date(current.windowStartedAt) : now;
  const withinWindow = now.getTime() - windowStartedAt.getTime() < loginWindowMilliseconds;
  const attempts = withinWindow ? (current?.attempts ?? 0) + 1 : 1;
  const lockedUntil =
    attempts >= loginAttemptLimit
      ? new Date(now.getTime() + loginLockoutMilliseconds).toISOString()
      : null;

  await saveLoginRateLimit(database, {
    key,
    attempts,
    windowStartedAt: withinWindow ? windowStartedAt.toISOString() : now.toISOString(),
    lockedUntil,
  });
}

export async function clearFailedLogins(database: DatabaseClient, key: string): Promise<void> {
  await clearLoginRateLimit(database, key);
}

export function getClientIp(headers: Headers): string {
  const cloudflareIp = headers.get('CF-Connecting-IP');
  const forwardedFor = headers.get('X-Forwarded-For')?.split(',')[0]?.trim();

  return cloudflareIp ?? forwardedFor ?? 'unknown';
}
