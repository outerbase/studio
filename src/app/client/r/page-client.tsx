"use client";
import { SavedConnectionItem } from "@/app/connect/saved-connection-storage";
import CollaborationDriver from "@/drivers/collaboration-driver";
import RemoteDriver from "@/drivers/remote-driver";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import MyStudio from "@/components/my-studio";
import RemoteSavedDocDriver from "@/drivers/saved-doc/remote-saved-doc";

export default function ClientPageBody({
  token,
  config,
}: Readonly<{
  token: string;
  config: SavedConnectionItem;
}>) {
  const params = useSearchParams();

  const { driver, collaborator, docDriver } = useMemo(() => {
    const databaseId = params.get("p");
    if (!databaseId) return { driver: null };

    return {
      driver: new RemoteDriver("remote", databaseId, token),
      collaborator: new CollaborationDriver(databaseId, token),
      docDriver: new RemoteSavedDocDriver(databaseId),
    };
  }, [params, token]);

  if (!driver) {
    return <div>Something wrong</div>;
  }

  return (
    <MyStudio
      driver={driver}
      name={config.name}
      color={config.label ?? "blue"}
      collabarator={collaborator}
      docDriver={docDriver}
    />
  );
}
