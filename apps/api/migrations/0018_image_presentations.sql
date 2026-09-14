CREATE TABLE `image_presentations` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_type` text NOT NULL,
  `owner_id` text NOT NULL,
  `slot` text DEFAULT 'PRIMARY' NOT NULL,
  `position_x` integer DEFAULT 50 NOT NULL,
  `position_y` integer DEFAULT 50 NOT NULL,
  `zoom` real DEFAULT 1 NOT NULL,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  `updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  CONSTRAINT `image_presentations_position_x_check` CHECK(position_x >= 0 and position_x <= 100),
  CONSTRAINT `image_presentations_position_y_check` CHECK(position_y >= 0 and position_y <= 100),
  CONSTRAINT `image_presentations_zoom_check` CHECK(zoom >= 1 and zoom <= 2)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `image_presentations_owner_slot_unique` ON `image_presentations` (`owner_type`, `owner_id`, `slot`);
--> statement-breakpoint
CREATE INDEX `image_presentations_owner_idx` ON `image_presentations` (`owner_type`, `owner_id`);
