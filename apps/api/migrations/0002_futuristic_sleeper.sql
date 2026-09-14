ALTER TABLE `clinic_settings` RENAME COLUMN "about_en" TO "short_about_en";--> statement-breakpoint
ALTER TABLE `clinic_settings` RENAME COLUMN "about_km" TO "short_about_km";--> statement-breakpoint
ALTER TABLE `clinic_settings` ADD `years_experience` integer;--> statement-breakpoint
ALTER TABLE `clinic_settings` ADD `successful_cases` integer;--> statement-breakpoint
ALTER TABLE `clinic_settings` ADD `patient_satisfaction` integer;