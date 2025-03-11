import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStudioContext } from "@/context/driver-provider";
import {
  SavedDocData,
  SavedDocNamespace,
} from "@/drivers/saved-doc/saved-doc-driver";
import { useCallback, useState } from "react";

interface Props {
  onClose: () => void;
  onComplete: (removedDocs: SavedDocData[]) => void;
  value: SavedDocNamespace;
}

export default function RemoveNamespaceDialog({
  onClose,
  onComplete,
  value,
}: Props) {
  const { docDriver } = useStudioContext();
  const [loading, setLoading] = useState(false);

  const onDeleteClicked = useCallback(() => {
    if (docDriver) {
      setLoading(true);

      docDriver
        .getDocs()
        .then((docs) => {
          docDriver
            .removeNamespace(value.id)
            .then(() => {
              onClose();
              onComplete(
                docs.find((n) => n.namespace.id === value.id)?.docs ?? []
              );
            })
            .finally(() => {
              setLoading(false);
            });
        })
        .catch(console.error);
    }
  }, [value, docDriver, onClose, onComplete]);

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
        <DialogTitle>Delete {`"${value.name}"`}</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete <strong>{value.name}</strong>
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
