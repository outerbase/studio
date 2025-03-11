import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStudioContext } from "@/context/driver-provider";
import { SavedDocNamespace } from "@/drivers/saved-doc/saved-doc-driver";
import { useCallback, useState } from "react";

interface Props {
  onClose: () => void;
  onComplete: () => void;
  value: SavedDocNamespace;
}

export default function RenameNamespaceDialog({
  onClose,
  onComplete,
  value,
}: Props) {
  const { docDriver } = useStudioContext();
  const [namespace, setNamespace] = useState(value.name);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onRenameNamespace = useCallback(() => {
    if (docDriver) {
      if (namespace && namespace.length > 2) {
        setLoading(true);
        docDriver
          .updateNamespace(value.id, namespace)
          .then(() => {
            onClose();
            onComplete();
          })
          .catch((e) => {
            setError((e as Error).message);
          })
          .finally(() => setLoading(false));
      } else {
        setError("The namespace name must be at least 3 characters long");
      }
    }
  }, [docDriver, namespace, onComplete, onClose, value]);

  return (
    <Dialog
      open
      onOpenChange={(openState) => {
        if (!openState) onClose();
      }}
    >
      <DialogContent>
        <DialogTitle>Rename Namespace</DialogTitle>
        <DialogDescription>
          A namespace is similar to a folder that groups your work together. It
          helps you organize and arrange your queries
        </DialogDescription>
        <Input
          placeholder="Please enter namespace"
          autoFocus
          value={namespace}
          onChange={(e) => setNamespace(e.currentTarget.value)}
        />
        {error && <div className="-mt-2 text-xs text-red-500">{error}</div>}
        <DialogFooter>
          <Button onClick={onRenameNamespace} disabled={loading}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
