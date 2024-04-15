import { database } from "@studio/db/schema";
import RqliteDriver from "@studio/drivers/rqlite-driver";
import TursoDriver from "@studio/drivers/turso-driver";
import ValtownDriver from "@studio/drivers/valtown-driver";
import { env } from "@studio/env";
import { decrypt } from "@studio/lib/encryption-edge";

export async function createTursoEdgeDriver(db: typeof database.$inferSelect) {
  const url = db.host ?? "";

  if (db.driver === "rqlite") {
    return new RqliteDriver(
      url,
      db.username ? await decrypt(env.ENCRYPTION_KEY, db.username) : "",
      db.password ? await decrypt(env.ENCRYPTION_KEY, db.password) : ""
    );
  } else if (db.driver === "valtown") {
    return new ValtownDriver(
      db.token ? await decrypt(env.ENCRYPTION_KEY, db.token) : ""
    );
  }

  const token = db.token
    ? await decrypt(env.ENCRYPTION_KEY, db.token ?? "")
    : "";
  return new TursoDriver(url, token);
}
