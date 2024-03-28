"use client";

import { SavedConnectionItem } from "@/app/connect/saved-connection-storage";
import MainScreen from "@/components/main-connection";
import { ConnectionConfigProvider } from "@/context/connection-config-provider";
import RemoteDriver from "@/drivers/remote-driver";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function ClientPageBody({
  token,
  config,
}: Readonly<{
  token: string;
  config: SavedConnectionItem;
}>) {
  const params = useSearchParams();

  const driver = useMemo(() => {
    const databaseId = params.get("p");
    if (!databaseId) return null;
    return new RemoteDriver(databaseId, token);
  }, [params, token]);

  if (!driver) {
    return <div>Something wrong</div>;
  }

  return (
    <ConnectionConfigProvider config={config}>
      <MainScreen driver={driver} />
    </ConnectionConfigProvider>
  );
}
