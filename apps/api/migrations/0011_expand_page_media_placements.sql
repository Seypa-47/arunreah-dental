PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `page_media_next` (
  `id` text PRIMARY KEY NOT NULL,
  `placement` text NOT NULL,
  `status` text DEFAULT 'DRAFT' NOT NULL,
  `title_en` text,
  `title_km` text,
  `body_en` text,
  `body_km` text,
  `image_key` text NOT NULL,
  `display_order` integer DEFAULT 0 NOT NULL,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  `updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  CONSTRAINT `page_media_placement_check` CHECK(placement in ('ABOUT_PROFESSIONAL_DEVELOPMENT', 'DOCTORS_HERO', 'DOCTORS_PATIENT_EDUCATION')),
  CONSTRAINT `page_media_status_check` CHECK(status in ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);
--> statement-breakpoint
INSERT INTO `page_media_next` (`id`, `placement`, `status`, `title_en`, `title_km`, `body_en`, `body_km`, `image_key`, `display_order`, `created_at`, `updated_at`)
SELECT `id`, `placement`, `status`, `title_en`, `title_km`, `body_en`, `body_km`, `image_key`, `display_order`, `created_at`, `updated_at` FROM `page_media`;
--> statement-breakpoint
DROP TABLE `page_media`;
--> statement-breakpoint
ALTER TABLE `page_media_next` RENAME TO `page_media`;
--> statement-breakpoint
CREATE INDEX `page_media_placement_status_order_idx` ON `page_media` (`placement`, `status`, `display_order`);
--> statement-breakpoint
PRAGMA foreign_keys=ON;
