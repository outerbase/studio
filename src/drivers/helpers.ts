import { SavedConnectionItemConfig } from "@/app/(theme)/connect/saved-connection-storage";
import CloudflareD1Driver from "./cloudflare-d1-driver";
import RqliteDriver from "./rqlite-driver";
import StarbaseDriver from "./starbase-driver";
import TursoDriver from "./turso-driver";
import ValtownDriver from "./valtown-driver";

export function createLocalDriver(conn: SavedConnectionItemConfig) {
  if (conn.driver === "rqlite") {
    return new RqliteDriver(
      conn.config.url!,
      conn.config.username,
      conn.config.password
    );
  } else if (conn.driver === "valtown") {
    return new ValtownDriver(conn.config.token!);
  } else if (conn.driver === "cloudflare-d1") {
    return new CloudflareD1Driver("/proxy/d1", {
      Authorization: "Bearer " + conn.config.token,
      "x-account-id": conn.config.username ?? "",
      "x-database-id": conn.config.database ?? "",
    });
  } else if (conn.driver === "starbase") {
    return new StarbaseDriver("/proxy/starbase", {
      Authorization: "Bearer " + (conn.config.token ?? ""),
      "x-starbase-url": conn.config.url ?? "",
    });
  }

  return new TursoDriver(conn.config.url!, conn.config.token!, true);
}
