import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { contentStatusValues, timestamps } from './common';

export const doctors = sqliteTable(
  'doctors',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    status: text('status', { enum: contentStatusValues }).notNull().default('DRAFT'),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    displayOrder: integer('display_order').notNull().default(0),
    nameEn: text('name_en').notNull(),
    nameKm: text('name_km').notNull(),
    roleEn: text('role_en'),
    roleKm: text('role_km'),
    biographyEn: text('biography_en'),
    biographyKm: text('biography_km'),
    photoKey: text('photo_key'),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('doctors_slug_unique').on(table.slug),
    index('doctors_status_idx').on(table.status),
    index('doctors_featured_idx').on(table.featured),
    index('doctors_display_order_idx').on(table.displayOrder),
    index('doctors_status_display_order_idx').on(table.status, table.displayOrder),
    check('doctors_status_check', sql`status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')`),
  ],
);

export const doctorExpertise = sqliteTable(
  'doctor_expertise',
  {
    id: text('id').primaryKey(),
    doctorId: text('doctor_id')
      .notNull()
      .references(() => doctors.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    nameEn: text('name_en').notNull(),
    nameKm: text('name_km').notNull(),
    displayOrder: integer('display_order').notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    index('doctor_expertise_doctor_id_idx').on(table.doctorId),
    index('doctor_expertise_doctor_order_idx').on(table.doctorId, table.displayOrder),
  ],
);

export const doctorEducation = sqliteTable(
  'doctor_education',
  {
    id: text('id').primaryKey(),
    doctorId: text('doctor_id')
      .notNull()
      .references(() => doctors.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    degreeEn: text('degree_en').notNull(),
    degreeKm: text('degree_km').notNull(),
    institutionEn: text('institution_en').notNull(),
    institutionKm: text('institution_km').notNull(),
    yearLabel: text('year_label'),
    displayOrder: integer('display_order').notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    index('doctor_education_doctor_id_idx').on(table.doctorId),
    index('doctor_education_doctor_order_idx').on(table.doctorId, table.displayOrder),
  ],
);

export const doctorRelatedDoctors = sqliteTable(
  'doctor_related_doctors',
  {
    id: text('id').primaryKey(),
    doctorId: text('doctor_id')
      .notNull()
      .references(() => doctors.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    relatedDoctorId: text('related_doctor_id')
      .notNull()
      .references(() => doctors.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    displayOrder: integer('display_order').notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('doctor_related_doctors_unique').on(table.doctorId, table.relatedDoctorId),
    index('doctor_related_doctors_doctor_order_idx').on(table.doctorId, table.displayOrder),
  ],
);
