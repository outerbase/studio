"use client";

import { SavedConnectionLocalStorage } from "@/app/connect/saved-connection-storage";
import MainScreen from "@/components/main-connection";
import { DatabaseDriverProvider } from "@/context/DatabaseDriverProvider";
import { ConnectionConfigProvider } from "@/context/connection-config-provider";
import RqliteDriver from "@/drivers/rqlite-driver";
import TursoDriver from "@/drivers/turso-driver";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function ClientPageBody() {
  const params = useSearchParams();
  const conn = useMemo(() => {
    const connectionParams = params.get("p");
    if (!connectionParams) return null;

    const conn = SavedConnectionLocalStorage.get(connectionParams);
    return conn;
  }, [params]);

  const driver = useMemo(() => {
    if (!conn) return null;
    if (conn.driver === "rqlite") {
      return new RqliteDriver(
        conn.config.url,
        conn.config.username,
        conn.config.password
      );
    }

    return new TursoDriver(conn.config.url, conn.config.token);
  }, [conn]);

  if (!driver || !conn) {
    return <div>Something wrong</div>;
  }

  return (
    <DatabaseDriverProvider driver={driver}>
      <ConnectionConfigProvider config={conn}>
        <MainScreen />
      </ConnectionConfigProvider>
    </DatabaseDriverProvider>
  );
}
