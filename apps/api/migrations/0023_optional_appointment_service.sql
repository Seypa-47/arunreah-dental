PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `appointments_next` (
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
);
--> statement-breakpoint
INSERT INTO `appointments_next` (
  `id`, `reference`, `idempotency_key`, `status`, `service_id`, `doctor_id`, `branch_id`,
  `service_name_snapshot`, `doctor_name_snapshot`, `branch_name_snapshot`, `patient_name`,
  `patient_phone`, `patient_email`, `patient_note`, `preferred_date`, `preferred_time`,
  `locale`, `status_updated_at`, `status_updated_by_admin_id`, `created_at`, `updated_at`
)
SELECT
  `id`, `reference`, `idempotency_key`, `status`, `service_id`, `doctor_id`, `branch_id`,
  `service_name_snapshot`, `doctor_name_snapshot`, `branch_name_snapshot`, `patient_name`,
  `patient_phone`, `patient_email`, `patient_note`, `preferred_date`, `preferred_time`,
  `locale`, `status_updated_at`, `status_updated_by_admin_id`, `created_at`, `updated_at`
FROM `appointments`;
--> statement-breakpoint
DROP TABLE `appointments`;
--> statement-breakpoint
ALTER TABLE `appointments_next` RENAME TO `appointments`;
--> statement-breakpoint
CREATE INDEX `appointments_status_idx` ON `appointments` (`status`);
--> statement-breakpoint
CREATE INDEX `appointments_preferred_date_idx` ON `appointments` (`preferred_date`);
--> statement-breakpoint
CREATE INDEX `appointments_doctor_id_idx` ON `appointments` (`doctor_id`);
--> statement-breakpoint
CREATE INDEX `appointments_service_id_idx` ON `appointments` (`service_id`);
--> statement-breakpoint
CREATE INDEX `appointments_branch_id_idx` ON `appointments` (`branch_id`);
--> statement-breakpoint
CREATE INDEX `appointments_created_at_idx` ON `appointments` (`created_at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `appointments_reference_unique` ON `appointments` (`reference`);
--> statement-breakpoint
CREATE UNIQUE INDEX `appointments_idempotency_key_unique` ON `appointments` (`idempotency_key`);
--> statement-breakpoint
CREATE INDEX `appointments_status_preferred_date_idx` ON `appointments` (`status`, `preferred_date`);
--> statement-breakpoint
PRAGMA foreign_keys=ON;
