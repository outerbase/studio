import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDatabaseDriver } from "@/context/driver-provider";
import { SavedDocNamespace } from "@/drivers/saved-doc/saved-doc-driver";
import { LucidePlus } from "lucide-react";
import { useCallback, useState } from "react";

interface CreateNamespaceButtonProps {
  onCreated: (v: SavedDocNamespace) => void;
}

export default function CreateNamespaceButton({
  onCreated,
}: CreateNamespaceButtonProps) {
  const { docDriver } = useDatabaseDriver();
  const [namespace, setNamespace] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const onCreateNamespace = useCallback(() => {
    if (docDriver) {
      if (namespace && namespace.length > 2) {
        docDriver
          .createNamespace(namespace)
          .then((n) => {
            onCreated(n);
            setOpen(false);
          })
          .catch((e) => {
            setError((e as Error).message);
          });
      } else {
        setError("The namespace name must be at least 3 characters long");
      }
    }
  }, [docDriver, namespace, onCreated]);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(openState) => {
          setOpen(openState);
          setNamespace("");
          setError("");
        }}
      >
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="mt-1 w-full justify-start"
          >
            <LucidePlus className="w-4 h-4 mr-2" />
            Create Namespace
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Create Namespace</DialogTitle>

          <DialogDescription>
            A namespace is similar to a folder that groups your work together.
            It helps you organize and arrange your queries
          </DialogDescription>

          <Input
            placeholder="Please enter namespace"
            autoFocus
            value={namespace}
            onChange={(e) => setNamespace(e.currentTarget.value)}
          />

          {error && <div className="text-xs text-red-500 -mt-2">{error}</div>}

          <DialogFooter>
            <Button onClick={onCreateNamespace}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
