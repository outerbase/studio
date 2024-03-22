"use client";

import { SavedConnectionLabel } from "@/app/connect/saved-connection-storage";
import MainScreen from "@/components/main-connection";
import RemoteDriver from "@/drivers/remote-driver";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function ClientPageBody({
  token,
  name,
  color,
}: Readonly<{
  token: string;
  name: string;
  color: SavedConnectionLabel;
}>) {
  const params = useSearchParams();

  const driver = useMemo(() => {
    const databaseId = params.get("p");
    if (!databaseId) return null;
    return new RemoteDriver(databaseId, token, name);
  }, [params, token, name]);

  if (!driver) {
    return <div>Something wrong</div>;
  }

  return <MainScreen driver={driver} color={color} />;
}
