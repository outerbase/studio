import { DatabaseOperationHandler } from "@studio/lib/with-database-ops";
import { NextResponse } from "next/server";
import { createTursoEdgeDriver } from "./turso-edge-client";
import { RequestOperationTrigger } from "@studio/lib/api/api-request-types";

const handleTriggerRequest: DatabaseOperationHandler<
  RequestOperationTrigger
> = async ({ database, body }) => {
  const client = await createTursoEdgeDriver(database);

  try {
    return NextResponse.json({
      data: await client.trigger(body.name),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message });
  }
};

export default handleTriggerRequest;
