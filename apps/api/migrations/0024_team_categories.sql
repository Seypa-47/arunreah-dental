-- Our Team categories.
--
-- Hand-written, not drizzle-kit generated: meta/_journal.json is stale at 0008
-- while migrations 0009-0023 were authored by hand, so `drizzle-kit generate`
-- diffs against a snapshot that predates ~15 migrations and emits table
-- rebuilds and duplicate CREATE TABLE statements. See docs/our-team-cms-
-- implementation-notes.md. This migration is additive only.
--
-- SQLite cannot ALTER TABLE ADD a CHECK constraint, so the
-- "bookable only for clinical categories" invariant is enforced in
-- packages/shared (createDoctorSchema/updateDoctorSchema) and in
-- doctor.service.ts, not at the database level.

ALTER TABLE `doctors` ADD `category` text DEFAULT 'DENTIST' NOT NULL;--> statement-breakpoint
ALTER TABLE `doctors` ADD `bookable` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `doctors` ADD `department_en` text;--> statement-breakpoint
ALTER TABLE `doctors` ADD `department_km` text;--> statement-breakpoint
ALTER TABLE `doctors` ADD `team_note_en` text;--> statement-breakpoint
ALTER TABLE `doctors` ADD `team_note_km` text;--> statement-breakpoint
CREATE INDEX `doctors_category_idx` ON `doctors` (`category`);--> statement-breakpoint
CREATE INDEX `doctors_category_status_order_idx` ON `doctors` (`category`,`status`,`display_order`);--> statement-breakpoint
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
	CONSTRAINT "doctor_profile_items_kind_check" CHECK(kind in ('EXPERIENCE', 'RESPONSIBILITY', 'TRAINING', 'LANGUAGE')),
	CONSTRAINT "doctor_profile_items_icon_check" CHECK((kind = 'RESPONSIBILITY' and icon is not null) or (kind <> 'RESPONSIBILITY' and icon is null))
);--> statement-breakpoint
CREATE INDEX `doctor_profile_items_doctor_id_idx` ON `doctor_profile_items` (`doctor_id`);--> statement-breakpoint
CREATE INDEX `doctor_profile_items_doctor_kind_order_idx` ON `doctor_profile_items` (`doctor_id`,`kind`,`display_order`);
