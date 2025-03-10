"use client";
import { Studio } from "@/components/gui/studio";
import { StudioExtensionManager } from "@/core/extension-manager";
import {
  createMySQLExtensions,
  createPostgreSQLExtensions,
  createSQLiteExtensions,
} from "@/core/standard-extension";
import {
  IframeMySQLDriver,
  IframePostgresDriver,
  IframeSQLiteDriver,
} from "@/drivers/iframe-driver";
import ElectronSavedDocs from "@/drivers/saved-doc/electron-saved-doc";
import DoltExtension from "@/extensions/dolt";
import LocalSettingSidebar from "@/extensions/local-setting-sidebar";
import { useAvailableAIAgents } from "@/lib/ai-agent-storage";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function EmbedPageClient({
  driverName,
}: {
  driverName: string;
}) {
  const searchParams = useSearchParams();

  const driver = useMemo(() => {
    return createDatabaseDriver(driverName);
  }, [driverName]);

  const savedDocDriver = useMemo(() => {
    if (window.outerbaseIpc?.docs) {
      return new ElectronSavedDocs();
    }
  }, []);

  const extensions = useMemo(() => {
    return new StudioExtensionManager(createEmbedExtensions(driverName));
  }, [driverName]);

  const agentDriver = useAvailableAIAgents(driver);

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
      agentDriver={agentDriver}
    />
  );
}

function createDatabaseDriver(driverName: string) {
  if (driverName === "turso") {
    return new IframeSQLiteDriver({
      supportPragmaList: false,
      supportBigInt: true,
    });
  } else if (driverName === "sqlite") {
    return new IframeSQLiteDriver();
  } else if (driverName === "starbase") {
    return new IframeSQLiteDriver({
      supportPragmaList: false,
    });
  } else if (driverName === "mysql" || driverName === "dolt") {
    return new IframeMySQLDriver();
  } else if (driverName === "postgres") {
    return new IframePostgresDriver();
  }

  return new IframeSQLiteDriver();
}

function createEmbedExtensions(driverName: string) {
  if (driverName === "turso") {
    return [...createSQLiteExtensions(), new LocalSettingSidebar()];
  } else if (driverName === "sqlite" || driverName === "starbase") {
    return [...createSQLiteExtensions(), new LocalSettingSidebar()];
  } else if (driverName === "mysql") {
    return createMySQLExtensions();
  } else if (driverName === "dolt") {
    return [...createMySQLExtensions(), new DoltExtension()];
  } else if (driverName === "postgres") {
    return createPostgreSQLExtensions();
  }

  return createSQLiteExtensions();
}
