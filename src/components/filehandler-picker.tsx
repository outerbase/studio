import { useCallback, useEffect, useState } from "react";
import { Button, buttonVariants } from "./ui/button";
import { localDb } from "@/indexdb";
import { LucideFile, LucideFolderClosed } from "lucide-react";
import { cn } from "@/lib/utils";
import { SavedConnectionLocalStorage } from "@/app/(theme)/connect/saved-connection-storage";
import { unsupportFileHandlerDialogContent } from "./screen-dropzone";
import { useCommonDialog } from "./common-dialog";

/**
 * Cleanup file handler from indexdb database when
 * it is no longer needed.
 */
async function cleanupFileHandler() {
  const connectionList = SavedConnectionLocalStorage.getDetailList();
  const validHandlerIds = new Set(
    connectionList.map((c) => c.config?.filehandler).filter(Boolean) as string[]
  );

  const fileHandlerList = (await localDb.file_handler.toArray()).map(
    (r) => r.id
  );

  for (const id of fileHandlerList) {
    if (!validHandlerIds.has(id)) {
      await localDb.file_handler.delete(id);
    }
  }
}

async function openFileHandler() {
  const [newFileHandler] = await window.showOpenFilePicker({
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
  });

  const id = crypto.randomUUID();
  localDb.file_handler.add({ id, handler: newFileHandler }).then();

  return id;
}

export default function FileHandlerPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (file: string) => void;
}) {
  const [handler, setHandler] = useState<FileSystemHandle>();
  const { showDialog } = useCommonDialog();

  useEffect(() => {
    if (value) {
      localDb.file_handler.get(value).then((data) => {
        if (data?.handler) {
          setHandler(data.handler);
        }
      });
    }
  }, [value]);

  const onChangeFile = useCallback(() => {
    try {
      cleanupFileHandler()
        .then(openFileHandler)
        .then(onChange)
        .catch(() => {
          showDialog(unsupportFileHandlerDialogContent);
        });
    } catch {
      showDialog(unsupportFileHandlerDialogContent);
    }
  }, [onChange, showDialog]);

  if (handler) {
    return (
      <div
        onClick={onChangeFile}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full justify-start cursor-pointer"
        )}
      >
        <LucideFile className="w-4 h-4 mr-2" />
        {handler.name}
      </div>
    );
  }

  return (
    <Button onClick={onChangeFile} variant={"outline"}>
      <LucideFolderClosed className="w-4 h-4 mr-2" />
      Open File
    </Button>
  );
}
