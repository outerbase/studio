import { database } from "@/db/schema";
import { env } from "@/env";
import { decrypt } from "@/lib/encryption-edge";
import { createClient } from "@libsql/client/web";

export default async function createTursoEdgeClient(
  db: typeof database.$inferSelect
) {
  const url = db.host ?? "";
  const token = await decrypt(env.ENCRYPTION_KEY, db.token ?? "");

  return createClient({
    url,
    authToken: token,
  });
}
