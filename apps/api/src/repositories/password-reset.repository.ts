import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import { adminPasswordResetTokens, admins } from '../db/schema';
import type { DatabaseClient } from '../db/client';

export async function createPasswordResetToken(
  database: DatabaseClient,
  input: { adminId: string; tokenHash: string; expiresAt: string },
) {
  const now = new Date().toISOString();
  await database
    .update(adminPasswordResetTokens)
    .set({ usedAt: now, updatedAt: now })
    .where(
      and(
        eq(adminPasswordResetTokens.adminId, input.adminId),
        isNull(adminPasswordResetTokens.usedAt),
      ),
    );
  await database.insert(adminPasswordResetTokens).values({
    id: crypto.randomUUID(),
    adminId: input.adminId,
    tokenHash: input.tokenHash,
    expiresAt: input.expiresAt,
    createdAt: now,
    updatedAt: now,
  });
}

export async function consumePasswordResetToken(
  database: DatabaseClient,
  tokenHash: string,
  now: string,
) {
  const [consumed] = await database
    .update(adminPasswordResetTokens)
    .set({ usedAt: now, updatedAt: now })
    .where(
      and(
        eq(adminPasswordResetTokens.tokenHash, tokenHash),
        isNull(adminPasswordResetTokens.usedAt),
        gt(adminPasswordResetTokens.expiresAt, now),
      ),
    )
    .returning({ adminId: adminPasswordResetTokens.adminId });
  return consumed;
}

export async function updateAdminPassword(
  database: DatabaseClient,
  adminId: string,
  passwordHash: string,
) {
  const [updated] = await database
    .update(admins)
    .set({ passwordHash, updatedAt: new Date().toISOString() })
    .where(and(eq(admins.id, adminId), eq(admins.isActive, true)))
    .returning({ id: admins.id });
  return updated;
}

export async function cleanupExpiredPasswordResetTokens(
  database: DatabaseClient,
  now: string,
  usedCutoff: string,
  limit: number,
) {
  return database.run(sql`
    DELETE FROM admin_password_reset_tokens
    WHERE rowid IN (
      SELECT rowid FROM admin_password_reset_tokens
      WHERE expires_at <= ${now}
        OR (used_at IS NOT NULL AND used_at <= ${usedCutoff})
      ORDER BY expires_at ASC
      LIMIT ${limit}
    )
  `);
}
