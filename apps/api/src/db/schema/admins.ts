import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { timestamps } from './common';

export const admins = sqliteTable(
  'admins',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    displayName: text('display_name').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    ...timestamps(),
  },
  (table) => [uniqueIndex('admins_email_unique').on(table.email)],
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
