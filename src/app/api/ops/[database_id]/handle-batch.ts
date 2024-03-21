import { DatabaseOperationHandler } from "@/lib/with-database-ops";
import { NextResponse } from "next/server";
import createTursoEdgeClient from "./turso-edge-client";
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

  const client = await createTursoEdgeClient(database);

  try {
    return NextResponse.json({ data: await client.batch(body.statements) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message });
  }
};

export default handleBatchRequest;
