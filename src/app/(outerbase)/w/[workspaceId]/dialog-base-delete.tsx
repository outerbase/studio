import CopyableText from "@/components/copyable-text";
import { createDialog } from "@/components/create-dialog";
import LabelInput from "@/components/label-input";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteOuterbaseBase } from "@/outerbase-cloud/api";
import { LucideLoader } from "lucide-react";
import { useCallback, useState } from "react";

export const deleteBaseDialog = createDialog<{
  workspaceId: string;
  baseId: string;
  baseName: string;
}>(({ close, baseName, workspaceId, baseId }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const deleteClicked = useCallback(() => {
    if (name !== baseName) return;

    setLoading(true);

    deleteOuterbaseBase(workspaceId, baseId)
      .then(() => {
        close(undefined);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [name, workspaceId, baseId, close, baseName]);

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
