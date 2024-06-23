CREATE TABLE `database` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text,
	`description` text,
	`color` text DEFAULT 'gray',
	`driver` text DEFAULT 'turso',
	`host` text,
	`token` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `database_role` (
	`id` text PRIMARY KEY NOT NULL,
	`database_id` text NOT NULL,
	`name` text,
	`can_execute_query` integer DEFAULT 0,
	`created_by` text,
	`created_at` integer,
	`updated_by` text,
	`updated_at` integer,
	FOREIGN KEY (`database_id`) REFERENCES `database`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `database_role_permission` (
	`id` text PRIMARY KEY NOT NULL,
	`role_id` text NOT NULL,
	`role` text,
	`access` text,
	`table_name` text,
	`column_name` text,
	`created_by` text,
	`created_at` integer,
	`updated_by` text,
	`updated_at` integer,
	FOREIGN KEY (`role_id`) REFERENCES `database_role`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `database_user_role` (
	`user_id` text,
	`database_id` text,
	`role_id` text,
	`created_at` integer,
	PRIMARY KEY(`database_id`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`database_id`) REFERENCES `database`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `database_role`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `database_user_idx` ON `database` (`user_id`);--> statement-breakpoint
CREATE INDEX `database_role_idx` ON `database_role` (`database_id`);--> statement-breakpoint
CREATE INDEX `role_permission_table_idx` ON `database_role_permission` (`role_id`,`table_name`);