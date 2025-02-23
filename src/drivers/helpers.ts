import { SavedConnectionRawLocalStorage } from "@/app/(theme)/connect/saved-connection-storage";
import CloudflareD1Driver from "./cloudflare-d1-driver";
import RqliteDriver from "./rqlite-driver";
import StarbaseDriver from "./starbase-driver";
import TursoDriver from "./turso-driver";
import ValtownDriver from "./valtown-driver";

export function createLocalDriver(conn: SavedConnectionRawLocalStorage) {
  if (conn.driver === "rqlite") {
    return new RqliteDriver(conn.url!, conn.username, conn.password);
  } else if (conn.driver === "valtown") {
    return new ValtownDriver(conn.token!);
  } else if (conn.driver === "cloudflare-d1") {
    return new CloudflareD1Driver("/proxy/d1", {
      Authorization: "Bearer " + conn.token,
      "x-account-id": conn.username ?? "",
      "x-database-id": conn.database ?? "",
    });
  } else if (conn.driver === "starbase") {
    return new StarbaseDriver("/proxy/starbase", {
      Authorization: "Bearer " + (conn.token ?? ""),
      "x-starbase-url": conn.url ?? "",
    });
  }

  return new TursoDriver(conn.url!, conn.token!, true);
}
