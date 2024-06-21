"use client";
import TursoDriver from "@/drivers/turso-driver";
import { useMemo } from "react";
import {
  SavedConnectionItemConfigConfig,
  SupportedDriver,
} from "../../connect/saved-connection-storage";
import RqliteDriver from "@/drivers/rqlite-driver";
import ValtownDriver from "@/drivers/valtown-driver";

import MyStudio from "@/components/my-studio";

export default function ClientPageBody() {
  const driver = useMemo(() => {
    const config: SavedConnectionItemConfigConfig & {
      driver: SupportedDriver;
    } = JSON.parse(sessionStorage.getItem("connection") ?? "{}");

    if (config.driver === "rqlite") {
      return new RqliteDriver(config.url, config.username, config.password);
    } else if (config.driver === "valtown") {
      return new ValtownDriver(config.token);
    }
    return new TursoDriver(config.url, config.token as string, true);
  }, []);

  return <MyStudio driver={driver} name="Quick Connect" color="blue" />;
}
