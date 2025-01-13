"use client";
import { Studio } from "@/components/gui/studio";
import { StudioExtensionManager } from "@/core/extension-manager";
import { createStandardExtensions } from "@/core/standard-extension";
import { IframeDoltDriver } from "@/drivers/iframe-driver";
import DoltExtension from "@/extensions/dolt";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function EmbedPageClient() {
  const searchParams = useSearchParams();
  const driver = useMemo(() => new IframeDoltDriver(), []);

  const extensions = useMemo(() => {
    return new StudioExtensionManager([
      ...createStandardExtensions(),
      new DoltExtension(),
    ]);
  }, []);

  useEffect(() => {
    return driver.listen();
  }, [driver]);

  return (
    <Studio
      driver={driver}
      name={searchParams.get("name") || "Unnamed Connection"}
      color={searchParams.get("color") || "gray"}
      extensions={extensions}
    />
  );
}
