import { DatabaseOperationHandler } from "@studio/lib/with-database-ops";
import { NextResponse } from "next/server";
import { createTursoEdgeDriver } from "./turso-edge-client";
import { RequestOperationSchema } from "@studio/lib/api/api-request-types";

const handleSchemaRequest: DatabaseOperationHandler<
  RequestOperationSchema
> = async ({ database, body }) => {
  const client = await createTursoEdgeDriver(database);

  try {
    return NextResponse.json({
      data: await client.tableSchema(body.tableName),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message });
  }
};

export default handleSchemaRequest;
