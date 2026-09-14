CREATE TABLE `service_detail_sections` (
  `id` text PRIMARY KEY NOT NULL,
  `service_id` text NOT NULL,
  `section_type` text DEFAULT 'TEXT' NOT NULL,
  `heading_en` text,
  `heading_km` text,
  `body_en` text,
  `body_km` text,
  `image_key` text,
  `display_order` integer DEFAULT 0 NOT NULL,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  `updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE cascade ON DELETE restrict,
  CONSTRAINT `service_detail_sections_type_check` CHECK(`section_type` in ('TEXT', 'IMAGE'))
);
--> statement-breakpoint
CREATE INDEX `service_detail_sections_service_id_idx` ON `service_detail_sections` (`service_id`);
--> statement-breakpoint
CREATE INDEX `service_detail_sections_service_order_idx` ON `service_detail_sections` (`service_id`, `display_order`);
