"use client";
import { SavedConnectionLocalStorage } from "@/app/(theme)/connect/saved-connection-storage";
import RqliteDriver from "@/drivers/rqlite-driver";
import TursoDriver from "@/drivers/turso-driver";
import ValtownDriver from "@/drivers/valtown-driver";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import MyStudio from "@/components/my-studio";
import IndexdbSavedDoc from "@/drivers/saved-doc/indexdb-saved-doc";
import CloudflareD1Driver from "@/drivers/cloudflare-d1-driver";
import StarbaseDriver from "@/drivers/starbase-driver";

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

    return new TursoDriver(conn.config.url, conn.config.token, true);
  }, [conn]);

  const docDriver = useMemo(() => {
    if (conn) {
      return new IndexdbSavedDoc(conn.id);
    }
  }, [conn]);

  if (!driver || !conn) {
    return <div>Something wrong</div>;
  }

  return (
    <MyStudio
      driver={driver}
      docDriver={docDriver}
      name={conn.name}
      color={conn.label ?? "blue"}
    />
  );
}
