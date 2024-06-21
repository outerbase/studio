ALTER TABLE database_role ADD `is_owner` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE database_user_role ADD `created_by` text REFERENCES user(id);
