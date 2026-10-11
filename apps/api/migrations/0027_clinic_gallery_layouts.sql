CREATE TABLE `page_media_collection_settings` (
	`placement` text PRIMARY KEY NOT NULL,
	`layout` text DEFAULT 'MOSAIC' NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	CONSTRAINT `page_media_collection_settings_placement_check` CHECK(placement in ('ABOUT_CLINIC_GALLERY_PSA_CHAS', 'ABOUT_CLINIC_GALLERY_TOUL_TOMPOUNG')),
	CONSTRAINT `page_media_collection_settings_layout_check` CHECK(layout in ('MOSAIC', 'GRID', 'FEATURED_LEFT', 'FEATURED_TOP'))
);
--> statement-breakpoint
INSERT OR IGNORE INTO `page_media_collection_settings` (`placement`, `layout`)
VALUES
	('ABOUT_CLINIC_GALLERY_PSA_CHAS', 'MOSAIC'),
	('ABOUT_CLINIC_GALLERY_TOUL_TOMPOUNG', 'MOSAIC');
