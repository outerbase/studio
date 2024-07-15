import { createClient } from "@libsql/client/node";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./../db/schema";
import { migrate } from "drizzle-orm/libsql/migrator";
import { sql } from "drizzle-orm";
import { generateId } from "lucia";

let TOKEN_CURRENT: string | undefined = undefined;

const conn = createClient({
  url: ":memory:",
});

const db = drizzle(conn, { schema });

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: (name: string) => {
      if (name === "auth_session") {
        return { value: TOKEN_CURRENT };
      }
      return;
    },
  })),
  headers: jest.fn(() => ({
    get: () => undefined,
  })),
}));

jest.mock("./../db", () => {
  return {
    get_connection: () => {
      return conn;
    },
    get_database: () => {
      return db;
    },
  };
});

jest.mock("./../env", () => {
  return { env: { DATABASE_URL: ":memory:" } };
});

jest.mock("react", () => {
  const originalModule = jest.requireActual("react");
  return {
    ...originalModule,
    cache: (v: any) => v,
  };
});

export async function setupTestDatabase() {
  await migrate(db, { migrationsFolder: "./drizzle" });
}

export async function makeTestUser({
  id,
  sessionToken,
}: {
  id: string;
  sessionToken?: string;
}): Promise<typeof schema.user.$inferSelect> {
  const data = {
    id,
    createdAt: "2024-03-10 05:39:45",
    email: "testing@gmail.com",
    name: "test",
    picture: "",
    storageUsage: 0,
  };

  const oauthId = generateId(15);
  const oauthData = {
    id: oauthId,
    createdAt: "2024-03-10 05:39:45",
    provider: "github",
    providerId: oauthId,
    userId: id,
  };

  await db.batch([
    db.insert(schema.user).values(data),
    db.insert(schema.user_oauth).values(oauthData),
  ]);

  if (sessionToken) {
    const now = Math.floor(Date.now() / 1000);
    const sessionData = {
      expiresAt: sql`${now + 100000}`,
      id: sessionToken,
      userId: id,
      authId: oauthId,
      userAgent: "",
    };

    await db.insert(schema.user_session).values(sessionData);
  }

  return data;
}

export async function makeTestDatabase(
  user: typeof schema.user.$inferSelect,
  { id }: { id: string }
): Promise<typeof schema.database.$inferSelect> {
  const now = Math.floor(Date.now() / 1000);

  const data: typeof schema.database.$inferSelect = {
    color: "gray",
    createdAt: now,
    description: "",
    driver: "turso",
    host: "http://localhost:8080",
    name: "hello",
    id: id,
    userId: user.id,
    deletedAt: null,
    password: null,
    token: null,
    username: null,
  };

  const roleId = generateId(15);
  const role = {
    databaseId: id,
    id: roleId,
    canExecuteQuery: 1,
    createdAt: now,
    updatedAt: now,
    createdBy: user.id,
    updatedBy: user.id,
    isOwner: 1,
    name: "Owner",
  };

  const userRole = {
    createdAt: now,
    createdBy: user.id,
    databaseId: id,
    roleId: roleId,
    userId: user.id,
  };

  await db.batch([
    db.insert(schema.database).values(data),
    db.insert(schema.database_role).values(role),
    db.insert(schema.database_user_role).values(userRole),
  ]);

  return data;
}

export async function makeTestNamespace(
  user: typeof schema.user.$inferSelect,
  databaseData: typeof schema.database.$inferSelect,
  input: { id: string; name: string }
): Promise<typeof schema.dbDocNamespace.$inferSelect> {
  const now = Math.floor(Date.now() / 1000);

  const data: typeof schema.dbDocNamespace.$inferSelect = {
    createdAt: now,
    updatedAt: now,
    databaseId: databaseData.id,
    id: input.id,
    name: input.name,
    userId: user.id,
  };

  await db.insert(schema.dbDocNamespace).values(data);
  return data;
}

export function mockToken(token: string) {
  TOKEN_CURRENT = token;
}
