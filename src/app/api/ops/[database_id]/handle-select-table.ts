import { DatabaseOperationHandler } from "@/lib/with-database-ops";
import { NextResponse } from "next/server";
import { createTursoEdgeDriver } from "./turso-edge-client";
import { RequestOperationSelectTable } from "@/lib/api/api-request-types";

const handleSelectTableRequest: DatabaseOperationHandler<
  RequestOperationSelectTable
> = async ({ database, body, permission }) => {
  const client = await createTursoEdgeDriver(database);

  if (body.whereRaw && !permission.canExecuteQuery) {
    return NextResponse.json(
      {
        error: "No permission to execute query",
      },
      { status: 500 }
    );
  }

  try {
    return NextResponse.json(
      await client.selectTable(body.tableName, {
        limit: body.limit,
        offset: body.offset,
        whereRaw: body.whereRaw,
      })
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message });
  }
};

export default handleSelectTableRequest;
