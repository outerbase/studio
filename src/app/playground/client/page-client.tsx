"use client";
import MyStudio from "@/components/my-studio";
import SqljsDriver from "@/drivers/sqljs-driver";
import { LucideLoader } from "lucide-react";
import Script from "next/script";
import { useCallback, useMemo, useState } from "react";

export default function PlaygroundEditorBody({
  preloadDatabase,
}: {
  preloadDatabase?: string | null;
}) {
  const [databaseLoading, setDatabaseLoading] = useState(!!preloadDatabase);
  const [db, setDb] = useState<SqljsDriver>();

  const onReady = useCallback(() => {
    window
      .initSqlJs({
        locateFile: (file) => `/sqljs/${file}`,
      })
      .then((SQL) => {
        if (preloadDatabase) {
          fetch(preloadDatabase)
            .then((r) => r.arrayBuffer())
            .then((r) =>
              setDb(new SqljsDriver(new SQL.Database(new Uint8Array(r))))
            )
            .finally(() => setDatabaseLoading(false));
        } else {
          setDb(new SqljsDriver(new SQL.Database()));
        }
      });
  }, [preloadDatabase]);

  const dom = useMemo(() => {
    if (databaseLoading) {
      return (
        <div className="p-4">
          <LucideLoader className="w-12 h-12 animate-spin mb-2" />
          <h1 className="text-2xl font-bold mb-2">Loading Database</h1>
          <p>
            Please wait. We are downloading:
            <br />
            <strong>{preloadDatabase}</strong>
          </p>
        </div>
      );
    }

    if (db) {
      return <MyStudio color="gray" name="Playground" driver={db} />;
    }

    return <div></div>;
  }, [databaseLoading, preloadDatabase, db]);

  return (
    <>
      <Script src="/sqljs/sql-wasm.js" onReady={onReady} />
      {dom}
    </>
  );
}
