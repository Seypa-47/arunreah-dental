import { text } from 'drizzle-orm/sqlite-core';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

/** Coordinates a short-lived R2 delete with CMS writes that reference media. */
export const mediaDeletionLocks = sqliteTable('media_deletion_locks', {
  key: text('key').primaryKey(),
  createdAt: text('created_at').notNull(),
});
