"use client";
import { useCallback, useState } from "react";
import ConnectionDialogContent from "./saved-connection-content";
import SaveConnectionType from "./saved-connection-type";
import {
  SavedConnectionItem,
  SavedConnectionItemConfig,
  SavedConnectionItemWithoutId,
  SavedConnectionLocalStorage,
  SavedConnectionStorage,
} from "@/app/connect/saved-connection-storage";
import SavedConnectionConfig from "./saved-connection-config";

type SaveConnectionStep = "storage" | "config";

export default function SaveConnection({
  onSaveComplete,
  onClose,
}: Readonly<{
  onSaveComplete: (storageType: SavedConnectionItem) => void;
  onClose: () => void;
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
          const conn = SavedConnectionLocalStorage.save(finalConfig);

          onSaveComplete({
            id: conn.id,
            name: finalConfig.name,
            storage,
            description: finalConfig.description,
            label: finalConfig.label,
          });
        }
      }
    },
    [storage, onSaveComplete]
  );

  return (
    <ConnectionDialogContent title="New Connection" onClose={onClose}>
      {step === "storage" && (
        <SaveConnectionType onContinue={onConnectionTypeSelected} />
      )}
      {step === "config" && <SavedConnectionConfig onSave={onSaveConnection} />}
    </ConnectionDialogContent>
  );
}
