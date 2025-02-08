"use client";
import {
  SavedConnectionItem,
  SavedConnectionLocalStorage,
} from "@/app/(theme)/connect/saved-connection-storage";
import ResourceCard from "@/components/resource-card";
import {
  getDatabaseFriendlyName,
  getDatabaseIcon,
  getDatabaseVisual,
} from "@/components/resource-card/utils";
import { useEffect, useState } from "react";
import { NavigationBar } from "../../nav";

export default function LocalWorkspacePage() {
  const [localSavedConns, setLocalSavedConns] = useState<SavedConnectionItem[]>(
    []
  );

  useEffect(() => {
    setLocalSavedConns(SavedConnectionLocalStorage.getList());
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <NavigationBar />

      <div className="container mx-auto p-4">
        <h1 className="text-primary mb-8 text-xl font-semibold">
          Local Connection
        </h1>

        <div className="bg-secondary mb-8 flex h-[200px] items-center justify-center rounded-lg">
          Something about not login
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {localSavedConns.map((conn) => (
            <ResourceCard
              className="w-full"
              key={conn.id}
              color={conn.label ?? ""}
              icon={getDatabaseIcon(conn.driver ?? "")}
              href={`/client/s/${conn.driver}?p=${conn.id}`}
              title={conn.name}
              subtitle={getDatabaseFriendlyName(conn.driver ?? "")}
              visual={getDatabaseVisual(conn.driver ?? "")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
