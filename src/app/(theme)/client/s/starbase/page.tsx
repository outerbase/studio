"use client";

import { useLocalConnection } from "@/app/(outerbase)/local/hooks";
import ClientOnly from "@/components/client-only";
import { Studio } from "@/components/gui/studio";
import PageLoading from "@/components/page-loading";
import { StudioExtensionManager } from "@/core/extension-manager";
import {
  createMySQLExtensions,
  createPostgreSQLExtensions,
  createSQLiteExtensions,
  createStandardExtensions,
} from "@/core/standard-extension";
import { StarbaseQuery } from "@/drivers/database/starbasedb";
import MySQLLikeDriver from "@/drivers/mysql/mysql-driver";
import PostgresLikeDriver from "@/drivers/postgres/postgres-driver";
import IndexdbSavedDoc from "@/drivers/saved-doc/indexdb-saved-doc";
import { SqliteLikeBaseDriver } from "@/drivers/sqlite-base-driver";
import { useAvailableAIAgents } from "@/lib/ai-agent-storage";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export const runtime = "edge";

function StarbasePageBody() {
  const params = useSearchParams();
  const baseId = params.get("p") ?? "";

  const { data: conn } = useLocalConnection(baseId);
  const [queryable, setQueryable] = useState<StarbaseQuery | null>(null);
  const [driverType, setDriverType] = useState<string | null>(null);

  useEffect(() => {
    if (conn && conn.content.driver === "starbase") {
      if (conn.content.starbase_type === "hyperdrive") {
        setDriverType("postgres");
      } else if (conn.content.starbase_type !== "external") {
        setDriverType("sqlite");
      }

      setQueryable(
        new StarbaseQuery(
          conn.content.url!,
          conn.content.token!,
          conn.content.starbase_type ?? "internal"
        )
      );
    }
  }, [conn]);

  // Starbase is a complicated database. Since we never know
  // what is behind it. It can be Postgres, SQLite, MySQL etc...
  useEffect(() => {
    if (driverType) return;
    if (!queryable) return;

    // Make one version call
    queryable.query("SELECT VERSION() AS v").then((result) => {
      if ((result.rows[0].v as string).includes("PostgreSQL"))
        setDriverType("postgres");
      else setDriverType("mysql");
    });
  }, [driverType, queryable]);

  // Load extensions
  const extensions = useMemo(() => {
    if (driverType === "mysql") {
      return new StudioExtensionManager(createMySQLExtensions());
    } else if (driverType === "sqlite") {
      return new StudioExtensionManager(createSQLiteExtensions());
    } else if (driverType === "postgres") {
      return new StudioExtensionManager(createPostgreSQLExtensions());
    }

    return new StudioExtensionManager(createStandardExtensions());
  }, [driverType]);

  // Load drivers
  const driver = useMemo(() => {
    if (!queryable) return null;

    if (driverType === "sqlite") {
      return new SqliteLikeBaseDriver(queryable);
    } else if (driverType === "postgres") {
      return new PostgresLikeDriver(queryable);
    } else if (driverType === "mysql") {
      return new MySQLLikeDriver(queryable);
    }
  }, [driverType, queryable]);

  const docDriver = useMemo(() => {
    if (conn) {
      return new IndexdbSavedDoc(conn.id);
    }
  }, [conn]);

  const agentDriver = useAvailableAIAgents(driver);

  const router = useRouter();

  const goBack = useCallback(() => {
    router.push("/");
  }, [router]);

  if (!driver || !conn || !extensions) {
    return <PageLoading>Loading Starbase</PageLoading>;
  }

  return (
    <Studio
      extensions={extensions}
      driver={driver}
      name={conn?.content.name}
      color={conn?.content.label ?? "blue"}
      onBack={goBack}
      docDriver={docDriver}
      agentDriver={agentDriver}
    />
  );
}

export default function StarbasePage() {
  return (
    <ClientOnly>
      <StarbasePageBody />
    </ClientOnly>
  );
}
