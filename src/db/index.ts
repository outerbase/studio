import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { createClient } from "@libsql/client/web";
import { env } from "@/env";

export function get_connection() {
  if (env.DATABASE_URL) {
    return createClient({
      url: env.DATABASE_URL,
      authToken: env.DATABASE_AUTH_TOKEN,
    });
  }

  throw new Error("Database is not setup");
}

export function get_database() {
  return drizzle(get_connection(), { schema });
}
