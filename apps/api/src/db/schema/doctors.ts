import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { branches } from './branches';
import { profileItemKindValues, teamCategoryValues } from '@arunreah/shared';
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
    specialtyEn: text('specialty_en'),
    specialtyKm: text('specialty_km'),
    shortBioEn: text('short_bio_en'),
    shortBioKm: text('short_bio_km'),
    biographyEn: text('biography_en'),
    biographyKm: text('biography_km'),
    photoKey: text('photo_key'),
    yearsExperience: integer('years_experience'),
    successfulProcedures: integer('successful_procedures'),
    patientSatisfaction: integer('patient_satisfaction'),
    phone: text('phone'),
    /** Which Our Team section this member appears in. */
    category: text('category', { enum: teamCategoryValues }).notNull().default('DENTIST'),
    /**
     * Whether this member can be attached to an appointment. Only ever true for
     * DENTIST / GENERAL_PRACTITIONER — enforced in the shared schema and again
     * in doctor.service.ts.
     */
    bookable: integer('bookable', { mode: 'boolean' }).notNull().default(true),
    departmentEn: text('department_en'),
    departmentKm: text('department_km'),
    teamNoteEn: text('team_note_en'),
    teamNoteKm: text('team_note_km'),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('doctors_slug_unique').on(table.slug),
    index('doctors_category_idx').on(table.category),
    index('doctors_category_status_order_idx').on(table.category, table.status, table.displayOrder),
    index('doctors_status_idx').on(table.status),
    index('doctors_featured_idx').on(table.featured),
    index('doctors_display_order_idx').on(table.displayOrder),
    index('doctors_status_display_order_idx').on(table.status, table.displayOrder),
    check('doctors_status_check', sql`status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')`),
    check(
      'doctors_category_check',
      sql`category in ('DENTIST', 'GENERAL_PRACTITIONER', 'RECEPTIONIST', 'ASSISTANT')`,
    ),
  ],
);

/**
 * Ordered list blocks on a team member profile: GP experience, support-staff
 * responsibilities, assistant training, and spoken languages. One table with a
 * `kind` discriminator because all four share the same shape.
 */
export const doctorProfileItems = sqliteTable(
  'doctor_profile_items',
  {
    id: text('id').primaryKey(),
    doctorId: text('doctor_id')
      .notNull()
      .references(() => doctors.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    kind: text('kind', { enum: profileItemKindValues }).notNull(),
    /** RESPONSIBILITY items only. */
    icon: text('icon'),
    titleEn: text('title_en').notNull(),
    titleKm: text('title_km').notNull(),
    subtitleEn: text('subtitle_en'),
    subtitleKm: text('subtitle_km'),
    /** Period or year label, shown only when confirmed. */
    meta: text('meta'),
    displayOrder: integer('display_order').notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    index('doctor_profile_items_doctor_id_idx').on(table.doctorId),
    index('doctor_profile_items_doctor_kind_order_idx').on(
      table.doctorId,
      table.kind,
      table.displayOrder,
    ),
    check(
      'doctor_profile_items_kind_check',
      sql`kind in ('EXPERIENCE', 'RESPONSIBILITY', 'TRAINING', 'LANGUAGE')`,
    ),
    check(
      'doctor_profile_items_icon_check',
      sql`(kind = 'RESPONSIBILITY' and icon is not null) or (kind <> 'RESPONSIBILITY' and icon is null)`,
    ),
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

export const doctorBranches = sqliteTable(
  'doctor_branches',
  {
    id: text('id').primaryKey(),
    doctorId: text('doctor_id')
      .notNull()
      .references(() => doctors.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    branchId: text('branch_id')
      .notNull()
      .references(() => branches.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    displayOrder: integer('display_order').notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex('doctor_branches_unique').on(table.doctorId, table.branchId),
    index('doctor_branches_doctor_id_idx').on(table.doctorId),
    index('doctor_branches_branch_id_idx').on(table.branchId),
  ],
);
