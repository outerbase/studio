import withDatabaseOperation from "@/lib/with-database-ops";
import { NextResponse } from "next/server";
import createTursoEdgeClient from "../turso-edge-client";

export const runtime = "edge";

export const GET = withDatabaseOperation(async function ({
  permission,
  database,
}) {
  const client = await createTursoEdgeClient(database);

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
