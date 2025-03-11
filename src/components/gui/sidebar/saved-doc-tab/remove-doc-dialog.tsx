import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStudioContext } from "@/context/driver-provider";
import { SavedDocData } from "@/drivers/saved-doc/saved-doc-driver";
import { useCallback, useState } from "react";

interface Props {
  doc: SavedDocData;
  onClose: () => void;
  onComplete: () => void;
}

export default function RemoveDocDialog({ doc, onClose, onComplete }: Props) {
  const { docDriver } = useStudioContext();
  const [loading, setLoading] = useState(false);

  const onDeleteClicked = useCallback(() => {
    if (docDriver) {
      setLoading(true);
      docDriver
        .removeDoc(doc.id)
        .then(() => {
          onClose();
          onComplete();
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [doc, docDriver, onClose, onComplete]);

  return (
    <Dialog
      open
      onOpenChange={(openState) => {
        if (!openState) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogTitle>Delete {`"${doc.name}"`}</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete <strong>{doc.name}</strong>
        </DialogDescription>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={onDeleteClicked}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
