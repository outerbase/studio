"use client";
import { SavedConnectionLocalStorage } from "@studio/app/connect/saved-connection-storage";
import RqliteDriver from "@studio/drivers/rqlite-driver";
import TursoDriver from "@studio/drivers/turso-driver";
import ValtownDriver from "@studio/drivers/valtown-driver";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import MyStudio from "@studio/components/my-studio";

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
    } else if (conn.driver === "valtown") {
      return new ValtownDriver(conn.config.token);
    }

    return new TursoDriver(conn.config.url, conn.config.token, true);
  }, [conn]);

  if (!driver || !conn) {
    return <div>Something wrong</div>;
  }

  return (
    <MyStudio driver={driver} name={conn.name} color={conn.label ?? "blue"} />
  );
}
