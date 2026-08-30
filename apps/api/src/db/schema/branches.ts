import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { contentStatusValues, timestamps } from './common';

export const branches = sqliteTable(
  'branches',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    status: text('status', { enum: contentStatusValues }).notNull().default('DRAFT'),
    displayOrder: integer('display_order').notNull().default(0),
    nameEn: text('name_en').notNull(),
    nameKm: text('name_km').notNull(),
    addressEn: text('address_en').notNull(),
    addressKm: text('address_km').notNull(),
    openingHoursEn: text('opening_hours_en'),
    openingHoursKm: text('opening_hours_km'),
    phone: text('phone').notNull(),
    email: text('email'),
    mapUrl: text('map_url'),
    heroImageKey: text('hero_image_key'),
    heroHeadlineEn: text('hero_headline_en'),
    heroHeadlineKm: text('hero_headline_km'),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('branches_slug_unique').on(table.slug),
    index('branches_status_idx').on(table.status),
    index('branches_display_order_idx').on(table.displayOrder),
    check('branches_status_check', sql`status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')`),
  ],
);
