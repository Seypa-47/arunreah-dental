CREATE TABLE `page_media` (
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
  CONSTRAINT `page_media_placement_check` CHECK(placement in ('ABOUT_PROFESSIONAL_DEVELOPMENT', 'DOCTORS_PATIENT_EDUCATION')),
  CONSTRAINT `page_media_status_check` CHECK(status in ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);
--> statement-breakpoint
CREATE INDEX `page_media_placement_status_order_idx` ON `page_media` (`placement`, `status`, `display_order`);
