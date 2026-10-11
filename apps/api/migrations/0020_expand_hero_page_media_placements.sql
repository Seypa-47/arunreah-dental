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
  `badge_en` text,
  `badge_km` text,
  `discount_en` text,
  `discount_km` text,
  `benefits_en` text,
  `benefits_km` text,
  `valid_until` text,
  `image_key` text NOT NULL,
  `display_order` integer DEFAULT 0 NOT NULL,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  `updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  CONSTRAINT `page_media_placement_check` CHECK(placement in ('HOME_PROMOTIONS', 'HOME_HERO', 'ABOUT_HERO', 'ABOUT_PROFESSIONAL_DEVELOPMENT', 'ABOUT_ADVANCED_FACILITIES', 'SERVICES_HERO', 'DOCTORS_HERO', 'DOCTORS_PATIENT_EDUCATION', 'BRANCHES_HERO', 'CONTACT_HERO', 'SHOWCASES_HERO', 'BOOKING_HERO')),
  CONSTRAINT `page_media_status_check` CHECK(status in ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);
--> statement-breakpoint
INSERT INTO `page_media_next` (`id`, `placement`, `status`, `title_en`, `title_km`, `body_en`, `body_km`, `badge_en`, `badge_km`, `discount_en`, `discount_km`, `benefits_en`, `benefits_km`, `valid_until`, `image_key`, `display_order`, `created_at`, `updated_at`)
SELECT `id`, `placement`, `status`, `title_en`, `title_km`, `body_en`, `body_km`, `badge_en`, `badge_km`, `discount_en`, `discount_km`, `benefits_en`, `benefits_km`, `valid_until`, `image_key`, `display_order`, `created_at`, `updated_at` FROM `page_media`;
--> statement-breakpoint
DROP TABLE `page_media`;
--> statement-breakpoint
ALTER TABLE `page_media_next` RENAME TO `page_media`;
--> statement-breakpoint
CREATE INDEX `page_media_placement_status_order_idx` ON `page_media` (`placement`, `status`, `display_order`);
--> statement-breakpoint
CREATE TRIGGER `block_locked_page_media_insert` BEFORE INSERT ON `page_media`
WHEN EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_page_media_update` BEFORE UPDATE OF `image_key` ON `page_media`
WHEN EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
