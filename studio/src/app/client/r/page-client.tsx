"use client";

import { SavedConnectionItem } from "@/app/connect/saved-connection-storage";
import { useTheme } from "@/context/theme-provider";
import CollaborationDriver from "@/drivers/collaboration-driver";
import RemoteDriver from "@/drivers/remote-driver";
import { Studio } from "@libsqlstudio/gui";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export default function ClientPageBody({
  token,
  config,
}: Readonly<{
  token: string;
  config: SavedConnectionItem;
}>) {
  const { theme } = useTheme();
  const params = useSearchParams();
  const router = useRouter();

  const { driver, collaborator } = useMemo(() => {
    const databaseId = params.get("p");
    if (!databaseId) return { driver: null };

    return {
      driver: new RemoteDriver(databaseId, token),
      collaborator: new CollaborationDriver(databaseId, token),
    };
  }, [params, token]);

  const goBack = useCallback(() => {
    router.push("/connect");
  }, [router]);

  if (!driver) {
    return <div>Something wrong</div>;
  }

  return (
    <Studio
      defaultTheme={theme}
      driver={driver}
      name={config.name}
      color={config.label ?? "blue"}
      collaboration={collaborator}
      onBack={goBack}
    />
  );
}
