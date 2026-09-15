CREATE TABLE `media_deletion_locks` (
  `key` text PRIMARY KEY NOT NULL,
  `created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TRIGGER `block_locked_clinic_media_update` BEFORE UPDATE OF `logo_key` ON `clinic_settings`
WHEN NEW.logo_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.logo_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_branch_media_insert` BEFORE INSERT ON `branches`
WHEN (NEW.hero_image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.hero_image_key)) OR (NEW.branch_image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.branch_image_key))
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_branch_media_update` BEFORE UPDATE OF `hero_image_key`, `branch_image_key` ON `branches`
WHEN (NEW.hero_image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.hero_image_key)) OR (NEW.branch_image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.branch_image_key))
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_service_media_insert` BEFORE INSERT ON `services`
WHEN (NEW.image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key)) OR (NEW.hero_image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.hero_image_key)) OR (NEW.about_image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.about_image_key))
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_service_media_update` BEFORE UPDATE OF `image_key`, `hero_image_key`, `about_image_key` ON `services`
WHEN (NEW.image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key)) OR (NEW.hero_image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.hero_image_key)) OR (NEW.about_image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.about_image_key))
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_doctor_media_insert` BEFORE INSERT ON `doctors`
WHEN NEW.photo_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.photo_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_doctor_media_update` BEFORE UPDATE OF `photo_key` ON `doctors`
WHEN NEW.photo_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.photo_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_showcase_media_insert` BEFORE INSERT ON `showcases`
WHEN NEW.cover_image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.cover_image_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_showcase_media_update` BEFORE UPDATE OF `cover_image_key` ON `showcases`
WHEN NEW.cover_image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.cover_image_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_service_section_media_insert` BEFORE INSERT ON `service_detail_sections`
WHEN NEW.image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_showcase_section_media_insert` BEFORE INSERT ON `showcase_sections`
WHEN NEW.image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_page_media_insert` BEFORE INSERT ON `page_media`
WHEN EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_page_media_update` BEFORE UPDATE OF `image_key` ON `page_media`
WHEN EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
