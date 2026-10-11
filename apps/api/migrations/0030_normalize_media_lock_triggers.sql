-- Forward-only correction for the duplicate lowercase-sentinel triggers added
-- by 0029. Existing canonical triggers from 0019/0020/0025 remain in place.
DROP TRIGGER IF EXISTS `clinic_settings_media_lock_insert`;
DROP TRIGGER IF EXISTS `clinic_settings_media_lock_update`;
DROP TRIGGER IF EXISTS `branches_media_lock_insert`;
DROP TRIGGER IF EXISTS `branches_media_lock_update`;
DROP TRIGGER IF EXISTS `services_media_lock_insert`;
DROP TRIGGER IF EXISTS `services_media_lock_update`;
DROP TRIGGER IF EXISTS `doctors_media_lock_insert`;
DROP TRIGGER IF EXISTS `doctors_media_lock_update`;
DROP TRIGGER IF EXISTS `showcases_media_lock_insert`;
DROP TRIGGER IF EXISTS `showcases_media_lock_update`;
DROP TRIGGER IF EXISTS `service_sections_media_lock_insert`;
DROP TRIGGER IF EXISTS `service_sections_media_lock_update`;
DROP TRIGGER IF EXISTS `showcase_sections_media_lock_insert`;
DROP TRIGGER IF EXISTS `showcase_sections_media_lock_update`;
DROP TRIGGER IF EXISTS `page_media_lock_insert`;
DROP TRIGGER IF EXISTS `page_media_lock_update`;
--> statement-breakpoint
CREATE TRIGGER `block_locked_clinic_media_insert` BEFORE INSERT ON `clinic_settings`
WHEN NEW.logo_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.logo_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_service_section_media_update` BEFORE UPDATE OF `image_key` ON `service_detail_sections`
WHEN NEW.image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
--> statement-breakpoint
CREATE TRIGGER `block_locked_showcase_section_media_update` BEFORE UPDATE OF `image_key` ON `showcase_sections`
WHEN NEW.image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key)
BEGIN SELECT RAISE(ABORT, 'MEDIA_DELETION_IN_PROGRESS'); END;
