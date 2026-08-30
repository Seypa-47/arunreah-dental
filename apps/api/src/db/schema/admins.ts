import { sql } from 'drizzle-orm';
import { adminRoleValues } from '@arunreah/shared';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { timestamps } from './common';

export const admins = sqliteTable(
  'admins',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    displayName: text('display_name').notNull(),
    role: text('role', { enum: adminRoleValues }).notNull().default('RECEPTIONIST'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('admins_email_unique').on(table.email),
    index('admins_role_active_idx').on(table.role, table.isActive),
    check('admins_role_check', sql`role in ('RECEPTIONIST', 'CMS_ADMIN', 'SUPER_ADMIN')`),
  ],
);

export const adminLoginRateLimits = sqliteTable(
  'admin_login_rate_limits',
  {
    key: text('key').primaryKey(),
    attempts: integer('attempts').notNull().default(0),
    windowStartedAt: text('window_started_at').notNull(),
    lockedUntil: text('locked_until'),
    ...timestamps(),
  },
  (table) => [index('admin_login_rate_limits_locked_until_idx').on(table.lockedUntil)],
);

export const adminSessions = sqliteTable(
  'admin_sessions',
  {
    id: text('id').primaryKey(),
    adminId: text('admin_id')
      .notNull()
      .references(() => admins.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: text('expires_at').notNull(),
    lastSeenAt: text('last_seen_at'),
    revokedAt: text('revoked_at'),
    ...timestamps(),
  },
  (table) => [
    index('admin_sessions_admin_id_idx').on(table.adminId),
    index('admin_sessions_expires_at_idx').on(table.expiresAt),
    uniqueIndex('admin_sessions_token_hash_unique').on(table.tokenHash),
  ],
);
