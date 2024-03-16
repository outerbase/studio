import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCallback, useMemo, useState } from "react";
import {
  SavedConnectionItem,
  SavedConnectionLocalStorage,
} from "./saved-connection-storage";

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
  const correctText = useMemo(() => conn.name.trim(), [conn]);

  const onRemoveClicked = useCallback(() => {
    if (confirmText === correctText) {
      SavedConnectionLocalStorage.remove(conn.id);
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
          <Button variant={"destructive"} onClick={onRemoveClicked}>
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
