import { useEffect, useMemo, useState } from "react";
import {
  SavedConnectionItem,
  SavedConnectionItemConfig,
  SavedConnectionLocalStorage,
  SavedConnectionStorage,
} from "./saved-connection-storage";
import ConnectionDialogContent from "./saved-connection-content";
import SavedConnectionConfig from "./saved-connection-config";
import { getDatabase, updateDatabase } from "@/lib/api/fetch-databases";
import { LucideLoader2 } from "lucide-react";

type SaveCompleteHandler = (v: SavedConnectionItem) => void;

interface Props {
  conn: SavedConnectionItem;
  storage: SavedConnectionStorage;
  onSaveComplete: SaveCompleteHandler;
  onClose: () => void;
}

function EditRemote({
  id,
  onSaveComplete,
  onClose,
}: Readonly<{
  id: string;
  onSaveComplete: SaveCompleteHandler;
  onClose: () => void;
}>) {
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [initialData, setInitialData] = useState<SavedConnectionItemConfig>();

  useEffect(() => {
    getDatabase(id)
      .then((r) => {
        return setInitialData({
          name: r.name,
          description: r.description,
          label: r.label,
          driver: r.driver,
          config: {
            url: r.config.url,
            token: r.config.token,
          },
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div>
        <LucideLoader2 className="mb-5 animate-spin w-12 h-12" />
        <p>Please wait a moment. Fetching connection detail.</p>
      </div>
    );
  }

  if (!initialData) {
    return <div>Something wrong.</div>;
  }

  return (
    <SavedConnectionConfig
      driver={initialData.driver ?? "turso"}
      initialData={initialData}
      showLockedCredential
      loading={saveLoading}
      onClose={onClose}
      onSave={(conn) => {
        setSaveLoading(true);
        updateDatabase(id, {
          name: conn.name,
          driver: conn.driver,
          description: conn.description,
          label: conn.label,
          config: {
            token: conn.config.token,
            url: conn.config.url,
          },
        })
          .then(() => {
            onSaveComplete({
              id: id,
              driver: conn.driver,
              name: conn.name,
              storage: "remote",
              description: conn.description,
              label: conn.label,
            });
          })
          .finally(() => {
            setSaveLoading(false);
          });
      }}
    />
  );
}

function EditLocal({
  id,
  onSaveComplete,
  onClose,
}: Readonly<{
  id: string;
  onSaveComplete: SaveCompleteHandler;
  onClose: () => void;
}>) {
  useEffect(() => {
    fetch("/");
  }, []);

  const initialData = useMemo(() => {
    return SavedConnectionLocalStorage.get(id);
  }, [id]);

  if (!initialData) {
    return <div>We cannot find this connection config in local storage</div>;
  }

  return (
    <SavedConnectionConfig
      onClose={onClose}
      driver={initialData.driver ?? "turso"}
      initialData={initialData}
      onSave={(conn) => {
        SavedConnectionLocalStorage.update(id, conn);
        onSaveComplete({
          id: id,
          name: conn.name,
          driver: conn.driver,
          storage: "local",
          description: conn.description,
          label: conn.label,
        });
      }}
    />
  );
}

export default function EditSavedConnection({
  conn,
  storage,
  onSaveComplete,
  onClose,
}: Readonly<Props>) {
  return (
    <ConnectionDialogContent
      driver={conn.driver ?? "turso"}
      title="Edit Connection"
      onClose={onClose}
    >
      {storage === "local" ? (
        <EditLocal
          id={conn.id}
          onSaveComplete={onSaveComplete}
          onClose={onClose}
        />
      ) : (
        <EditRemote
          id={conn.id}
          onSaveComplete={onSaveComplete}
          onClose={onClose}
        />
      )}
    </ConnectionDialogContent>
  );
}
