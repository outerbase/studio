import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./schema-user";

export const dbDataset = sqliteTable("dataset", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  name: text("name"),
  source: text("source"),
  summary: text("summary"),
  description: text("description"),
  used: int("used").default(0),
  createdAt: int("created_at"),
});
