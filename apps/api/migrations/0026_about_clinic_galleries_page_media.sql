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
  CONSTRAINT `page_media_placement_check` CHECK(placement in ('HOME_PROMOTIONS', 'HOME_HERO', 'ABOUT_HERO', 'ABOUT_CLINIC_GALLERY_PSA_CHAS', 'ABOUT_CLINIC_GALLERY_TOUL_TOMPOUNG', 'ABOUT_PROFESSIONAL_DEVELOPMENT', 'ABOUT_ADVANCED_FACILITIES', 'SERVICES_HERO', 'DOCTORS_HERO', 'DOCTORS_PATIENT_EDUCATION', 'BRANCHES_HERO', 'CONTACT_HERO', 'SHOWCASES_HERO', 'BOOKING_HERO')),
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

-- Preserve the two existing clinic tours by copying their cover photos and the
-- first three image sections into their new, dedicated Page Media galleries.
INSERT OR IGNORE INTO `page_media` (`id`, `placement`, `status`, `title_en`, `title_km`, `image_key`, `display_order`, `created_at`, `updated_at`)
SELECT
  'about-gallery-psa-chas-cover',
  'ABOUT_CLINIC_GALLERY_PSA_CHAS',
  CASE WHEN `status` = 'PUBLISHED' THEN 'PUBLISHED' ELSE 'DRAFT' END,
  'Clinic Exterior',
  'ទិដ្ឋភាពខាងក្រៅនៃគ្លីនិក',
  `cover_image_key`,
  0,
  `created_at`,
  `updated_at`
FROM `showcases`
WHERE `id` = '50000000-0000-4000-8000-000000000004' AND `cover_image_key` IS NOT NULL;
--> statement-breakpoint
INSERT OR IGNORE INTO `page_media` (`id`, `placement`, `status`, `title_en`, `title_km`, `image_key`, `display_order`, `created_at`, `updated_at`)
SELECT
  'about-gallery-toul-tompoung-cover',
  'ABOUT_CLINIC_GALLERY_TOUL_TOMPOUNG',
  CASE WHEN `status` = 'PUBLISHED' THEN 'PUBLISHED' ELSE 'DRAFT' END,
  'Clinic Exterior',
  'ទិដ្ឋភាពខាងក្រៅនៃគ្លីនិក',
  `cover_image_key`,
  0,
  `created_at`,
  `updated_at`
FROM `showcases`
WHERE `id` = '50000000-0000-4000-8000-000000000003' AND `cover_image_key` IS NOT NULL;
--> statement-breakpoint
INSERT OR IGNORE INTO `page_media` (`id`, `placement`, `status`, `title_en`, `title_km`, `image_key`, `display_order`, `created_at`, `updated_at`)
SELECT
  'about-gallery-' || CASE WHEN ss.`showcase_id` = '50000000-0000-4000-8000-000000000004' THEN 'psa-chas-' ELSE 'toul-tompoung-' END || ss.`id`,
  CASE WHEN ss.`showcase_id` = '50000000-0000-4000-8000-000000000004' THEN 'ABOUT_CLINIC_GALLERY_PSA_CHAS' ELSE 'ABOUT_CLINIC_GALLERY_TOUL_TOMPOUNG' END,
  CASE WHEN s.`status` = 'PUBLISHED' THEN 'PUBLISHED' ELSE 'DRAFT' END,
  ss.`heading_en`,
  ss.`heading_km`,
  ss.`image_key`,
  1 + (
    SELECT COUNT(*) FROM `showcase_sections` earlier
    WHERE earlier.`showcase_id` = ss.`showcase_id`
      AND earlier.`image_key` IS NOT NULL
      AND (earlier.`display_order` < ss.`display_order` OR (earlier.`display_order` = ss.`display_order` AND earlier.`id` < ss.`id`))
  ),
  ss.`created_at`,
  ss.`updated_at`
FROM `showcase_sections` ss
JOIN `showcases` s ON s.`id` = ss.`showcase_id`
WHERE ss.`showcase_id` IN ('50000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000004')
  AND ss.`image_key` IS NOT NULL
  AND (
    SELECT COUNT(*) FROM `showcase_sections` earlier
    WHERE earlier.`showcase_id` = ss.`showcase_id`
      AND earlier.`image_key` IS NOT NULL
      AND (earlier.`display_order` < ss.`display_order` OR (earlier.`display_order` = ss.`display_order` AND earlier.`id` < ss.`id`))
  ) < 3;
--> statement-breakpoint

INSERT OR IGNORE INTO `image_presentations` (`id`, `owner_type`, `owner_id`, `slot`, `position_x`, `position_y`, `zoom`, `created_at`, `updated_at`)
SELECT
  'about-gallery-presentation-' || ip.`id`,
  'PAGE_MEDIA',
  CASE WHEN ip.`owner_id` = '50000000-0000-4000-8000-000000000004' THEN 'about-gallery-psa-chas-cover' ELSE 'about-gallery-toul-tompoung-cover' END,
  'PRIMARY',
  ip.`position_x`, ip.`position_y`, ip.`zoom`, ip.`created_at`, ip.`updated_at`
FROM `image_presentations` ip
WHERE ip.`owner_type` = 'SHOWCASE'
  AND ip.`owner_id` IN ('50000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000004');
--> statement-breakpoint
INSERT OR IGNORE INTO `image_presentations` (`id`, `owner_type`, `owner_id`, `slot`, `position_x`, `position_y`, `zoom`, `created_at`, `updated_at`)
SELECT
  'about-gallery-presentation-' || ip.`id`,
  'PAGE_MEDIA',
  pm.`id`,
  'PRIMARY',
  ip.`position_x`, ip.`position_y`, ip.`zoom`, ip.`created_at`, ip.`updated_at`
FROM `image_presentations` ip
JOIN `showcase_sections` ss ON ss.`id` = ip.`owner_id`
JOIN `page_media` pm ON pm.`id` = 'about-gallery-' || CASE WHEN ss.`showcase_id` = '50000000-0000-4000-8000-000000000004' THEN 'psa-chas-' ELSE 'toul-tompoung-' END || ss.`id`
WHERE ip.`owner_type` = 'SHOWCASE_SECTION'
  AND ss.`showcase_id` IN ('50000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000004');
--> statement-breakpoint
PRAGMA foreign_keys=ON;
