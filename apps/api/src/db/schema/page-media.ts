import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { contentStatusValues, timestamps } from './common';

export const pageMediaPlacements = ['HOME_PROMOTIONS', 'ABOUT_PROFESSIONAL_DEVELOPMENT', 'ABOUT_ADVANCED_FACILITIES', 'DOCTORS_HERO', 'DOCTORS_PATIENT_EDUCATION'] as const;

export const pageMedia = sqliteTable('page_media', {
  id: text('id').primaryKey(),
  placement: text('placement', { enum: pageMediaPlacements }).notNull(),
  status: text('status', { enum: contentStatusValues }).notNull().default('DRAFT'),
  titleEn: text('title_en'), titleKm: text('title_km'), bodyEn: text('body_en'), bodyKm: text('body_km'),
  badgeEn: text('badge_en'), badgeKm: text('badge_km'), discountEn: text('discount_en'), discountKm: text('discount_km'),
  benefitsEn: text('benefits_en'), benefitsKm: text('benefits_km'), validUntil: text('valid_until'),
  imageKey: text('image_key').notNull(), displayOrder: integer('display_order').notNull().default(0),
  ...timestamps(),
}, (table) => [
  index('page_media_placement_status_order_idx').on(table.placement, table.status, table.displayOrder),
  check('page_media_placement_check', sql`placement in ('HOME_PROMOTIONS', 'ABOUT_PROFESSIONAL_DEVELOPMENT', 'ABOUT_ADVANCED_FACILITIES', 'DOCTORS_HERO', 'DOCTORS_PATIENT_EDUCATION')`),
  check('page_media_status_check', sql`status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')`),
]);
