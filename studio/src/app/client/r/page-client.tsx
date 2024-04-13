"use client";

import { SavedConnectionItem } from "@/app/connect/saved-connection-storage";
import MainScreen from "@/components/main-connection";
import { DatabaseDriverProvider } from "@/context/DatabaseDriverProvider";
import { ConnectionConfigProvider } from "@/context/connection-config-provider";
import CollaborationDriver from "@/drivers/collaboration-driver";
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

  const { driver, collaborator } = useMemo(() => {
    const databaseId = params.get("p");
    if (!databaseId) return { driver: null };

    return {
      driver: new RemoteDriver(databaseId, token),
      collaborator: new CollaborationDriver(databaseId, token),
    };
  }, [params, token]);

  if (!driver) {
    return <div>Something wrong</div>;
  }

  return (
    <DatabaseDriverProvider driver={driver} collaborationDriver={collaborator}>
      <ConnectionConfigProvider config={config}>
        <MainScreen />
      </ConnectionConfigProvider>
    </DatabaseDriverProvider>
  );
}
