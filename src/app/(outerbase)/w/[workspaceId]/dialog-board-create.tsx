import { createDialog } from "@/components/create-dialog";
import LabelInput from "@/components/label-input";
import { Button } from "@/components/orbit/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createOuterbaseDashboard } from "@/outerbase-cloud/api";
import { OuterbaseAPIDashboardDetail } from "@/outerbase-cloud/api-type";
import { LucideLoader } from "lucide-react";
import { useCallback, useState } from "react";

export const createBoardDialog = createDialog<
  { workspaceId: string },
  OuterbaseAPIDashboardDetail | undefined
>(({ close, workspaceId }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const createBoardClicked = useCallback(() => {
    if (name.length === 0) return;

    setLoading(true);

    createOuterbaseDashboard(workspaceId, undefined, name)
      .then((createdBoard) => {
        close(createdBoard);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [close, name, workspaceId]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>New Board</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>

      <div>
        <LabelInput
          label="Board name"
          placeholder="Untitled Board"
          value={name}
          required
          onChange={(e) => setName(e.currentTarget.value)}
        />
      </div>

      <DialogFooter>
        <Button
          disabled={loading || name.length === 0}
          onClick={createBoardClicked}
        >
          {loading && <LucideLoader className="mr-2 h-4 w-4 animate-spin" />}
          Create Board
        </Button>
        <Button variant={"secondary"} onClick={() => close(undefined)}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );
});
