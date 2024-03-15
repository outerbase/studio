"use client";
import { useCallback, useState } from "react";
import ConnectionDialogContent from "./saved-connection-content";
import SaveConnectionType from "./saved-connection-type";
import ConnectionDialog from "./connection-dialog";
import {
  SavedConnectionItemConfig,
  SavedConnectionItemWithoutId,
  SavedConnectionLocalStorage,
  SavedConnectionStorage,
} from "@/app/connect/saved-connection-storage";

type SaveConnectionStep = "storage" | "config";

export default function SaveConnection({
  onSaveComplete,
}: Readonly<{
  onSaveComplete: (storageType: SavedConnectionStorage) => void;
}>) {
  const [storage, setStorage] = useState<SavedConnectionStorage>();
  const [step, setStep] = useState<SaveConnectionStep>("storage");

  const onConnectionTypeSelected = useCallback(
    (type: SavedConnectionStorage) => {
      setStep("config");
      setStorage(type);
    },
    [setStep]
  );

  const onSaveConnection = useCallback(
    (data: SavedConnectionItemConfig) => {
      if (storage) {
        const finalConfig: SavedConnectionItemWithoutId = { ...data, storage };

        if (!finalConfig.storage || finalConfig.storage === "local_storage") {
          SavedConnectionLocalStorage.save(finalConfig);
          onSaveComplete(storage);
        }
      }
    },
    [storage, onSaveComplete]
  );

  return (
    <ConnectionDialogContent>
      {step === "storage" && (
        <SaveConnectionType onContinue={onConnectionTypeSelected} />
      )}
      {step === "config" && <ConnectionDialog onSave={onSaveConnection} />}
    </ConnectionDialogContent>
  );
}
