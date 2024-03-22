"use client";

import { SavedConnectionLocalStorage } from "@/app/connect/saved-connection-storage";
import MainScreen from "@/components/main-connection";
import DatabaseDriver from "@/drivers/turso-driver";
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
    return new DatabaseDriver(conn.config.url, conn.config.token);
  }, [conn]);

  if (!driver) {
    return <div>Something wrong</div>;
  }

  return <MainScreen driver={driver} color={conn?.label ?? "blue"} />;
}
