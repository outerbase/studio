"use client";
import RqliteDriver from "@/drivers/rqlite-driver";
import TursoDriver from "@/drivers/turso-driver";
import ValtownDriver from "@/drivers/valtown-driver";
import { useMemo } from "react";
import {
  SavedConnectionItemConfigConfig,
  SupportedDriver,
} from "../../connect/saved-connection-storage";

import MyStudio from "@/components/my-studio";
import CloudflareD1Driver from "@/drivers/cloudflare-d1-driver";
import StarbaseDriver from "@/drivers/starbase-driver";

export default function ClientPageBody() {
  const driver = useMemo(() => {
    const config: SavedConnectionItemConfigConfig & {
      driver: SupportedDriver;
    } = JSON.parse(sessionStorage.getItem("connection") ?? "{}");

    if (config.driver === "rqlite") {
      return new RqliteDriver(config.url!, config.username, config.password);
    } else if (config.driver === "valtown") {
      return new ValtownDriver(config.token!);
    } else if (config.driver === "cloudflare-d1") {
      return new CloudflareD1Driver("/proxy/d1", {
        Authorization: "Bearer " + (config.token ?? ""),
        "x-account-id": config.username ?? "",
        "x-database-id": config.database ?? "",
      });
    } else if (config.driver === "starbase") {
      return new StarbaseDriver("/proxy/starbase", {
        Authorization: "Bearer " + (config.token ?? ""),
        "x-starbase-url": config.url ?? "",
      });
    }

    return new TursoDriver(config.url!, config.token as string, true);
  }, []);

  return <MyStudio driver={driver} name="Quick Connect" color="blue" />;
}
