import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { contentStatusValues, timestamps } from './common';

export const aboutTimeline = sqliteTable('about_timeline', {
  id: text('id').primaryKey(),
  year: integer('year').notNull(),
  titleEn: text('title_en').notNull(),
  titleKm: text('title_km').notNull(),
  bodyEn: text('body_en').notNull(),
  bodyKm: text('body_km').notNull(),
  status: text('status', { enum: contentStatusValues }).notNull().default('DRAFT'),
  displayOrder: integer('display_order').notNull().default(0),
  ...timestamps(),
}, (table) => [
  index('about_timeline_status_order_idx').on(table.status, table.displayOrder, table.year),
  check('about_timeline_status_check', sql`status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')`),
]);
