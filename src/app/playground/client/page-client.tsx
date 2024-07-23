"use client";
import { saveAs } from "file-saver";
import MyStudio from "@/components/my-studio";
import { Button } from "@/components/ui/button";
import SqljsDriver from "@/drivers/sqljs-driver";
import { LucideFile, LucideLoader } from "lucide-react";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Database, SqlJsStatic } from "sql.js";
import ScreenDropZone from "@/components/screen-dropzone";
import { toast } from "sonner";

export default function PlaygroundEditorBody({
  preloadDatabase,
}: {
  preloadDatabase?: string | null;
}) {
  const [sqlInit, setSqlInit] = useState<SqlJsStatic>();
  const [databaseLoading, setDatabaseLoading] = useState(!!preloadDatabase);
  const [rawDb, setRawDb] = useState<Database>();
  const [db, setDb] = useState<SqljsDriver>();
  const [handler, setHandler] = useState<FileSystemFileHandle>();
  const [fileName, setFilename] = useState("");

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

  useEffect(() => {
    if (handler && sqlInit) {
      handler.getFile().then((file) => {
        setFilename(file.name);
        file.arrayBuffer().then((buffer) => {
          const sqljsDatabase = new sqlInit.Database(new Uint8Array(buffer));
          setRawDb(sqljsDatabase);
          setDb(new SqljsDriver(sqljsDatabase));
        });
      });
    }
  }, [handler]);

  const sidebarMenu = useMemo(() => {
    return (
      <div>
        {fileName && (
          <div className="p-2 text-sm rounded m-2 bg-yellow-300 text-black flex gap-2">
            <div className="flex justify-center items-center">
              <LucideFile />
            </div>
            <div>
              <div className="text-xs">Editing File</div>
              <strong>{fileName}</strong>
            </div>
          </div>
        )}
        <div className="flex flex-row gap-2 px-2 pb-2">
          <Button
            className="flex-grow"
            size="sm"
            onClick={() => {
              if (rawDb) {
                if (handler) {
                  handler
                    .createWritable()
                    .then((writable) => {
                      writable.write(rawDb.export());
                      writable.close();
                      toast.success(
                        <div>
                          Successfully save <strong>{fileName}</strong>
                        </div>
                      );
                      db?.resetChange();
                    })
                    .catch(console.error);
                } else {
                  saveAs(
                    new Blob([rawDb.export()], {
                      type: "application/x-sqlite3",
                    }),
                    "sqlite-dump.db"
                  );
                }
              }
            }}
          >
            Save
          </Button>
          <Button
            className="flex-grow"
            size="sm"
            onClick={() => {
              window
                .showOpenFilePicker({
                  types: [
                    {
                      description: "SQLite Files",
                      accept: {
                        "application/x-sqlite3": [
                          ".db",
                          ".sdb",
                          ".sqlite",
                          ".db3",
                          ".s3db",
                          ".sqlite3",
                          ".sl3",
                          ".db2",
                          ".s2db",
                          ".sqlite2",
                          ".sl2",
                        ],
                      },
                    },
                  ],
                })
                .then(([fileHandler]) => {
                  setHandler(fileHandler);
                });
            }}
          >
            Open
          </Button>
        </div>
      </div>
    );
  }, [rawDb, handler, db, fileName]);

  useEffect(() => {
    if (handler && db) {
      const onBeforeClose = (e: Event) => {
        if (db.hasChanged()) {
          e.preventDefault();
          return "Are you sure you want to close without change?";
        }
      };

      window.addEventListener("beforeunload", onBeforeClose);
      return () => window.removeEventListener("beforeunload", onBeforeClose);
    }
  }, [db, handler]);

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
      <ScreenDropZone onFileDrop={setHandler} />
      {dom}
    </>
  );
}
