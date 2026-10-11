CREATE TABLE `about_timeline` (
  `id` text PRIMARY KEY NOT NULL,
  `year` integer NOT NULL,
  `title_en` text NOT NULL,
  `title_km` text NOT NULL,
  `body_en` text NOT NULL,
  `body_km` text NOT NULL,
  `status` text DEFAULT 'DRAFT' NOT NULL,
  `display_order` integer DEFAULT 0 NOT NULL,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  `updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  CONSTRAINT `about_timeline_status_check` CHECK(status in ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);
--> statement-breakpoint
CREATE INDEX `about_timeline_status_order_idx` ON `about_timeline` (`status`, `display_order`, `year`);
