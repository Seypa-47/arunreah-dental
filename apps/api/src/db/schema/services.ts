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
    category: text('category'),
    descriptionEn: text('description_en'),
    descriptionKm: text('description_km'),
    imageKey: text('image_key'),
    heroEyebrowEn: text('hero_eyebrow_en'),
    heroEyebrowKm: text('hero_eyebrow_km'),
    heroTitleEn: text('hero_title_en'),
    heroTitleKm: text('hero_title_km'),
    heroSummaryEn: text('hero_summary_en'),
    heroSummaryKm: text('hero_summary_km'),
    heroImageKey: text('hero_image_key'),
    aboutTitleEn: text('about_title_en'),
    aboutTitleKm: text('about_title_km'),
    aboutBodyEn: text('about_body_en'),
    aboutBodyKm: text('about_body_km'),
    aboutImageKey: text('about_image_key'),
    durationEn: text('duration_en'),
    durationKm: text('duration_km'),
    recoveryEn: text('recovery_en'),
    recoveryKm: text('recovery_km'),
    visitsEn: text('visits_en'),
    visitsKm: text('visits_km'),
    consultationEn: text('consultation_en'),
    consultationKm: text('consultation_km'),
    ctaTitleEn: text('cta_title_en'),
    ctaTitleKm: text('cta_title_km'),
    ctaDescriptionEn: text('cta_description_en'),
    ctaDescriptionKm: text('cta_description_km'),
    primaryCtaLabelEn: text('primary_cta_label_en'),
    primaryCtaLabelKm: text('primary_cta_label_km'),
    secondaryCtaLabelEn: text('secondary_cta_label_en'),
    secondaryCtaLabelKm: text('secondary_cta_label_km'),
    metaTitleEn: text('meta_title_en'),
    metaTitleKm: text('meta_title_km'),
    metaDescriptionEn: text('meta_description_en'),
    metaDescriptionKm: text('meta_description_km'),
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
    icon: text('icon'),
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
