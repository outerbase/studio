import { database } from "@/db/schema";
import CloudflareD1Driver from "@/drivers/cloudflare-d1-driver";
import RqliteDriver from "@/drivers/rqlite-driver";
import TursoDriver from "@/drivers/turso-driver";
import ValtownDriver from "@/drivers/valtown-driver";
import { env } from "@/env";
import { decrypt } from "@/lib/encryption-edge";

export async function createTursoEdgeDriver(db: typeof database.$inferSelect) {
  const url = db.host ?? "";

  if (db.driver === "rqlite") {
    return new RqliteDriver(
      url,
      db.username ?? "",
      db.password ? await decrypt(env.ENCRYPTION_KEY, db.password) : ""
    );
  } else if (db.driver === "valtown") {
    return new ValtownDriver(
      db.token ? await decrypt(env.ENCRYPTION_KEY, db.token) : ""
    );
  } else if (db.driver === "cloudflare-d1") {
    return new CloudflareD1Driver(
      `https://api.cloudflare.com/client/v4/accounts/${db.username}/d1/database/${db.databaseName}/raw`,
      {
        Authorization:
          "Bearer " + (await decrypt(env.ENCRYPTION_KEY, db.token ?? "")),
      }
    );
  }

  const token = db.token
    ? await decrypt(env.ENCRYPTION_KEY, db.token ?? "")
    : "";
  return new TursoDriver(url, token);
}
