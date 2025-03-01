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
import { OuterbaseAPISource } from "@/outerbase-cloud/api-type";
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
  const [source, setSource] = useState<OuterbaseAPISource>();

  useEffect(() => {
    if (!workspaceId) return;
    if (!baseId) return;

    getOuterbaseBase(workspaceId, baseId).then((base) => {
      if (!base) return;
      setSource(base.sources[0]);
      setName(base.name);
    });
  }, [workspaceId, baseId]);

  const savedDocDriver = useMemo(() => {
    if (!workspaceId || !source?.id || !baseId) return null;
    return new OuterbaseQueryDriver(workspaceId, baseId, source.id);
  }, [workspaceId, baseId, source?.id]);

  const [outerbaseDriver, extensions] = useMemo(() => {
    if (!workspaceId || !source) return [null, null];

    const dialect = source.type;
    const outerbaseConfig = {
      workspaceId,
      sourceId: source.id,
      baseId: source.base_id,
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
        new OuterbaseMySQLDriver(outerbaseConfig),
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
  }, [workspaceId, source]);

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
