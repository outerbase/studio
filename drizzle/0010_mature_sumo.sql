CREATE TABLE `doc` (
	`id` text PRIMARY KEY NOT NULL,
	`namespace_id` text,
	`user_id` text,
	`name` text,
	`type` text,
	`content` text,
	`last_used_at` integer,
	`updated_at` integer,
	`created_at` integer,
	FOREIGN KEY (`namespace_id`) REFERENCES `doc_namespace`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `doc_namespace` (
	`id` text PRIMARY KEY NOT NULL,
	`database_id` text,
	`user_id` text,
	`name` text,
	`updated_at` integer,
	`created_at` integer,
	FOREIGN KEY (`database_id`) REFERENCES `database`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `doc_namespace_idx` ON `doc` (`namespace_id`);--> statement-breakpoint
CREATE INDEX `doc_namespace_database_idx` ON `doc_namespace` (`database_id`);