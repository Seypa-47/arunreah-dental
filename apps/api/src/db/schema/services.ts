import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { contentStatusValues, timestamps } from './common';

export const services = sqliteTable(
  'services',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    status: text('status', { enum: contentStatusValues }).notNull().default('DRAFT'),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    displayOrder: integer('display_order').notNull().default(0),
    nameEn: text('name_en').notNull(),
    nameKm: text('name_km').notNull(),
    summaryEn: text('summary_en'),
    summaryKm: text('summary_km'),
    descriptionEn: text('description_en'),
    descriptionKm: text('description_km'),
    imageKey: text('image_key'),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('services_slug_unique').on(table.slug),
    index('services_status_idx').on(table.status),
    index('services_featured_idx').on(table.featured),
    index('services_display_order_idx').on(table.displayOrder),
    index('services_status_display_order_idx').on(table.status, table.displayOrder),
    check('services_status_check', sql`status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')`),
  ],
);

export const serviceBenefits = sqliteTable(
  'service_benefits',
  {
    id: text('id').primaryKey(),
    serviceId: text('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    titleEn: text('title_en').notNull(),
    titleKm: text('title_km').notNull(),
    descriptionEn: text('description_en'),
    descriptionKm: text('description_km'),
    displayOrder: integer('display_order').notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    index('service_benefits_service_id_idx').on(table.serviceId),
    index('service_benefits_service_order_idx').on(table.serviceId, table.displayOrder),
  ],
);

export const serviceRelatedServices = sqliteTable(
  'service_related_services',
  {
    id: text('id').primaryKey(),
    serviceId: text('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    relatedServiceId: text('related_service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    displayOrder: integer('display_order').notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('service_related_services_unique').on(table.serviceId, table.relatedServiceId),
    index('service_related_services_service_order_idx').on(table.serviceId, table.displayOrder),
  ],
);
