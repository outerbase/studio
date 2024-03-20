import { sql } from "drizzle-orm";
import {
  blob,
  index,
  int,
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
  storageUsage: int("storage_usage").default(0),
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

export const user_file = sqliteTable(
  "user_file",
  {
    id: text("id").primaryKey(),
    user_id: text("user_id"),
    hashed: text("hashed"),
    path: text("path"),
    filename: text("filename"),
    size_in_byte: int("size_in_byte"),
    created_at: int("created_at"),
  },
  (table) => {
    return {
      userFileIdx: index("user_file_index").on(table.user_id, table.created_at),
    };
  }
);
