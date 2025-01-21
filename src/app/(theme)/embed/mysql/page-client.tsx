"use client";
import { Studio } from "@/components/gui/studio";
import { StudioExtensionManager } from "@/core/extension-manager";
import { createStandardExtensions } from "@/core/standard-extension";
import { IframeMySQLDriver } from "@/drivers/iframe-driver";
import ElectronSavedDocs from "@/drivers/saved-doc/electron-saved-doc";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function EmbedPageClient() {
  const searchParams = useSearchParams();
  const driver = useMemo(() => new IframeMySQLDriver(), []);

  const extensions = useMemo(() => {
    return new StudioExtensionManager(createStandardExtensions());
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
      driver={driver}
      extensions={extensions}
      docDriver={savedDocDriver}
      name={searchParams.get("name") || "Unnamed Connection"}
      color={searchParams.get("color") || "gray"}
    />
  );
}
