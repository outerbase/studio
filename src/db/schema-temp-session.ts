import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const dbTempSession = sqliteTable("temp_session", {
  id: text("id").primaryKey(),
  driver: text("driver"),
  name: text("name"),
  credential: text("credential"),
  expiredAt: int("exired_at"),
  createdAt: int("created_at"),
});
