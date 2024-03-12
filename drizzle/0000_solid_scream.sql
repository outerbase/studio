CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`picture` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_auth` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`provider` text,
	`provider_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`auth_id` text,
	`user_agent` text,
	`expires_at` blob NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_auth_provider_provider_id_unique` ON `user_auth` (`provider`,`provider_id`);--> statement-breakpoint
CREATE INDEX `user_session_expire_idx` ON `user_session` (`expires_at`);--> statement-breakpoint
CREATE INDEX `user_session_auth_id_idx` ON `user_session` (`auth_id`);