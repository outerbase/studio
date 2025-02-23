import CopyableText from "@/components/copyable-text";
import { createDialog } from "@/components/create-dialog";
import LabelInput from "@/components/label-input";
import { Button } from "@/components/orbit/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LucideLoader } from "lucide-react";
import { useCallback, useState } from "react";
import { removeLocalConnection } from "./hooks";

export const deleteLocalBaseDialog = createDialog<{
  baseId: string;
  baseName: string;
}>(({ close, baseName, baseId }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const deleteClicked = useCallback(async () => {
    if (name !== baseName) return;

    setLoading(true);
    await removeLocalConnection(baseId);
    setLoading(false);

    close(undefined);
  }, [name, baseId, close, baseName]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Confirm deletion of {baseName}</DialogTitle>
        <DialogDescription>
          All saved queries, dashboards, definitions and any other contributions
          made to your Base will be deleted. This action is permanent and{" "}
          <strong>cannot</strong>
          be undone.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div>
          <CopyableText text={baseName} />
        </div>

        <LabelInput
          label="Enter the name of this Base to confirm:"
          placeholder="Board name"
          value={name}
          required
          onChange={(e) => setName(e.currentTarget.value)}
        />
      </div>

      <DialogFooter>
        <Button
          disabled={loading || baseName !== name}
          onClick={deleteClicked}
          variant={"destructive"}
        >
          {loading && <LucideLoader className="mr-2 h-4 w-4 animate-spin" />}I
          understand, delete this base
        </Button>
        <Button variant={"secondary"} onClick={() => close(undefined)}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );
});
