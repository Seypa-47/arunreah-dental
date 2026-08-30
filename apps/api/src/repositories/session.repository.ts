import { and, eq, gt, isNull } from 'drizzle-orm';
import { adminLoginRateLimits, adminSessions, admins } from '../db/schema';
import type { DatabaseClient } from '../db/client';

export async function createAdminSession(
  database: DatabaseClient,
  input: { id: string; adminId: string; tokenHash: string; expiresAt: string },
) {
  const now = new Date().toISOString();

  await database.insert(adminSessions).values({
    ...input,
    createdAt: now,
    updatedAt: now,
  });
}

export async function findAuthenticatedSession(
  database: DatabaseClient,
  tokenHash: string,
  now: string,
) {
  const [result] = await database
    .select({
      sessionId: adminSessions.id,
      adminId: admins.id,
      displayName: admins.displayName,
      email: admins.email,
      role: admins.role,
    })
    .from(adminSessions)
    .innerJoin(admins, eq(adminSessions.adminId, admins.id))
    .where(
      and(
        eq(adminSessions.tokenHash, tokenHash),
        isNull(adminSessions.revokedAt),
        gt(adminSessions.expiresAt, now),
        eq(admins.isActive, true),
      ),
    )
    .limit(1);

  return result;
}

export async function revokeAdminSession(database: DatabaseClient, sessionId: string) {
  const now = new Date().toISOString();

  await database
    .update(adminSessions)
    .set({ revokedAt: now, updatedAt: now })
    .where(eq(adminSessions.id, sessionId));
}

export async function getLoginRateLimit(database: DatabaseClient, key: string) {
  const [record] = await database
    .select()
    .from(adminLoginRateLimits)
    .where(eq(adminLoginRateLimits.key, key))
    .limit(1);

  return record;
}

export async function saveLoginRateLimit(
  database: DatabaseClient,
  input: {
    key: string;
    attempts: number;
    windowStartedAt: string;
    lockedUntil: string | null;
  },
) {
  const existing = await getLoginRateLimit(database, input.key);
  const now = new Date().toISOString();

  if (existing) {
    await database
      .update(adminLoginRateLimits)
      .set({ ...input, updatedAt: now })
      .where(eq(adminLoginRateLimits.key, input.key));
    return;
  }

  await database.insert(adminLoginRateLimits).values({
    ...input,
    createdAt: now,
    updatedAt: now,
  });
}

export async function clearLoginRateLimit(database: DatabaseClient, key: string) {
  await database.delete(adminLoginRateLimits).where(eq(adminLoginRateLimits.key, key));
}
