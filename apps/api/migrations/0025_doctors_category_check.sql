-- Corrective migration for the category CHECK added to the Drizzle schema.
-- 0024_team_categories.sql has already been applied and must remain immutable,
-- so SQLite requires a data-preserving table rebuild to add the constraint.
-- D1 keeps foreign-key enforcement enabled inside migration transactions. Back
-- up and temporarily remove every table that references doctors so the parent
-- table can be rebuilt without deleting or rewriting any business data.

CREATE TABLE `__backup_appointments` AS SELECT * FROM `appointments`;--> statement-breakpoint
CREATE TABLE `__backup_doctor_branches` AS SELECT * FROM `doctor_branches`;--> statement-breakpoint
CREATE TABLE `__backup_doctor_education` AS SELECT * FROM `doctor_education`;--> statement-breakpoint
CREATE TABLE `__backup_doctor_expertise` AS SELECT * FROM `doctor_expertise`;--> statement-breakpoint
CREATE TABLE `__backup_doctor_profile_items` AS SELECT * FROM `doctor_profile_items`;--> statement-breakpoint
CREATE TABLE `__backup_doctor_related_doctors` AS SELECT * FROM `doctor_related_doctors`;--> statement-breakpoint
DROP TABLE `appointments`;--> statement-breakpoint
DROP TABLE `doctor_branches`;--> statement-breakpoint
DROP TABLE `doctor_education`;--> statement-breakpoint
DROP TABLE `doctor_expertise`;--> statement-breakpoint
DROP TABLE `doctor_profile_items`;--> statement-breakpoint
DROP TABLE `doctor_related_doctors`;--> statement-breakpoint

PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_doctors` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`featured` integer DEFAULT 0 NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`name_en` text NOT NULL,
	`name_km` text NOT NULL,
	`role_en` text,
	`role_km` text,
	`specialty_en` text,
	`specialty_km` text,
	`short_bio_en` text,
	`short_bio_km` text,
	`biography_en` text,
	`biography_km` text,
	`photo_key` text,
	`years_experience` integer,
	`successful_procedures` integer,
	`patient_satisfaction` integer,
	`phone` text,
	`category` text DEFAULT 'DENTIST' NOT NULL,
	`bookable` integer DEFAULT 1 NOT NULL,
	`department_en` text,
	`department_km` text,
	`team_note_en` text,
	`team_note_km` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	CONSTRAINT `doctors_status_check` CHECK (`status` in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
	CONSTRAINT `doctors_category_check` CHECK (`category` in ('DENTIST', 'GENERAL_PRACTITIONER', 'RECEPTIONIST', 'ASSISTANT'))
);--> statement-breakpoint
INSERT INTO `__new_doctors` (
	`id`,
	`slug`,
	`status`,
	`featured`,
	`display_order`,
	`name_en`,
	`name_km`,
	`role_en`,
	`role_km`,
	`specialty_en`,
	`specialty_km`,
	`short_bio_en`,
	`short_bio_km`,
	`biography_en`,
	`biography_km`,
	`photo_key`,
	`years_experience`,
	`successful_procedures`,
	`patient_satisfaction`,
	`phone`,
	`category`,
	`bookable`,
	`department_en`,
	`department_km`,
	`team_note_en`,
	`team_note_km`,
	`created_at`,
	`updated_at`
)
SELECT
	`id`,
	`slug`,
	`status`,
	`featured`,
	`display_order`,
	`name_en`,
	`name_km`,
	`role_en`,
	`role_km`,
	`specialty_en`,
	`specialty_km`,
	`short_bio_en`,
	`short_bio_km`,
	`biography_en`,
	`biography_km`,
	`photo_key`,
	`years_experience`,
	`successful_procedures`,
	`patient_satisfaction`,
	`phone`,
	`category`,
	`bookable`,
	`department_en`,
	`department_km`,
	`team_note_en`,
	`team_note_km`,
	`created_at`,
	`updated_at`
FROM `doctors`;--> statement-breakpoint
DROP TABLE `doctors`;--> statement-breakpoint
ALTER TABLE `__new_doctors` RENAME TO `doctors`;--> statement-breakpoint
CREATE UNIQUE INDEX `doctors_slug_unique` ON `doctors` (`slug`);--> statement-breakpoint
CREATE INDEX `doctors_category_idx` ON `doctors` (`category`);--> statement-breakpoint
CREATE INDEX `doctors_category_status_order_idx` ON `doctors` (`category`, `status`, `display_order`);--> statement-breakpoint
CREATE INDEX `doctors_status_idx` ON `doctors` (`status`);--> statement-breakpoint
CREATE INDEX `doctors_featured_idx` ON `doctors` (`featured`);--> statement-breakpoint
CREATE INDEX `doctors_display_order_idx` ON `doctors` (`display_order`);--> statement-breakpoint
CREATE INDEX `doctors_status_display_order_idx` ON `doctors` (`status`, `display_order`);--> statement-breakpoint

CREATE TRIGGER `block_locked_doctor_media_insert` BEFORE INSERT ON `doctors`
WHEN NEW.photo_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.photo_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;--> statement-breakpoint
CREATE TRIGGER `block_locked_doctor_media_update` BEFORE UPDATE OF `photo_key` ON `doctors`
WHEN NEW.photo_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.photo_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;--> statement-breakpoint

CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`service_id` text,
	`doctor_id` text,
	`branch_id` text NOT NULL,
	`service_name_snapshot` text NOT NULL,
	`doctor_name_snapshot` text,
	`branch_name_snapshot` text NOT NULL,
	`patient_name` text NOT NULL,
	`patient_phone` text NOT NULL,
	`patient_email` text,
	`patient_note` text,
	`preferred_date` text NOT NULL,
	`preferred_time` text NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`status_updated_at` text,
	`status_updated_by_admin_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`status_updated_by_admin_id`) REFERENCES `admins`(`id`) ON UPDATE cascade ON DELETE set null,
	CONSTRAINT `appointments_status_check` CHECK(status in ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
	CONSTRAINT `appointments_locale_check` CHECK(locale in ('en', 'km'))
);--> statement-breakpoint
INSERT INTO `appointments` SELECT * FROM `__backup_appointments`;--> statement-breakpoint
DROP TABLE `__backup_appointments`;--> statement-breakpoint
CREATE UNIQUE INDEX `appointments_reference_unique` ON `appointments` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `appointments_idempotency_key_unique` ON `appointments` (`idempotency_key`);--> statement-breakpoint
CREATE INDEX `appointments_status_idx` ON `appointments` (`status`);--> statement-breakpoint
CREATE INDEX `appointments_service_id_idx` ON `appointments` (`service_id`);--> statement-breakpoint
CREATE INDEX `appointments_doctor_id_idx` ON `appointments` (`doctor_id`);--> statement-breakpoint
CREATE INDEX `appointments_branch_id_idx` ON `appointments` (`branch_id`);--> statement-breakpoint
CREATE INDEX `appointments_preferred_date_idx` ON `appointments` (`preferred_date`);--> statement-breakpoint
CREATE INDEX `appointments_created_at_idx` ON `appointments` (`created_at`);--> statement-breakpoint
CREATE INDEX `appointments_status_preferred_date_idx` ON `appointments` (`status`, `preferred_date`);--> statement-breakpoint

