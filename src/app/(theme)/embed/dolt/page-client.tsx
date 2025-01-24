"use client";
import { Studio } from "@/components/gui/studio";
import { StudioExtensionManager } from "@/core/extension-manager";
import { createMySQLExtensions } from "@/core/standard-extension";
import { IframeDoltDriver } from "@/drivers/iframe-driver";
import ElectronSavedDocs from "@/drivers/saved-doc/electron-saved-doc";
import DoltExtension from "@/extensions/dolt";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function EmbedPageClient() {
  const searchParams = useSearchParams();
  const driver = useMemo(() => new IframeDoltDriver(), []);

  const extensions = useMemo(() => {
    return new StudioExtensionManager([
      ...createMySQLExtensions(),
      new DoltExtension(),
    ]);
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
      docDriver={savedDocDriver}
      name={searchParams.get("name") || "Unnamed Connection"}
      color={searchParams.get("color") || "gray"}
      extensions={extensions}
    />
  );
}
