import withDatabaseOperation from "@/lib/with-database-ops";
import { NextResponse } from "next/server";
import createTursoEdgeClient from "../turso-edge-client";

export const runtime = "edge";

export const POST = withDatabaseOperation<{
  sql: string;
  args: (string | number)[];
}>(async function ({ permission, database, body }) {
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
    return NextResponse.json({
      data: await client.execute({ sql: body.sql, args: body.args ?? [] }),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message });
  }
});
