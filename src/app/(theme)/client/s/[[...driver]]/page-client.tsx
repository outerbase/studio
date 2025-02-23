"use client";
import {
  updateLocalConnectionUsed,
  useLocalConnection,
} from "@/app/(outerbase)/local/hooks";
import MyStudio from "@/components/my-studio";
import { createLocalDriver } from "@/drivers/helpers";
import IndexdbSavedDoc from "@/drivers/saved-doc/indexdb-saved-doc";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function ClientPageBody() {
  const params = useSearchParams();
  const baseId = params.get("p") ?? "";
  const { data: conn } = useLocalConnection(baseId);

  useEffect(() => {
    if (!baseId) return;
    updateLocalConnectionUsed(baseId).then().catch();
  }, [baseId]);

  const driver = useMemo(() => {
    if (!conn) return null;

    const config = conn.content;
    if (!config) return null;

    return createLocalDriver(config);
  }, [conn]);

  const docDriver = useMemo(() => {
    if (conn) {
      return new IndexdbSavedDoc(conn.id);
    }
  }, [conn]);

  if (!driver || !conn) {
    return <div>Something wrong</div>;
  }

  return (
    <MyStudio
      driver={driver}
      docDriver={docDriver}
      name={conn?.content.name}
      color={conn?.content.label ?? "blue"}
    />
  );
}
