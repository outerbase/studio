"use client";
import {
  SavedConnectionItemConfigConfig,
  SupportedDriver,
} from "@/app/connect/saved-connection-storage";
import { useMemo } from "react";
import MyStudio from "@/components/my-studio";
import RqliteDriver from "@/drivers/rqlite-driver";
import TursoDriver from "@/drivers/turso-driver";
import ValtownDriver from "@/drivers/valtown-driver";

export default function ClientPageBody({
  config,
  name,
  expired,
}: Readonly<{
  config: SavedConnectionItemConfigConfig & {
    driver: SupportedDriver;
  };
  name: string;
  expired: number;
}>) {
  const driver = useMemo(() => {
    if (config.driver === "rqlite") {
      return new RqliteDriver(config.url, config.username, config.password);
    } else if (config.driver === "valtown") {
      return new ValtownDriver(config.token);
    }
    return new TursoDriver(config.url, config.token as string, true);
  }, [config]);

  return (
    <MyStudio
      driver={driver}
      name={name ?? "Temporary Session"}
      color="gray"
      expiredAt={expired}
    />
  );
}
