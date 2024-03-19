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
import { createDatabase } from "@/lib/api/fetch-databases";

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
  const [loading, setLoading] = useState(false);

  const onConnectionTypeSelected = useCallback(
    (type: SavedConnectionStorage) => {
      setStep("config");
      setStorage(type);
    },
    [setStep]
  );

  const onSaveConnection = useCallback(
    (data: SavedConnectionItemConfig) => {
      if (storage === "remote") {
        setLoading(true);
        createDatabase({ ...data, driver: "turso" })
          .then((r) => onSaveComplete(r.data))
          .finally(() => {
            setLoading(false);
          });
      } else {
        const finalConfig: SavedConnectionItemWithoutId = {
          ...data,
          storage: storage ?? "local",
        };
        const conn = SavedConnectionLocalStorage.save(finalConfig);

        onSaveComplete({
          id: conn.id,
          name: finalConfig.name,
          storage: "local",
          description: finalConfig.description,
          label: finalConfig.label,
        });
      }
    },
    [storage, onSaveComplete]
  );

  return (
    <ConnectionDialogContent title="New Connection" onClose={onClose}>
      {step === "storage" && (
        <SaveConnectionType onContinue={onConnectionTypeSelected} />
      )}
      {step === "config" && (
        <SavedConnectionConfig onSave={onSaveConnection} loading={loading} />
      )}
    </ConnectionDialogContent>
  );
}
