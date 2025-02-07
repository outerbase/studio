import {
  DRIVER_DETAIL,
  SavedConnectionItem,
  SavedConnectionItemConfig,
  SavedConnectionItemWithoutId,
  SavedConnectionLocalStorage,
  SavedConnectionStorage,
  SupportedDriver,
} from "@/app/(theme)/connect/saved-connection-storage";
import { WEBSITE_NAME } from "@/const";
import { createDatabase } from "@/lib/api/fetch-databases";
import { User } from "lucia";
import { useCallback, useState } from "react";
import SavedConnectionConfig from "./saved-connection-config";
import ConnectionDialogContent from "./saved-connection-content";
import SaveConnectionType from "./saved-connection-type";

type SaveConnectionStep = "storage" | "config";

export function RqliteInstruction() {
  return (
    <div className="bg-secondary mb-4 p-4 text-sm">
      You should include {WEBSITE_NAME} in the list of allowed origins for CORS
      (Cross-Origin Resource Sharing)
      <pre className="mt-2">
        <code>{`rqlited --http-allow-origin="https://libsqlstudio.com"`}</code>
      </pre>
    </div>
  );
}

export function CloudflareWarning() {
  return (
    <div className="bg-secondary mb-4 p-4 text-sm">
      To bypass CORS (Cross-Origin Resource Sharing) restrictions, we will route
      your request through our server. If you are fine with this, please
      proceed.
    </div>
  );
}

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
  const [step, setStep] = useState<SaveConnectionStep>(() => {
    if (!user) return "config";
    if (DRIVER_DETAIL[driver].disableRemote) return "config";
    return "storage";
  });
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
    <ConnectionDialogContent
      driver={driver}
      title="New Connection"
      onClose={onClose}
    >
      {step === "storage" && (
        <SaveConnectionType onContinue={onConnectionTypeSelected} />
      )}
      {step === "config" && (
        <>
          {driver === "rqlite" && storage === "local" && <RqliteInstruction />}
          {driver === "cloudflare-d1" && storage === "local" && (
            <CloudflareWarning />
          )}
          <SavedConnectionConfig
            driver={driver}
            onClose={onClose}
            onSave={onSaveConnection}
            loading={loading}
          />
        </>
      )}
    </ConnectionDialogContent>
  );
}
