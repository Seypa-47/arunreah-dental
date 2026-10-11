CREATE TABLE `appointment_request_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`window_started_at` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `appointment_request_rate_limits_window_started_at_idx` ON `appointment_request_rate_limits` (`window_started_at`);--> statement-breakpoint
ALTER TABLE `appointments` ADD `reference` text;--> statement-breakpoint
ALTER TABLE `appointments` ADD `idempotency_key` text;--> statement-breakpoint
UPDATE `appointments` SET `reference` = 'LEGACY-' || `id` WHERE `reference` IS NULL;--> statement-breakpoint
UPDATE `appointments` SET `idempotency_key` = 'legacy:' || `id` WHERE `idempotency_key` IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `appointments_reference_unique` ON `appointments` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `appointments_idempotency_key_unique` ON `appointments` (`idempotency_key`);
