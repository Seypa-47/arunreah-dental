ALTER TABLE `appointments` ADD `request_fingerprint` text;

-- A deletion lock and each reference write are checked by SQLite itself, closing
-- the race between the Worker checking references and deleting an R2 object.
CREATE TRIGGER `clinic_settings_media_lock_insert` BEFORE INSERT ON `clinic_settings`
BEGIN
  SELECT CASE WHEN NEW.logo_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.logo_key)
    THEN RAISE(ABORT, 'media deletion in progress') END;
END;
CREATE TRIGGER `clinic_settings_media_lock_update` BEFORE UPDATE OF logo_key ON `clinic_settings`
BEGIN
  SELECT CASE WHEN NEW.logo_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.logo_key)
    THEN RAISE(ABORT, 'media deletion in progress') END;
END;

CREATE TRIGGER `branches_media_lock_insert` BEFORE INSERT ON `branches`
BEGIN
  SELECT CASE WHEN EXISTS (SELECT 1 FROM media_deletion_locks WHERE key IN (NEW.hero_image_key, NEW.branch_image_key))
    THEN RAISE(ABORT, 'media deletion in progress') END;
END;
CREATE TRIGGER `branches_media_lock_update` BEFORE UPDATE OF hero_image_key, branch_image_key ON `branches`
BEGIN
  SELECT CASE WHEN EXISTS (SELECT 1 FROM media_deletion_locks WHERE key IN (NEW.hero_image_key, NEW.branch_image_key))
    THEN RAISE(ABORT, 'media deletion in progress') END;
END;

CREATE TRIGGER `services_media_lock_insert` BEFORE INSERT ON `services`
BEGIN
  SELECT CASE WHEN EXISTS (SELECT 1 FROM media_deletion_locks WHERE key IN (NEW.image_key, NEW.hero_image_key, NEW.about_image_key))
    THEN RAISE(ABORT, 'media deletion in progress') END;
END;
CREATE TRIGGER `services_media_lock_update` BEFORE UPDATE OF image_key, hero_image_key, about_image_key ON `services`
BEGIN
  SELECT CASE WHEN EXISTS (SELECT 1 FROM media_deletion_locks WHERE key IN (NEW.image_key, NEW.hero_image_key, NEW.about_image_key))
    THEN RAISE(ABORT, 'media deletion in progress') END;
END;

CREATE TRIGGER `doctors_media_lock_insert` BEFORE INSERT ON `doctors`
BEGIN SELECT CASE WHEN NEW.photo_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.photo_key) THEN RAISE(ABORT, 'media deletion in progress') END; END;
CREATE TRIGGER `doctors_media_lock_update` BEFORE UPDATE OF photo_key ON `doctors`
BEGIN SELECT CASE WHEN NEW.photo_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.photo_key) THEN RAISE(ABORT, 'media deletion in progress') END; END;
CREATE TRIGGER `showcases_media_lock_insert` BEFORE INSERT ON `showcases`
BEGIN SELECT CASE WHEN NEW.cover_image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.cover_image_key) THEN RAISE(ABORT, 'media deletion in progress') END; END;
CREATE TRIGGER `showcases_media_lock_update` BEFORE UPDATE OF cover_image_key ON `showcases`
BEGIN SELECT CASE WHEN NEW.cover_image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.cover_image_key) THEN RAISE(ABORT, 'media deletion in progress') END; END;
CREATE TRIGGER `service_sections_media_lock_insert` BEFORE INSERT ON `service_detail_sections`
BEGIN SELECT CASE WHEN NEW.image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key) THEN RAISE(ABORT, 'media deletion in progress') END; END;
CREATE TRIGGER `service_sections_media_lock_update` BEFORE UPDATE OF image_key ON `service_detail_sections`
BEGIN SELECT CASE WHEN NEW.image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key) THEN RAISE(ABORT, 'media deletion in progress') END; END;
CREATE TRIGGER `showcase_sections_media_lock_insert` BEFORE INSERT ON `showcase_sections`
BEGIN SELECT CASE WHEN NEW.image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key) THEN RAISE(ABORT, 'media deletion in progress') END; END;
CREATE TRIGGER `showcase_sections_media_lock_update` BEFORE UPDATE OF image_key ON `showcase_sections`
BEGIN SELECT CASE WHEN NEW.image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key) THEN RAISE(ABORT, 'media deletion in progress') END; END;
CREATE TRIGGER `page_media_lock_insert` BEFORE INSERT ON `page_media`
BEGIN SELECT CASE WHEN NEW.image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key) THEN RAISE(ABORT, 'media deletion in progress') END; END;
CREATE TRIGGER `page_media_lock_update` BEFORE UPDATE OF image_key ON `page_media`
BEGIN SELECT CASE WHEN NEW.image_key IS NOT NULL AND EXISTS (SELECT 1 FROM media_deletion_locks WHERE key = NEW.image_key) THEN RAISE(ABORT, 'media deletion in progress') END; END;
