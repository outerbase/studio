import { useMemo } from "react";
import {
  SavedConnectionItem,
  SavedConnectionLocalStorage,
  SavedConnectionStorage,
} from "./saved-connection-storage";
import ConnectionDialogContent from "./saved-connection-content";
import SavedConnectionConfig from "./saved-connection-config";

type SaveCompleteHandler = (v: SavedConnectionItem) => void;

interface Props {
  id: string;
  storage: SavedConnectionStorage;
  onSaveComplete: SaveCompleteHandler;
  onClose: () => void;
}

function EditLocal({
  id,
  onSaveComplete,
}: Readonly<{ id: string; onSaveComplete: SaveCompleteHandler }>) {
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
  onSaveComplete,
  onClose,
}: Readonly<Props>) {
  return (
    <ConnectionDialogContent title="Edit Connection" onClose={onClose}>
      <EditLocal id={id} onSaveComplete={onSaveComplete} />
    </ConnectionDialogContent>
  );
}
