CREATE TABLE `admin_login_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`window_started_at` text NOT NULL,
	`locked_until` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `admin_login_rate_limits_locked_until_idx` ON `admin_login_rate_limits` (`locked_until`);--> statement-breakpoint
ALTER TABLE `admins` ADD COLUMN `role` text DEFAULT 'RECEPTIONIST' NOT NULL CHECK(role in ('RECEPTIONIST', 'CMS_ADMIN', 'SUPER_ADMIN'));--> statement-breakpoint
CREATE INDEX `admins_role_active_idx` ON `admins` (`role`,`is_active`);
