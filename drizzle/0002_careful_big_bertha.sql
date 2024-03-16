CREATE TABLE `database` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text,
	`description` text,
	`color` text DEFAULT 'gray',
	`driver` text DEFAULT 'turso',
	`host` text,
	`token` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
