import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { admins } from './admins';
import { appointmentStatusValues, timestamps } from './common';
import { branches } from './branches';
import { doctors } from './doctors';
import { services } from './services';

export const appointments = sqliteTable(
  'appointments',
  {
    id: text('id').primaryKey(),
    reference: text('reference').notNull(),
    idempotencyKey: text('idempotency_key').notNull(),
    status: text('status', { enum: appointmentStatusValues }).notNull().default('PENDING'),
    serviceId: text('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    doctorId: text('doctor_id').references(() => doctors.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    branchId: text('branch_id')
      .notNull()
      .references(() => branches.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    serviceNameSnapshot: text('service_name_snapshot').notNull(),
    doctorNameSnapshot: text('doctor_name_snapshot'),
    branchNameSnapshot: text('branch_name_snapshot').notNull(),
    patientName: text('patient_name').notNull(),
    patientPhone: text('patient_phone').notNull(),
    patientEmail: text('patient_email'),
    patientNote: text('patient_note'),
    preferredDate: text('preferred_date').notNull(),
    preferredTime: text('preferred_time').notNull(),
    locale: text('locale', { enum: ['en', 'km'] })
      .notNull()
      .default('en'),
    statusUpdatedAt: text('status_updated_at'),
    statusUpdatedByAdminId: text('status_updated_by_admin_id').references(() => admins.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    ...timestamps(),
  },
  (table) => [
    index('appointments_status_idx').on(table.status),
    index('appointments_preferred_date_idx').on(table.preferredDate),
    index('appointments_doctor_id_idx').on(table.doctorId),
    index('appointments_service_id_idx').on(table.serviceId),
    index('appointments_branch_id_idx').on(table.branchId),
    index('appointments_created_at_idx').on(table.createdAt),
    uniqueIndex('appointments_reference_unique').on(table.reference),
    uniqueIndex('appointments_idempotency_key_unique').on(table.idempotencyKey),
    index('appointments_status_preferred_date_idx').on(table.status, table.preferredDate),
    check(
      'appointments_status_check',
      sql`status in ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')`,
    ),
    check('appointments_locale_check', sql`locale in ('en', 'km')`),
  ],
);

export const appointmentRequestRateLimits = sqliteTable(
  'appointment_request_rate_limits',
  {
    key: text('key').primaryKey(),
    attempts: integer('attempts').notNull().default(0),
    windowStartedAt: text('window_started_at').notNull(),
    ...timestamps(),
  },
  (table) => [
    index('appointment_request_rate_limits_window_started_at_idx').on(table.windowStartedAt),
  ],
);
