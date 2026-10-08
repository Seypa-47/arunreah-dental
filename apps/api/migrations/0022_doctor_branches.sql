CREATE TABLE `doctor_branches` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`branch_id` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `doctor_branches_unique` ON `doctor_branches` (`doctor_id`, `branch_id`);--> statement-breakpoint
CREATE INDEX `doctor_branches_doctor_id_idx` ON `doctor_branches` (`doctor_id`);--> statement-breakpoint
CREATE INDEX `doctor_branches_branch_id_idx` ON `doctor_branches` (`branch_id`);
