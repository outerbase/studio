"use client";
import { saveAs } from "file-saver";
import SqljsDriver from "@/drivers/sqljs-driver";
import {
  FolderOpenIcon,
  LucideFile,
  LucideLoader,
  RefreshCcw,
  Save,
} from "lucide-react";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Database, SqlJsStatic } from "sql.js";
import ScreenDropZone from "@/components/screen-dropzone";
import { toast } from "sonner";
import downloadFileFromUrl from "@/lib/download-file";
import { useSearchParams } from "next/navigation";
import { localDb } from "@/indexdb";
import { SavedConnectionLocalStorage } from "@/app/(theme)/connect/saved-connection-storage";
import { Studio } from "@/components/gui/studio";
import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
} from "@/components/gui/toolbar";
import { StudioExtensionManager } from "@/core/extension-manager";
import { createStandardExtensions } from "@/core/standard-extension";

const SQLITE_FILE_EXTENSIONS =
  ".db,.sdb,.sqlite,.db3,.s3db,.sqlite3,.sl3,.db2,.s2db,.sqlite2,.sl2";

export default function PlaygroundEditorBody({
  preloadDatabase,
}: {
  preloadDatabase?: string | null;
}) {
  const [sqlInit, setSqlInit] = useState<SqlJsStatic>();
  const searchParams = useSearchParams();
  const [databaseLoading, setDatabaseLoading] = useState(!!preloadDatabase);

  const [nativeDriver, setNativeDriver] = useState<Database>();
  const [driver, setDriver] = useState<SqljsDriver>();

  const [handler, setHandler] = useState<FileSystemFileHandle>();
  const [fileName, setFilename] = useState("");

  /**
   * Initialize the SQL.js library.
   */
  const onReady = useCallback(() => {
    window
      .initSqlJs({
        locateFile: (file) => `/sqljs/${file}`,
      })
      .then(setSqlInit);
  }, []);

  /**
   * Load the database from the buffer.
   */
  const loadDatabaseFromBuffer = useCallback(
    (buffer: ArrayBuffer) => {
      if (sqlInit) {
        const sqljsDatabase = new sqlInit.Database(new Uint8Array(buffer));
        setNativeDriver(sqljsDatabase);
        setDriver(new SqljsDriver(sqljsDatabase));
      }
    },
    [sqlInit]
  );

  /**
   * Load the database from the file.
   */
  const loadDatabaseFromFile = useCallback(
    (file: File) => {
      setFilename(file.name);
      file.arrayBuffer().then(loadDatabaseFromBuffer);
    },
    [loadDatabaseFromBuffer]
  );

  /*
   * Load the database from the file handler.
   */
  const loadDatabaseFromFileHandler = useCallback(
    (fileHandler: FileSystemFileHandle) => {
      fileHandler.getFile().then(loadDatabaseFromFile);
    },
    [loadDatabaseFromFile]
  );

  /**
   * Load the database when file handler changed
   */
  useEffect(() => {
    if (handler) {
      loadDatabaseFromFileHandler(handler);
    }
  }, [handler, loadDatabaseFromFileHandler]);

  /**
   * Callback when a file is dropped on the screen.
   */
  const onFileDrop = useCallback(
    (file?: File, fileHandler?: FileSystemFileHandle) => {
      if (file) {
        loadDatabaseFromFile(file);
        setHandler(undefined);
      } else if (fileHandler) {
        setHandler(fileHandler);
      }
    },
    [loadDatabaseFromFile]
  );

  /**
   * Trying to initial the database from preloadDatabase or session id.
   * If no database source provided, we will create a new empty database.
   */
  useEffect(() => {
    if (sqlInit) {
      if (preloadDatabase) {
        downloadFileFromUrl(preloadDatabase)
          .then(loadDatabaseFromBuffer)
          .finally(() => setDatabaseLoading(false));
      } else if (searchParams.get("s")) {
        const sessionId = searchParams.get("s");
        if (!sessionId) return;

        loadDatabaseFileHandlerFromSessionId(sessionId).then((handler) => {
          if (handler) {
            setHandler(handler);
          }
        });
      } else {
        // If no database is provided, we will create a new empty database.
        const sqljsDatabase = new sqlInit.Database();
        setNativeDriver(sqljsDatabase);
        setDriver(new SqljsDriver(sqljsDatabase));
      }
    }
  }, [sqlInit, preloadDatabase, searchParams, loadDatabaseFromBuffer]);

  /**
   * Reload the database from the file handler.
   */
  const onReloadDatabase = useCallback(() => {
    if (driver && driver.hasChanged()) {
      if (
        !confirm(
          "You have some changes. Refresh will lose your change. Do you want to refresh"
        )
      ) {
        return;
      }
    }

    if (handler) loadDatabaseFromFileHandler(handler);
  }, [loadDatabaseFromFileHandler, handler, driver]);

  /**
   * Ask for confirmation before closing the tab if there are changes.
   */
  useEffect(() => {
    if (driver) {
      const onBeforeClose = (e: Event) => {
        if (driver.hasChanged()) {
          e.preventDefault();
          return "Are you sure you want to close without change?";
        }
      };

      window.addEventListener("beforeunload", onBeforeClose);
      return () => window.removeEventListener("beforeunload", onBeforeClose);
    }
  }, [driver]);

  /**
   * Open the file picker to select the SQLite file.
   * Prioritize the new File System API if available.
   * If not, fallback to the traditional file input.
   */
  const onOpenClicked = useCallback(() => {
    if (window.showOpenFilePicker) {
      window
        .showOpenFilePicker({
          types: [
            {
              description: "SQLite Files",
              accept: {
                "application/x-sqlite3": SQLITE_FILE_EXTENSIONS.split(",") as
                  | `.${string}`
                  | `.${string}`[],
              },
            },
          ],
        })
        .then(([fileHandler]) => {
          setHandler(fileHandler);
        });
    } else {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = SQLITE_FILE_EXTENSIONS;
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          loadDatabaseFromFile(file);
          setHandler(undefined);
        }
      };

      input.click();
    }
  }, [loadDatabaseFromFile]);

  /**
   * Save the database back to the file. Prioritize the new File System API if available.
   * If not, fallback to the traditional file download.
   */
  const onSaveClicked = useCallback(() => {
    if (!nativeDriver) return;

    if (handler) {
      // If the browser support FileSystemHandler, we save directly back to the file.
      handler
        .createWritable()
        .then((writable) => {
          writable.write(nativeDriver.export());
          writable.close();
          toast.success(
            <div>
              Successfully save <strong>{fileName}</strong>
            </div>
          );
          driver?.resetChange();
        })
        .catch(console.error);
    } else {
      // Fallback to file download instead of direct file save.
      saveAs(
        new Blob([nativeDriver.export()], {
          type: "application/x-sqlite3",
        }),
        "sqlite-dump.db"
      );
    }
  }, [driver, fileName, handler, nativeDriver]);

  const extensions = useMemo(() => {
    return new StudioExtensionManager(createStandardExtensions());
  }, []);

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

    if (driver) {
      return (
        <Studio
          extensions={extensions}
          color="gray"
          name="Playground"
          driver={driver}
          containerClassName="w-full h-full"
        />
      );
    }

    return <div></div>;
  }, [databaseLoading, preloadDatabase, driver, extensions]);

  return (
    <>
      <Script src="/sqljs/sql-wasm.js" onReady={onReady} />
      <ScreenDropZone onFileDrop={onFileDrop} />
      <div className="w-screen h-screen flex flex-col">
        <div className="border-b p-1">
          <Toolbar>
            {fileName && (
              <div className="text-xs rounded bg-yellow-300 text-black flex gap-1 items-center p-2">
                <LucideFile className="w-4 h-4" />
                <span>
                  Editing <strong>{fileName}</strong>
                </span>
              </div>
            )}

            {driver && (
              <ToolbarButton
                text="Save"
                onClick={onSaveClicked}
                icon={<Save className="w-4 h-4" />}
              />
            )}

            <ToolbarButton
              text="Open"
              onClick={onOpenClicked}
              icon={<FolderOpenIcon className="w-4 h-4" />}
            />

            {handler && (
              <>
                <ToolbarSeparator />
                <ToolbarButton
                  text="Refresh"
                  icon={<RefreshCcw className="w-4 h-4" />}
                  onClick={onReloadDatabase}
                />
              </>
            )}
          </Toolbar>
        </div>
        <div className="flex-1 overflow-hidden">{dom}</div>
      </div>
    </>
  );
}

/**
 * Returns the file handler from the session id if it exists. Otherwise, it will return undefined.
 *
 * @param sessionId
 * @returns
 */
async function loadDatabaseFileHandlerFromSessionId(sessionId: string) {
  const session = SavedConnectionLocalStorage.get(sessionId);
  if (!session) return;

  const fileHandlerId = session?.config.filehandler;
  if (!fileHandlerId) return;

  const sessionData = await localDb.file_handler.get(fileHandlerId);
  if (sessionData?.handler) {
    const permission = await sessionData.handler.queryPermission();
    if (permission !== "granted") {
      await sessionData.handler.requestPermission();
      return sessionData.handler;
    } else {
      return sessionData.handler;
    }
  }
}
