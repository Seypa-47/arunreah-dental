import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamps } from './common';

export const clinicSettings = sqliteTable('clinic_settings', {
  id: text('id').primaryKey(),
  clinicNameEn: text('clinic_name_en').notNull(),
  clinicNameKm: text('clinic_name_km').notNull(),
  taglineEn: text('tagline_en'),
  taglineKm: text('tagline_km'),
  shortAboutEn: text('short_about_en'),
  shortAboutKm: text('short_about_km'),
  logoKey: text('logo_key'),
  yearsExperience: integer('years_experience'),
  successfulCases: integer('successful_cases'),
  patientSatisfaction: integer('patient_satisfaction'),
  ...timestamps(),
});

export const contactSettings = sqliteTable('contact_settings', {
  id: text('id').primaryKey(),
  primaryPhone: text('primary_phone').notNull(),
  secondaryPhone: text('secondary_phone'),
  email: text('email'),
  addressEn: text('address_en'),
  addressKm: text('address_km'),
  openingHoursEn: text('opening_hours_en'),
  openingHoursKm: text('opening_hours_km'),
  mapUrl: text('map_url'),
  facebookUrl: text('facebook_url'),
  telegramUrl: text('telegram_url'),
  ...timestamps(),
});
