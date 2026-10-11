ALTER TABLE `contact_settings` RENAME COLUMN "email" TO "primary_email";--> statement-breakpoint
ALTER TABLE `contact_settings` RENAME COLUMN "opening_hours_en" TO "business_hours_en";--> statement-breakpoint
ALTER TABLE `contact_settings` RENAME COLUMN "opening_hours_km" TO "business_hours_km";--> statement-breakpoint
ALTER TABLE `contact_settings` RENAME COLUMN "map_url" TO "main_google_maps_url";--> statement-breakpoint
ALTER TABLE `contact_settings` ADD `instagram_url` text;