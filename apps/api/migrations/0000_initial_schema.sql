CREATE TABLE `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`last_seen_at` text,
	`revoked_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `admin_sessions_admin_id_idx` ON `admin_sessions` (`admin_id`);--> statement-breakpoint
CREATE INDEX `admin_sessions_expires_at_idx` ON `admin_sessions` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `admin_sessions_token_hash_unique` ON `admin_sessions` (`token_hash`);--> statement-breakpoint
CREATE TABLE `admins` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_email_unique` ON `admins` (`email`);--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`service_id` text NOT NULL,
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
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`status_updated_by_admin_id`) REFERENCES `admins`(`id`) ON UPDATE cascade ON DELETE set null,
	CONSTRAINT "appointments_status_check" CHECK(status in ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
	CONSTRAINT "appointments_locale_check" CHECK(locale in ('en', 'km'))
);
--> statement-breakpoint
CREATE INDEX `appointments_status_idx` ON `appointments` (`status`);--> statement-breakpoint
CREATE INDEX `appointments_preferred_date_idx` ON `appointments` (`preferred_date`);--> statement-breakpoint
CREATE INDEX `appointments_doctor_id_idx` ON `appointments` (`doctor_id`);--> statement-breakpoint
CREATE INDEX `appointments_service_id_idx` ON `appointments` (`service_id`);--> statement-breakpoint
CREATE INDEX `appointments_branch_id_idx` ON `appointments` (`branch_id`);--> statement-breakpoint
CREATE INDEX `appointments_created_at_idx` ON `appointments` (`created_at`);--> statement-breakpoint
CREATE INDEX `appointments_status_preferred_date_idx` ON `appointments` (`status`,`preferred_date`);--> statement-breakpoint
CREATE TABLE `branches` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`name_en` text NOT NULL,
	`name_km` text NOT NULL,
	`address_en` text NOT NULL,
	`address_km` text NOT NULL,
	`opening_hours_en` text,
	`opening_hours_km` text,
	`phone` text NOT NULL,
	`email` text,
	`map_url` text,
	`hero_image_key` text,
	`hero_headline_en` text,
	`hero_headline_km` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	CONSTRAINT "branches_status_check" CHECK(status in ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `branches_slug_unique` ON `branches` (`slug`);--> statement-breakpoint
CREATE INDEX `branches_status_idx` ON `branches` (`status`);--> statement-breakpoint
CREATE INDEX `branches_display_order_idx` ON `branches` (`display_order`);--> statement-breakpoint
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
);
--> statement-breakpoint
CREATE INDEX `doctor_education_doctor_id_idx` ON `doctor_education` (`doctor_id`);--> statement-breakpoint
CREATE INDEX `doctor_education_doctor_order_idx` ON `doctor_education` (`doctor_id`,`display_order`);--> statement-breakpoint
CREATE TABLE `doctor_expertise` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`name_en` text NOT NULL,
	`name_km` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `doctor_expertise_doctor_id_idx` ON `doctor_expertise` (`doctor_id`);--> statement-breakpoint
CREATE INDEX `doctor_expertise_doctor_order_idx` ON `doctor_expertise` (`doctor_id`,`display_order`);--> statement-breakpoint
CREATE TABLE `doctor_related_doctors` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`related_doctor_id` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`related_doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `doctor_related_doctors_unique` ON `doctor_related_doctors` (`doctor_id`,`related_doctor_id`);--> statement-breakpoint
CREATE INDEX `doctor_related_doctors_doctor_order_idx` ON `doctor_related_doctors` (`doctor_id`,`display_order`);--> statement-breakpoint
CREATE TABLE `doctors` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`name_en` text NOT NULL,
	`name_km` text NOT NULL,
	`role_en` text,
	`role_km` text,
	`biography_en` text,
	`biography_km` text,
	`photo_key` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	CONSTRAINT "doctors_status_check" CHECK(status in ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `doctors_slug_unique` ON `doctors` (`slug`);--> statement-breakpoint
CREATE INDEX `doctors_status_idx` ON `doctors` (`status`);--> statement-breakpoint
CREATE INDEX `doctors_featured_idx` ON `doctors` (`featured`);--> statement-breakpoint
CREATE INDEX `doctors_display_order_idx` ON `doctors` (`display_order`);--> statement-breakpoint
CREATE INDEX `doctors_status_display_order_idx` ON `doctors` (`status`,`display_order`);--> statement-breakpoint
CREATE TABLE `service_benefits` (
	`id` text PRIMARY KEY NOT NULL,
	`service_id` text NOT NULL,
	`title_en` text NOT NULL,
	`title_km` text NOT NULL,
	`description_en` text,
	`description_km` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `service_benefits_service_id_idx` ON `service_benefits` (`service_id`);--> statement-breakpoint
CREATE INDEX `service_benefits_service_order_idx` ON `service_benefits` (`service_id`,`display_order`);--> statement-breakpoint
CREATE TABLE `service_related_services` (
	`id` text PRIMARY KEY NOT NULL,
	`service_id` text NOT NULL,
	`related_service_id` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`related_service_id`) REFERENCES `services`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_related_services_unique` ON `service_related_services` (`service_id`,`related_service_id`);--> statement-breakpoint
CREATE INDEX `service_related_services_service_order_idx` ON `service_related_services` (`service_id`,`display_order`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`name_en` text NOT NULL,
	`name_km` text NOT NULL,
	`summary_en` text,
	`summary_km` text,
	`description_en` text,
	`description_km` text,
	`image_key` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	CONSTRAINT "services_status_check" CHECK(status in ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE INDEX `services_status_idx` ON `services` (`status`);--> statement-breakpoint
CREATE INDEX `services_featured_idx` ON `services` (`featured`);--> statement-breakpoint
CREATE INDEX `services_display_order_idx` ON `services` (`display_order`);--> statement-breakpoint
CREATE INDEX `services_status_display_order_idx` ON `services` (`status`,`display_order`);--> statement-breakpoint
CREATE TABLE `clinic_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_name_en` text NOT NULL,
	`clinic_name_km` text NOT NULL,
	`tagline_en` text,
	`tagline_km` text,
	`about_en` text,
	`about_km` text,
	`logo_key` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contact_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`primary_phone` text NOT NULL,
	`secondary_phone` text,
	`email` text,
	`address_en` text,
	`address_km` text,
	`opening_hours_en` text,
	`opening_hours_km` text,
	`map_url` text,
	`facebook_url` text,
	`telegram_url` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `showcase_related` (
	`id` text PRIMARY KEY NOT NULL,
	`showcase_id` text NOT NULL,
	`related_showcase_id` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`showcase_id`) REFERENCES `showcases`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`related_showcase_id`) REFERENCES `showcases`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `showcase_related_unique` ON `showcase_related` (`showcase_id`,`related_showcase_id`);--> statement-breakpoint
CREATE INDEX `showcase_related_showcase_order_idx` ON `showcase_related` (`showcase_id`,`display_order`);--> statement-breakpoint
CREATE TABLE `showcase_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`showcase_id` text NOT NULL,
	`section_type` text DEFAULT 'TEXT' NOT NULL,
	`heading_en` text,
	`heading_km` text,
	`body_en` text,
	`body_km` text,
	`image_key` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`showcase_id`) REFERENCES `showcases`(`id`) ON UPDATE cascade ON DELETE restrict,
	CONSTRAINT "showcase_sections_type_check" CHECK(section_type in ('TEXT', 'IMAGE', 'QUOTE'))
);
--> statement-breakpoint
CREATE INDEX `showcase_sections_showcase_id_idx` ON `showcase_sections` (`showcase_id`);--> statement-breakpoint
CREATE INDEX `showcase_sections_showcase_order_idx` ON `showcase_sections` (`showcase_id`,`display_order`);--> statement-breakpoint
CREATE TABLE `showcases` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`show_on_homepage` integer DEFAULT false NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`title_en` text NOT NULL,
	`title_km` text NOT NULL,
	`excerpt_en` text,
	`excerpt_km` text,
	`cover_image_key` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	CONSTRAINT "showcases_status_check" CHECK(status in ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `showcases_slug_unique` ON `showcases` (`slug`);--> statement-breakpoint
CREATE INDEX `showcases_status_idx` ON `showcases` (`status`);--> statement-breakpoint
CREATE INDEX `showcases_show_on_homepage_idx` ON `showcases` (`show_on_homepage`);--> statement-breakpoint
CREATE INDEX `showcases_display_order_idx` ON `showcases` (`display_order`);--> statement-breakpoint
CREATE INDEX `showcases_homepage_order_idx` ON `showcases` (`show_on_homepage`,`display_order`);