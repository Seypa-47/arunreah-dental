CREATE TABLE `admin_password_reset_tokens` (
  `id` text PRIMARY KEY NOT NULL,
  `admin_id` text NOT NULL,
  `token_hash` text NOT NULL,
  `expires_at` text NOT NULL,
  `used_at` text,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  `updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `admin_password_reset_tokens_admin_id_idx` ON `admin_password_reset_tokens` (`admin_id`);
--> statement-breakpoint
CREATE INDEX `admin_password_reset_tokens_expires_at_idx` ON `admin_password_reset_tokens` (`expires_at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_password_reset_tokens_token_hash_unique` ON `admin_password_reset_tokens` (`token_hash`);
