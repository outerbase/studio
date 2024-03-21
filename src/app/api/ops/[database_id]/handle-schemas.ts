import { DatabaseOperationHandler } from "@/lib/with-database-ops";
import { NextResponse } from "next/server";
import { createTursoEdgeDriver } from "./turso-edge-client";

const handleSchemasRequest: DatabaseOperationHandler = async ({
  permission,
  database,
}) => {
  const client = await createTursoEdgeDriver(database);

  try {
    let tables = await client.schemas();

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
};

export default handleSchemasRequest;
