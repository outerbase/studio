"use client";

import MainScreen from "@/components/main-connection";
import { ConnectionConfigProvider } from "@/context/connection-config-provider";
import TursoDriver from "@/drivers/turso-driver";
import { useMemo } from "react";
import { SavedConnectionItem } from "../connect/saved-connection-storage";

export default function ClientPageBody() {
  const driver = useMemo(() => {
    const config = JSON.parse(sessionStorage.getItem("connection") ?? "{}");
    return new TursoDriver(config.url, config.token as string);
  }, []);

  const config = useMemo(() => {
    const config = JSON.parse(sessionStorage.getItem("connection") ?? "{}");

    return {
      id: "quick-connect",
      name: (config?.url ?? "") as string,
      label: "blue",
    } as SavedConnectionItem;
  }, []);

  return (
    <ConnectionConfigProvider config={config}>
      <MainScreen driver={driver} />
    </ConnectionConfigProvider>
  );
}
