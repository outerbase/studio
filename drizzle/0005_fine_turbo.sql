CREATE TABLE `user_file` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`hashed` text,
	`path` text,
	`filename` text,
	`size_in_byte` integer,
	`created_at` integer
);
--> statement-breakpoint
ALTER TABLE user ADD `storage_usage` integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX `user_file_index` ON `user_file` (`user_id`,`created_at`);