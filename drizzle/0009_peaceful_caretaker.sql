CREATE TABLE `dataset` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text,
	`source` text,
	`summary` text,
	`description` text,
	`used` integer DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
