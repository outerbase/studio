"use client";
import { Studio } from "@/components/gui/studio";
import { StudioExtensionManager } from "@/core/extension-manager";
import { createSQLiteExtensions } from "@/core/standard-extension";
import { IframeSQLiteDriver } from "@/drivers/iframe-driver";
import ElectronSavedDocs from "@/drivers/saved-doc/electron-saved-doc";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function EmbedPageClient() {
  const searchParams = useSearchParams();
  const driver = useMemo(() => new IframeSQLiteDriver(), []);

  const extensions = useMemo(() => {
    return new StudioExtensionManager(createSQLiteExtensions());
  }, []);

  const savedDocDriver = useMemo(() => {
    if (window.outerbaseIpc?.docs) {
      return new ElectronSavedDocs();
    }
  }, []);

  useEffect(() => {
    return driver.listen();
  }, [driver]);

  return (
    <Studio
      extensions={extensions}
      driver={driver}
      docDriver={savedDocDriver}
      name={searchParams.get("name") || "Unnamed Connection"}
      color={searchParams.get("color") || "gray"}
    />
  );
}
