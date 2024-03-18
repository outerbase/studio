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
  id: string;
  storage: SavedConnectionStorage;
  onSaveComplete: SaveCompleteHandler;
  onClose: () => void;
}

function EditRemote({
  id,
  onSaveComplete,
}: Readonly<{ id: string; onSaveComplete: SaveCompleteHandler }>) {
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
      initialData={initialData}
      showLockedCredential
      loading={saveLoading}
      onSave={(conn) => {
        setSaveLoading(true);
        updateDatabase(id, {
          name: conn.name,
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
}: Readonly<{ id: string; onSaveComplete: SaveCompleteHandler }>) {
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
      initialData={initialData}
      onSave={(conn) => {
        SavedConnectionLocalStorage.update(id, conn);
        onSaveComplete({
          id: id,
          name: conn.name,
          storage: "local",
          description: conn.description,
          label: conn.label,
        });
      }}
    />
  );
}

export default function EditSavedConnection({
  id,
  storage,
  onSaveComplete,
  onClose,
}: Readonly<Props>) {
  return (
    <ConnectionDialogContent title="Edit Connection" onClose={onClose}>
      {storage === "local" ? (
        <EditLocal id={id} onSaveComplete={onSaveComplete} />
      ) : (
        <EditRemote id={id} onSaveComplete={onSaveComplete} />
      )}
    </ConnectionDialogContent>
  );
}
