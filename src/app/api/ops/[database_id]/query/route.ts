import { env } from "@/env";
import { decrypt } from "@/lib/encryption";
import withDatabaseOperation from "@/lib/with-database-ops";
import { createClient } from "@libsql/client/web";
import { NextResponse } from "next/server";

export const POST = withDatabaseOperation<{ sql: string }>(async function ({
  permission,
  database,
  body,
}) {
  if (!permission.canExecuteQuery) {
    return NextResponse.json(
      {
        error: "No permission to execute query",
      },
      { status: 500 }
    );
  }

  const key = Buffer.from(env.ENCRYPTION_KEY, "base64");
  const url = decrypt(key, database.host ?? "");
  const token = decrypt(key, database.token ?? "");

  const client = createClient({
    url,
    authToken: token,
  });

  return NextResponse.json(await client.execute(body.sql));
});
