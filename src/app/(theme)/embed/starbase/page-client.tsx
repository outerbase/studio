"use client";
import { Studio } from "@/components/gui/studio";
import { StudioExtensionManager } from "@/core/extension-manager";
import { createStandardExtensions } from "@/core/standard-extension";
import { IframeSQLiteDriver } from "@/drivers/iframe-driver";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function EmbedPageClient() {
  const searchParams = useSearchParams();
  const driver = useMemo(
    () => new IframeSQLiteDriver({ supportPragmaList: false }),
    []
  );

  const extensions = useMemo(() => {
    return new StudioExtensionManager(createStandardExtensions());
  }, []);

  useEffect(() => {
    return driver.listen();
  }, [driver]);

  return (
    <Studio
      driver={driver}
      extensions={extensions}
      name={searchParams.get("name") || "Unnamed Connection"}
      color={searchParams.get("color") || "blue"}
    />
  );
}
