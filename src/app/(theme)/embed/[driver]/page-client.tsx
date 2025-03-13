"use client";
import { Studio } from "@/components/gui/studio";
import { StudioExtensionManager } from "@/core/extension-manager";
import {
  createMySQLExtensions,
  createPostgreSQLExtensions,
  createSQLiteExtensions,
} from "@/core/standard-extension";
import { EmbedQueryable } from "@/drivers/iframe-driver";
import MySQLLikeDriver from "@/drivers/mysql/mysql-driver";
import PostgresLikeDriver from "@/drivers/postgres/postgres-driver";
import ElectronSavedDocs from "@/drivers/saved-doc/electron-saved-doc";
import { SqliteLikeBaseDriver } from "@/drivers/sqlite-base-driver";
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

  const [driver, queryable] = useMemo(() => {
    const queryable = new EmbedQueryable();
    return [createDatabaseDriver(driverName, queryable), queryable];
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
    return queryable.listen();
  }, [queryable]);

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

function createDatabaseDriver(driverName: string, queryable: EmbedQueryable) {
  if (driverName === "turso") {
    return new SqliteLikeBaseDriver(queryable);
  } else if (driverName === "sqlite") {
    return new SqliteLikeBaseDriver(queryable);
  } else if (driverName === "starbase") {
    return new SqliteLikeBaseDriver(queryable);
  } else if (driverName === "mysql" || driverName === "dolt") {
    return new MySQLLikeDriver(queryable, "");
  } else if (driverName === "postgres") {
    return new PostgresLikeDriver(queryable);
  }

  return new SqliteLikeBaseDriver(queryable);
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
