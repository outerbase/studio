import { relations, sql } from "drizzle-orm";
import {
  blob,
  index,
  int,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export type DatabaseRoleType = "table";
export type DatabaseRoleAccess =
  | "write"
  | "read"
  | "delete"
  | "write-delete"
  | "column-read"
  | "column-denied";

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

export const database = sqliteTable(
  "database",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    name: text("name"),
    description: text("description"),
    color: text("color").default("gray"),
    driver: text("driver").default("turso"),
    host: text("host"),
    token: text("token"),
    createdAt: int("created_at"),
  },
  (table) => {
    return { databaseUserIdx: index("database_user_idx").on(table.userId) };
  }
);

export const database_role = sqliteTable(
  "database_role",
  {
    id: text("id").primaryKey(),
    databaseId: text("database_id")
      .notNull()
      .references(() => database.id),
    name: text("name"),
    canExecuteQuery: int("can_execute_query").default(0),
    isOwner: int("is_owner").default(0),
    createdBy: text("created_by").references(() => user.id),
    createdAt: int("created_at"),
    updatedBy: text("updated_by").references(() => user.id),
    updatedAt: int("updated_at"),
  },
  (table) => {
    return {
      databaseRoleIdx: index("database_role_idx").on(table.databaseId),
    };
  }
);

export const database_user_role = sqliteTable(
  "database_user_role",
  {
    userId: text("user_id").references(() => user.id),
    databaseId: text("database_id").references(() => database.id),
    roleId: text("role_id").references(() => database_role.id),
    createdAt: int("created_at"),
    createdBy: text("created_by").references(() => user.id),
  },
  (table) => {
    return { pk: primaryKey({ columns: [table.databaseId, table.userId] }) };
  }
);

export const database_role_permission = sqliteTable(
  "database_role_permission",
  {
    id: text("id").primaryKey(),
    roleId: text("role_id")
      .notNull()
      .references(() => database_role.id),

    type: text("role").$type<DatabaseRoleType>(),
    access: text("access").$type<DatabaseRoleAccess>(),
    tableName: text("table_name"),
    columnName: text("column_name"),

    createdBy: text("created_by").references(() => user.id),
    createdAt: int("created_at"),
    updatedBy: text("updated_by").references(() => user.id),
    updatedAt: int("updated_at"),
  },
  (table) => {
    return {
      databaseRoleIdx: index("role_permission_table_idx").on(
        table.roleId,
        table.tableName
      ),
    };
  }
);

export const databaseRoleRelation = relations(database_role, ({ many }) => {
  return { permissions: many(database_role_permission) };
});

export const databaseRolePermissionRelation = relations(
  database_role_permission,
  ({ one }) => {
    return {
      role: one(database_role, {
        fields: [database_role_permission.roleId],
        references: [database_role.id],
      }),
    };
  }
);
