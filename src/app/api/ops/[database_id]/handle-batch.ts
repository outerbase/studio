import { DatabaseOperationHandler } from "@/lib/with-database-ops";
import { NextResponse } from "next/server";
import { createTursoEdgeDriver } from "./turso-edge-client";
import { RequestOperationBatch } from "@/lib/api/api-request-types";

const handleBatchRequest: DatabaseOperationHandler<
  RequestOperationBatch
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
      data: await client.transaction(body.statements),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message });
  }
};

export default handleBatchRequest;
