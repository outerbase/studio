"use client";

import { Studio } from "@/components/gui/studio";
import PageLoading from "@/components/page-loading";
import { StudioExtensionManager } from "@/core/extension-manager";
import {
  createMySQLExtensions,
  createPostgreSQLExtensions,
  createSQLiteExtensions,
} from "@/core/standard-extension";
import DataCatalogExtension from "@/extensions/data-catalog";
import OuterbaseExtension from "@/extensions/outerbase";
import { getOuterbaseBase } from "@/outerbase-cloud/api";
import { OuterbaseAPIBaseCredential } from "@/outerbase-cloud/api-type";
import { getOuterbaseBaseCredential } from "@/outerbase-cloud/api-workspace";
import DataCatalogOuterbaseDriver from "@/outerbase-cloud/data-catalog-driver";
import { OuterbaseMySQLDriver } from "@/outerbase-cloud/database/mysql";
import { OuterbasePostgresDriver } from "@/outerbase-cloud/database/postgresql";
import { OuterbaseSqliteDriver } from "@/outerbase-cloud/database/sqlite";
import OuterbaseQueryDriver from "@/outerbase-cloud/query-driver";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function OuterbaseSourcePage() {
  const { workspaceId, baseId } = useParams<{
    workspaceId: string;
    baseId: string;
  }>();
  const [name, setName] = useState<string>("");
  const [credential, setCredential] = useState<OuterbaseAPIBaseCredential>();

  useEffect(() => {
    if (!workspaceId) return;
    if (!baseId) return;

    getOuterbaseBase(workspaceId, baseId).then((base) => {
      if (!base) return;

      setName(base.name);
      getOuterbaseBaseCredential(workspaceId, base.sources[0]?.id ?? "").then(
        setCredential
      );
    });
  }, [workspaceId, baseId]);

  const savedDocDriver = useMemo(() => {
    if (!workspaceId || !credential?.id || !baseId) return null;
    return new OuterbaseQueryDriver(workspaceId, baseId, credential.id);
  }, [workspaceId, baseId, credential?.id]);

  const [outerbaseDriver, extensions] = useMemo(() => {
    if (!workspaceId || !credential) return [null, null];

    const dialect = credential.type;
    const outerbaseConfig = {
      workspaceId,
      sourceId: credential.id,
      baseId,
      token: localStorage.getItem("ob-token") ?? "",
    };

    const outerbaseSpecifiedDrivers = [
      new OuterbaseExtension(outerbaseConfig),
      new DataCatalogExtension(new DataCatalogOuterbaseDriver(outerbaseConfig)),
    ];

    if (dialect === "postgres") {
      return [
        new OuterbasePostgresDriver(outerbaseConfig),
        new StudioExtensionManager([
          ...createPostgreSQLExtensions(),
          ...outerbaseSpecifiedDrivers,
        ]),
      ];
    } else if (dialect === "mysql") {
      return [
        new OuterbaseMySQLDriver(outerbaseConfig, credential.database),
        new StudioExtensionManager([
          ...createMySQLExtensions(),
          ...outerbaseSpecifiedDrivers,
        ]),
      ];
    }

    return [
      new OuterbaseSqliteDriver(outerbaseConfig),
      new StudioExtensionManager([
        ...createSQLiteExtensions(),
        ...outerbaseSpecifiedDrivers,
      ]),
    ];
  }, [workspaceId, credential, baseId]);

  if (!outerbaseDriver || !savedDocDriver) {
    return <PageLoading>Loading Base ...</PageLoading>;
  }

  return (
    <Studio
      color="gray"
      driver={outerbaseDriver}
      docDriver={savedDocDriver}
      extensions={extensions}
      name={name}
    />
  );
}
