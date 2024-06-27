CREATE TABLE `temp_session` (
	`id` text PRIMARY KEY NOT NULL,
	`driver` text,
	`name` text,
	`credential` text,
	`exired_at` integer,
	`created_at` integer
);
