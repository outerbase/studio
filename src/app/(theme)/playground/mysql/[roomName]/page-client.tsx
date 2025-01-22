"use client";
import { Studio } from "@/components/gui/studio";
import ServerLoadingAnimation from "@/components/icons/server-loading";
import { StudioExtensionManager } from "@/core/extension-manager";
import { createMySQLExtensions } from "@/core/standard-extension";
import MySQLPlaygroundDriver from "@/drivers/mysql/mysql-playground-driver";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function MySQLPlaygroundPageClient({
  roomName,
}: {
  roomName: string;
}) {
  const searchParams = useSearchParams();
  const [isReady, setReady] = useState(false);

  const driver = useMemo(() => {
    if (typeof window === "undefined") return null;

    return new MySQLPlaygroundDriver(roomName, {
      onReady: () => setReady(true),
    });
  }, [setReady, roomName]);

  const extensions = useMemo(() => {
    return new StudioExtensionManager(createMySQLExtensions());
  }, []);

  // Create ping useeffect
  useEffect(() => {
    if (!driver) return;

    const interval = setInterval(() => {
      driver.ping();
    }, 5000);

    return () => clearInterval(interval);
  }, [driver]);

  if (!isReady) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
        <ServerLoadingAnimation />
        <div>Setting up your database</div>
      </div>
    );
  }

  if (!driver) {
    return <div>Server-side rendering is not supported</div>;
  }

  return (
    <Studio
      driver={driver}
      extensions={extensions}
      name={searchParams.get("name") || "Unnamed Connection"}
      color={searchParams.get("color") || "gray"}
    />
  );
}
