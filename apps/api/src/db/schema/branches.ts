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
    badgeEn: text('badge_en'),
    badgeKm: text('badge_km'),
    addressEn: text('address_en').notNull(),
    addressKm: text('address_km').notNull(),
    cityProvince: text('city_province'),
    shortLocationLabelEn: text('short_location_label_en'),
    shortLocationLabelKm: text('short_location_label_km'),
    openingHoursEn: text('opening_hours_en'),
    openingHoursKm: text('opening_hours_km'),
    openingDaysEn: text('opening_days_en'),
    openingDaysKm: text('opening_days_km'),
    openingTime: text('opening_time'),
    closingTime: text('closing_time'),
    phone: text('phone').notNull(),
    secondaryPhone: text('secondary_phone'),
    email: text('email'),
    googleMapsUrl: text('google_maps_url'),
    heroImageKey: text('hero_image_key'),
    branchImageKey: text('branch_image_key'),
    heroHeadlineEn: text('hero_headline_en'),
    heroHeadlineKm: text('hero_headline_km'),
    heroSupportingTextEn: text('hero_supporting_text_en'),
    heroSupportingTextKm: text('hero_supporting_text_km'),
    heroCtaLabelEn: text('hero_cta_label_en'),
    heroCtaLabelKm: text('hero_cta_label_km'),
    shortSummaryEn: text('short_summary_en'),
    shortSummaryKm: text('short_summary_km'),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    acceptsAppointments: integer('accepts_appointments', { mode: 'boolean' }).notNull().default(true),
    showOnBranchesPage: integer('show_on_branches_page', { mode: 'boolean' })
      .notNull()
      .default(true),
    showOnHomepage: integer('show_on_homepage', { mode: 'boolean' }).notNull().default(true),
    includeInHomepageHero: integer('include_in_homepage_hero', { mode: 'boolean' })
      .notNull()
      .default(false),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('branches_slug_unique').on(table.slug),
    index('branches_status_idx').on(table.status),
    index('branches_display_order_idx').on(table.displayOrder),
    index('branches_public_page_idx').on(
      table.status,
      table.showOnBranchesPage,
      table.displayOrder,
    ),
    check('branches_status_check', sql`status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')`),
  ],
);