CREATE TABLE `doctor_branches` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`branch_id` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE cascade ON DELETE cascade
);--> statement-breakpoint
INSERT INTO `doctor_branches` SELECT * FROM `__backup_doctor_branches`;--> statement-breakpoint
DROP TABLE `__backup_doctor_branches`;--> statement-breakpoint
CREATE UNIQUE INDEX `doctor_branches_unique` ON `doctor_branches` (`doctor_id`, `branch_id`);--> statement-breakpoint
CREATE INDEX `doctor_branches_doctor_id_idx` ON `doctor_branches` (`doctor_id`);--> statement-breakpoint
CREATE INDEX `doctor_branches_branch_id_idx` ON `doctor_branches` (`branch_id`);--> statement-breakpoint

CREATE TABLE `doctor_education` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`degree_en` text NOT NULL,
	`degree_km` text NOT NULL,
	`institution_en` text NOT NULL,
	`institution_km` text NOT NULL,
	`year_label` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE restrict
);--> statement-breakpoint
INSERT INTO `doctor_education` SELECT * FROM `__backup_doctor_education`;--> statement-breakpoint
DROP TABLE `__backup_doctor_education`;--> statement-breakpoint
CREATE INDEX `doctor_education_doctor_id_idx` ON `doctor_education` (`doctor_id`);--> statement-breakpoint
CREATE INDEX `doctor_education_doctor_order_idx` ON `doctor_education` (`doctor_id`, `display_order`);--> statement-breakpoint

CREATE TABLE `doctor_expertise` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`name_en` text NOT NULL,
	`name_km` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE restrict
);--> statement-breakpoint
INSERT INTO `doctor_expertise` SELECT * FROM `__backup_doctor_expertise`;--> statement-breakpoint
DROP TABLE `__backup_doctor_expertise`;--> statement-breakpoint
CREATE INDEX `doctor_expertise_doctor_id_idx` ON `doctor_expertise` (`doctor_id`);--> statement-breakpoint
CREATE INDEX `doctor_expertise_doctor_order_idx` ON `doctor_expertise` (`doctor_id`, `display_order`);--> statement-breakpoint

CREATE TABLE `doctor_profile_items` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`kind` text NOT NULL,
	`icon` text,
	`title_en` text NOT NULL,
	`title_km` text NOT NULL,
	`subtitle_en` text,
	`subtitle_km` text,
	`meta` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE cascade,
	CONSTRAINT `doctor_profile_items_kind_check` CHECK(kind in ('EXPERIENCE', 'RESPONSIBILITY', 'TRAINING', 'LANGUAGE')),
	CONSTRAINT `doctor_profile_items_icon_check` CHECK((kind = 'RESPONSIBILITY' and icon is not null) or (kind <> 'RESPONSIBILITY' and icon is null))
);--> statement-breakpoint
INSERT INTO `doctor_profile_items` SELECT * FROM `__backup_doctor_profile_items`;--> statement-breakpoint
DROP TABLE `__backup_doctor_profile_items`;--> statement-breakpoint
CREATE INDEX `doctor_profile_items_doctor_id_idx` ON `doctor_profile_items` (`doctor_id`);--> statement-breakpoint
CREATE INDEX `doctor_profile_items_doctor_kind_order_idx` ON `doctor_profile_items` (`doctor_id`, `kind`, `display_order`);--> statement-breakpoint

CREATE TABLE `doctor_related_doctors` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`related_doctor_id` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`related_doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE restrict
);--> statement-breakpoint
INSERT INTO `doctor_related_doctors` SELECT * FROM `__backup_doctor_related_doctors`;--> statement-breakpoint
DROP TABLE `__backup_doctor_related_doctors`;--> statement-breakpoint
CREATE UNIQUE INDEX `doctor_related_doctors_unique` ON `doctor_related_doctors` (`doctor_id`, `related_doctor_id`);--> statement-breakpoint
CREATE INDEX `doctor_related_doctors_doctor_order_idx` ON `doctor_related_doctors` (`doctor_id`, `display_order`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
