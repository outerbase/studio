import { env } from "@/env";
import { decrypt } from "@/lib/encryption-edge";
import withDatabaseOperation from "@/lib/with-database-ops";
import { createClient } from "@libsql/client/web";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const GET = withDatabaseOperation(async function ({
  permission,
  database,
}) {
  const url = database.host ?? "";
  const token = await decrypt(env.ENCRYPTION_KEY, database.token ?? "");

  const client = createClient({
    url,
    authToken: token,
  });

  try {
    const result = await client.execute("SELECT * FROM sqlite_schema;");
    let tables = result.rows
      .filter((row) => row.type === "table")
      .map((row) => {
        return {
          name: row.name as string,
        };
      });

    // If you don't have permssion to execute query
    // We will only allow you to see tables that
    // you have permission to
    if (!permission.canExecuteQuery) {
      const allowedTables = new Set(permission.roles.map((t) => t.tableName));
      tables = tables.filter((table) => allowedTables.has(table.name));
    }

    return NextResponse.json({
      data: tables,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message });
  }
});
