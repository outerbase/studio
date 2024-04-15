import { Button } from "@studio/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@studio/components/ui/dialog";
import { Input } from "@studio/components/ui/input";
import { useCallback, useMemo, useState } from "react";
import {
  SavedConnectionItem,
  SavedConnectionLocalStorage,
} from "./saved-connection-storage";
import { deleteDatabase } from "@studio/lib/api/fetch-databases";
import { LucideLoader } from "lucide-react";

interface Props {
  conn: SavedConnectionItem;
  onRemove: (conn: SavedConnectionItem) => void;
  onClose: () => void;
}

export default function RemoveSavedConnection({
  conn,
  onRemove,
  onClose,
}: Readonly<Props>) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const correctText = useMemo(() => conn.name.trim(), [conn]);

  const onRemoveClicked = useCallback(() => {
    if (confirmText === correctText) {
      if (conn.storage === "local") {
        SavedConnectionLocalStorage.remove(conn.id);
      } else {
        setLoading(true);
        deleteDatabase(conn.id)
          .then()
          .finally(() => setLoading(false));
      }

      onRemove(conn);
    }
  }, [onRemove, conn, confirmText, correctText]);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogTitle>Remove Connection</DialogTitle>

        <div className="flex flex-col gap-4">
          <p>
            Please type <strong className="text-red-500">{correctText}</strong>{" "}
            to confirm you removing connection.
          </p>

          <Input
            autoFocus
            placeholder="Type to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
          />
        </div>

        <DialogFooter>
          <Button
            variant={"destructive"}
            onClick={onRemoveClicked}
            disabled={loading}
          >
            {loading && <LucideLoader className="w-4 h-4 mr-2 animate-spin" />}
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
