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
  SupportedDriver,
} from "@/app/connect/saved-connection-storage";
import SavedConnectionConfig from "./saved-connection-config";
import { createDatabase } from "@/lib/api/fetch-databases";
import { User } from "lucia";

type SaveConnectionStep = "storage" | "config";

export default function SaveConnection({
  user,
  driver,
  onSaveComplete,
  onClose,
}: Readonly<{
  user: User | null;
  driver: SupportedDriver;
  onSaveComplete: (storageType: SavedConnectionItem) => void;
  onClose: () => void;
}>) {
  const [storage, setStorage] = useState<SavedConnectionStorage | undefined>(
    user ? undefined : "local"
  );
  const [step, setStep] = useState<SaveConnectionStep>(
    user ? "storage" : "config"
  );
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
        createDatabase({ ...data, driver: data.driver ?? "turso" })
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
          driver: finalConfig.driver ?? "turso",
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
        <SavedConnectionConfig
          driver={driver}
          onSave={onSaveConnection}
          loading={loading}
        />
      )}
    </ConnectionDialogContent>
  );
}
