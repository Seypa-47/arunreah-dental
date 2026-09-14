import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { contentStatusValues, timestamps } from './common';

export const showcases = sqliteTable(
  'showcases',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    status: text('status', { enum: contentStatusValues }).notNull().default('DRAFT'),
    showOnHomepage: integer('show_on_homepage', { mode: 'boolean' }).notNull().default(false),
    displayOrder: integer('display_order').notNull().default(0),
    titleEn: text('title_en').notNull(),
    titleKm: text('title_km').notNull(),
    categoryEn: text('category_en'),
    categoryKm: text('category_km'),
    excerptEn: text('excerpt_en'),
    excerptKm: text('excerpt_km'),
    bodyEn: text('body_en'),
    bodyKm: text('body_km'),
    coverImageKey: text('cover_image_key'),
    metaTitleEn: text('meta_title_en'),
    metaTitleKm: text('meta_title_km'),
    metaDescriptionEn: text('meta_description_en'),
    metaDescriptionKm: text('meta_description_km'),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('showcases_slug_unique').on(table.slug),
    index('showcases_status_idx').on(table.status),
    index('showcases_show_on_homepage_idx').on(table.showOnHomepage),
    index('showcases_display_order_idx').on(table.displayOrder),
    index('showcases_homepage_order_idx').on(table.showOnHomepage, table.displayOrder),
    check('showcases_status_check', sql`status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')`),
  ],
);

export const showcaseSections = sqliteTable(
  'showcase_sections',
  {
    id: text('id').primaryKey(),
    showcaseId: text('showcase_id')
      .notNull()
      .references(() => showcases.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    sectionType: text('section_type', { enum: ['TEXT', 'IMAGE', 'QUOTE'] })
      .notNull()
      .default('TEXT'),
    headingEn: text('heading_en'),
    headingKm: text('heading_km'),
    bodyEn: text('body_en'),
    bodyKm: text('body_km'),
    imageKey: text('image_key'),
    displayOrder: integer('display_order').notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    index('showcase_sections_showcase_id_idx').on(table.showcaseId),
    index('showcase_sections_showcase_order_idx').on(table.showcaseId, table.displayOrder),
    check('showcase_sections_type_check', sql`section_type in ('TEXT', 'IMAGE', 'QUOTE')`),
  ],
);

export const showcaseRelated = sqliteTable(
  'showcase_related',
  {
    id: text('id').primaryKey(),
    showcaseId: text('showcase_id')
      .notNull()
      .references(() => showcases.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    relatedShowcaseId: text('related_showcase_id')
      .notNull()
      .references(() => showcases.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    displayOrder: integer('display_order').notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('showcase_related_unique').on(table.showcaseId, table.relatedShowcaseId),
    index('showcase_related_showcase_order_idx').on(table.showcaseId, table.displayOrder),
  ],
);
