import { sql } from "drizzle-orm";
import {
  blob,
  index,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  picture: text("picture"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  email: text("email"),
});

export const user_session = sqliteTable(
  "user_session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    authId: text("auth_id"),
    userAgent: text("user_agent"),
    expiresAt: blob("expires_at", { mode: "bigint" }).notNull(),
  },
  (table) => ({
    expireIdx: index("user_session_expire_idx").on(table.expiresAt),
    authIdx: index("user_session_auth_id_idx").on(table.authId),
  })
);

export const user_oauth = sqliteTable(
  "user_auth",
  {
    id: text("id").primaryKey(),
    userId: text("user_id"),
    provider: text("provider"),
    providerId: text("provider_id"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    providerUniqueId: unique().on(table.provider, table.providerId),
  })
);
