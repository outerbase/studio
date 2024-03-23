import { database } from "@/db/schema";
import TursoDriver from "@/drivers/turso-driver";
import { env } from "@/env";
import { decrypt } from "@/lib/encryption-edge";

export async function createTursoEdgeDriver(db: typeof database.$inferSelect) {
  const url = db.host ?? "";
  const token = await decrypt(env.ENCRYPTION_KEY, db.token ?? "");
  return new TursoDriver(url, token);
}
