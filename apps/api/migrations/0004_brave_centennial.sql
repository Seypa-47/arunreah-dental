ALTER TABLE `branches` RENAME COLUMN "map_url" TO "google_maps_url";--> statement-breakpoint
ALTER TABLE `branches` ADD `badge_en` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `badge_km` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `city_province` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `short_location_label_en` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `short_location_label_km` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `opening_days_en` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `opening_days_km` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `opening_time` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `closing_time` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `secondary_phone` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `branch_image_key` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `hero_supporting_text_en` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `hero_supporting_text_km` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `hero_cta_label_en` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `hero_cta_label_km` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `short_summary_en` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `short_summary_km` text;--> statement-breakpoint
ALTER TABLE `branches` ADD `featured` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `branches` ADD `accepts_appointments` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `branches` ADD `show_on_branches_page` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `branches` ADD `show_on_homepage` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `branches` ADD `include_in_homepage_hero` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `branches_public_page_idx` ON `branches` (`status`,`show_on_branches_page`,`display_order`);