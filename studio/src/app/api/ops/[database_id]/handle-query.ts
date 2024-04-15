import { DatabaseOperationHandler } from "@studio/lib/with-database-ops";
import { NextResponse } from "next/server";
import { createTursoEdgeDriver } from "./turso-edge-client";
import { RequestOperationQuery } from "@studio/lib/api/api-request-types";

const handleQueryRequest: DatabaseOperationHandler<
  RequestOperationQuery
> = async ({ permission, database, body }) => {
  if (!permission.canExecuteQuery) {
    return NextResponse.json(
      {
        error: "No permission to execute query",
      },
      { status: 500 }
    );
  }

  const client = await createTursoEdgeDriver(database);

  try {
    return NextResponse.json({
      data: await client.query(body.statement),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message });
  }
};

export default handleQueryRequest;
