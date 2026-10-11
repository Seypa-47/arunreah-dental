import { hashSessionToken } from './session.service';
import {
  clearLoginRateLimit,
  getLoginRateLimit,
  saveLoginRateLimit,
} from '../repositories/session.repository';
import type { DatabaseClient } from '../db/client';
import { HttpError } from '../shared/http-error';

const loginAttemptLimit = 5;
const ipLoginAttemptLimit = 20;
const loginWindowMilliseconds = 15 * 60 * 1000;
const loginLockoutMilliseconds = 15 * 60 * 1000;

type LoginRateLimitKey = {
  key: string;
  attemptLimit: number;
};

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function createLoginRateLimitKeys(
  email: string,
  clientIp: string,
): Promise<LoginRateLimitKey[]> {
  return [
    {
      key: await hashSessionToken(`login:credential:${normalizeAdminEmail(email)}:${clientIp}`),
      attemptLimit: loginAttemptLimit,
    },
    {
      key: await hashSessionToken(`login:ip:${clientIp}`),
      attemptLimit: ipLoginAttemptLimit,
    },
  ];
}

export async function assertLoginAllowed(
  database: DatabaseClient,
  keys: LoginRateLimitKey[],
): Promise<void> {
  const records = await Promise.all(keys.map(({ key }) => getLoginRateLimit(database, key)));
  if (
    records.some((record) => record?.lockedUntil && record.lockedUntil > new Date().toISOString())
  ) {
    throw new HttpError(429, 'RATE_LIMITED', 'Too many login attempts. Please try again later.');
  }
}

async function recordFailedLogin(
  database: DatabaseClient,
  { key, attemptLimit }: LoginRateLimitKey,
): Promise<boolean> {
  const now = new Date();
  const record = await saveLoginRateLimit(database, {
    key,
    attemptLimit,
    now: now.toISOString(),
    windowCutoff: new Date(now.getTime() - loginWindowMilliseconds).toISOString(),
    lockedUntil: new Date(now.getTime() + loginLockoutMilliseconds).toISOString(),
  });
  return Boolean(record?.lockedUntil && record.lockedUntil > now.toISOString());
}

export async function recordFailedLogins(database: DatabaseClient, keys: LoginRateLimitKey[]) {
  const locked = await Promise.all(keys.map((key) => recordFailedLogin(database, key)));
  if (locked.some(Boolean)) {
    throw new HttpError(429, 'RATE_LIMITED', 'Too many login attempts. Please try again later.');
  }
}

export async function clearFailedLogins(
  database: DatabaseClient,
  [credentialKey]: LoginRateLimitKey[],
) {
  if (credentialKey) await clearLoginRateLimit(database, credentialKey.key);
}

export function getClientIp(headers: Headers): string {
  const cloudflareIp = headers.get('CF-Connecting-IP');
  return cloudflareIp ?? 'unknown';
}
