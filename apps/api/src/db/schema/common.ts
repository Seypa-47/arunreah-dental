import { sql } from 'drizzle-orm';
import { text } from 'drizzle-orm/sqlite-core';

export const contentStatusValues = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export const appointmentStatusValues = [
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
] as const;

export function timestamps() {
  return {
    createdAt: text('created_at')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  };
}
