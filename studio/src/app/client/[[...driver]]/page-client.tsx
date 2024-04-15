"use client";
import TursoDriver from "@studio/drivers/turso-driver";
import { useCallback, useMemo } from "react";
import {
  SavedConnectionItemConfigConfig,
  SupportedDriver,
} from "../../connect/saved-connection-storage";
import RqliteDriver from "@studio/drivers/rqlite-driver";
import ValtownDriver from "@studio/drivers/valtown-driver";
import { Studio } from "@libsqlstudio/gui";
import { useRouter } from "next/navigation";

export default function ClientPageBody() {
  const router = useRouter();
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

  const goBack = useCallback(() => {
    router.push("/connect");
  }, [router]);

  return (
    <Studio driver={driver} name="Quick Connect" color="blue" onBack={goBack} />
  );
}
