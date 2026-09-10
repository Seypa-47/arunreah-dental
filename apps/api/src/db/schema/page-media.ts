import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { contentStatusValues, timestamps } from './common';

export const pageMediaPlacements = ['ABOUT_PROFESSIONAL_DEVELOPMENT', 'DOCTORS_HERO', 'DOCTORS_PATIENT_EDUCATION'] as const;

export const pageMedia = sqliteTable('page_media', {
  id: text('id').primaryKey(),
  placement: text('placement', { enum: pageMediaPlacements }).notNull(),
  status: text('status', { enum: contentStatusValues }).notNull().default('DRAFT'),
  titleEn: text('title_en'), titleKm: text('title_km'), bodyEn: text('body_en'), bodyKm: text('body_km'),
  imageKey: text('image_key').notNull(), displayOrder: integer('display_order').notNull().default(0),
  ...timestamps(),
}, (table) => [
  index('page_media_placement_status_order_idx').on(table.placement, table.status, table.displayOrder),
  check('page_media_placement_check', sql`placement in ('ABOUT_PROFESSIONAL_DEVELOPMENT', 'DOCTORS_HERO', 'DOCTORS_PATIENT_EDUCATION')`),
  check('page_media_status_check', sql`status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')`),
]);
