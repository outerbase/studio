"use client";
import { saveAs } from "file-saver";
import MyStudio from "@/components/my-studio";
import { Button } from "@/components/ui/button";
import SqljsDriver from "@/drivers/sqljs-driver";
import { LucideLoader } from "lucide-react";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Database, SqlJsStatic } from "sql.js";
import ScreenDropZone from "@/components/screen-dropzone";

export default function PlaygroundEditorBody({
  preloadDatabase,
}: {
  preloadDatabase?: string | null;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [sqlInit, setSqlInit] = useState<SqlJsStatic>();
  const [databaseLoading, setDatabaseLoading] = useState(!!preloadDatabase);
  const [rawDb, setRawDb] = useState<Database>();
  const [db, setDb] = useState<SqljsDriver>();

  const onReady = useCallback(() => {
    window
      .initSqlJs({
        locateFile: (file) => `/sqljs/${file}`,
      })
      .then(setSqlInit);
  }, []);

  useEffect(() => {
    if (sqlInit) {
      if (preloadDatabase) {
        fetch(preloadDatabase)
          .then((r) => r.arrayBuffer())
          .then((r) => {
            const sqljsDatabase = new sqlInit.Database(new Uint8Array(r));
            setRawDb(sqljsDatabase);
            setDb(new SqljsDriver(sqljsDatabase));
          })
          .finally(() => setDatabaseLoading(false));
      } else {
        const sqljsDatabase = new sqlInit.Database();
        setRawDb(sqljsDatabase);
        setDb(new SqljsDriver(sqljsDatabase));
      }
    }
  }, [sqlInit, preloadDatabase]);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.currentTarget.files && sqlInit) {
        const file = e.currentTarget.files[0];
        if (file) {
          file.arrayBuffer().then((buffer) => {
            const sqljsDatabase = new sqlInit.Database(new Uint8Array(buffer));
            setRawDb(sqljsDatabase);
            setDb(new SqljsDriver(sqljsDatabase));
          });
        }
      }
    },
    [sqlInit]
  );

  const onFileDrop = useCallback(
    (buffer: ArrayBuffer) => {
      if (sqlInit) {
        const sqljsDatabase = new sqlInit.Database(new Uint8Array(buffer));
        setRawDb(sqljsDatabase);
        setDb(new SqljsDriver(sqljsDatabase));
      }
    },
    [sqlInit]
  );

  const sidebarMenu = useMemo(() => {
    return (
      <div className="flex flex-row gap-2 px-2 pb-2">
        <Button
          className="flex-grow"
          size="sm"
          onClick={() => {
            if (rawDb) {
              console.log("hello world");
              saveAs(
                new Blob([rawDb.export()], {
                  type: "application/x-sqlite3",
                }),
                "sqlite-dump.db"
              );
            }
          }}
        >
          Save
        </Button>
        <Button
          className="flex-grow"
          size="sm"
          onClick={() => {
            if (fileInput.current) {
              fileInput.current.click();
            }
          }}
        >
          Open
        </Button>
      </div>
    );
  }, [rawDb, fileInput]);

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
      return (
        <MyStudio
          color="gray"
          name="Playground"
          driver={db}
          sideBarFooterComponent={sidebarMenu}
        />
      );
    }

    return <div></div>;
  }, [databaseLoading, preloadDatabase, db, sidebarMenu]);

  return (
    <>
      <Script src="/sqljs/sql-wasm.js" onReady={onReady} />
      <input
        type="file"
        ref={fileInput}
        className="hidden"
        onChange={onFileChange}
        multiple={false}
      />
      <ScreenDropZone onFileDrop={onFileDrop} />
      {dom}
    </>
  );
}
