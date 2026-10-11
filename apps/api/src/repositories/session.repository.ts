import { and, eq, gt, isNull, sql } from 'drizzle-orm';
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
    attemptLimit: number;
    now: string;
    windowCutoff: string;
    lockedUntil: string;
  },
) {
  return database.get<{ attempts: number; lockedUntil: string | null }>(sql`
    INSERT INTO admin_login_rate_limits
      (key, attempts, window_started_at, locked_until, created_at, updated_at)
    VALUES (${input.key}, 1, ${input.now}, NULL, ${input.now}, ${input.now})
    ON CONFLICT(key) DO UPDATE SET
      attempts = CASE WHEN window_started_at <= ${input.windowCutoff} THEN 1 ELSE attempts + 1 END,
      window_started_at = CASE WHEN window_started_at <= ${input.windowCutoff} THEN ${input.now} ELSE window_started_at END,
      locked_until = CASE
        WHEN (CASE WHEN window_started_at <= ${input.windowCutoff} THEN 1 ELSE attempts + 1 END) >= ${input.attemptLimit}
          THEN ${input.lockedUntil}
        ELSE NULL
      END,
      updated_at = ${input.now}
    RETURNING attempts, locked_until AS lockedUntil
  `);
}

export async function clearLoginRateLimit(database: DatabaseClient, key: string) {
  await database.delete(adminLoginRateLimits).where(eq(adminLoginRateLimits.key, key));
}

export async function cleanupExpiredAuthenticationRecords(
  database: DatabaseClient,
  input: {
    now: string;
    inactiveRateLimitCutoff: string;
    revokedSessionCutoff: string;
    limit: number;
  },
) {
  const deletedSessions = await database.run(sql`
    DELETE FROM admin_sessions
    WHERE rowid IN (
      SELECT rowid FROM admin_sessions
      WHERE expires_at <= ${input.now}
        OR (revoked_at IS NOT NULL AND revoked_at <= ${input.revokedSessionCutoff})
      ORDER BY expires_at ASC
      LIMIT ${input.limit}
    )
  `);
  const deletedRateLimits = await database.run(sql`
    DELETE FROM admin_login_rate_limits
    WHERE rowid IN (
      SELECT rowid FROM admin_login_rate_limits
      WHERE updated_at <= ${input.inactiveRateLimitCutoff}
        AND (locked_until IS NULL OR locked_until <= ${input.now})
      ORDER BY updated_at ASC
      LIMIT ${input.limit}
    )
  `);

  return { deletedRateLimits, deletedSessions };
}
