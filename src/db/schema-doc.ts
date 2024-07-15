import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { database } from "./schema-database";
import { user } from "./schema-user";

export const dbDocNamespace = sqliteTable(
  "doc_namespace",
  {
    id: text("id").primaryKey(),
    databaseId: text("database_id").references(() => database.id),
    userId: text("user_id").references(() => user.id),
    name: text("name"),
    updatedAt: int("updated_at"),
    createdAt: int("created_at"),
  },
  (table) => {
    return {
      docNamespaceDatabaseIndex: index("doc_namespace_database_idx").on(
        table.databaseId
      ),
    };
  }
);

export const dbDoc = sqliteTable(
  "doc",
  {
    id: text("id").primaryKey(),
    namespaceId: text("namespace_id").references(() => dbDocNamespace.id),
    userId: text("user_id").references(() => user.id),
    name: text("name"),
    type: text("type"),
    content: text("content"),
    lastUsedAt: int("last_used_at"),
    updatedAt: int("updated_at"),
    createdAt: int("created_at"),
  },
  (table) => {
    return {
      docNamespaceIndex: index("doc_namespace_idx").on(table.namespaceId),
    };
  }
);
