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
import { deleteOuterbaseDashboard } from "@/outerbase-cloud/api";
import { LucideLoader } from "lucide-react";
import { useCallback, useState } from "react";

export const deleteBoardDialog = createDialog<{
  workspaceId: string;
  boardId: string;
  boardName: string;
}>(({ close, boardName, workspaceId, boardId }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const deleteClicked = useCallback(() => {
    if (name !== boardName) return;

    setLoading(true);

    deleteOuterbaseDashboard(workspaceId, boardId)
      .then(() => {
        close(undefined);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [name, workspaceId, boardId, close, boardName]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Confirm deletion of board {boardName}</DialogTitle>
        <DialogDescription>
          All saved charts and any other contributions made to your Dashboard
          will be deleted. This action is permanent and <strong>cannot</strong>{" "}
          be undone.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div>
          <CopyableText text={boardName} />
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
          variant={"destructive"}
          disabled={loading || boardName !== name}
          onClick={deleteClicked}
        >
          {loading && <LucideLoader className="mr-2 h-4 w-4 animate-spin" />}I
          understand, delete this board
        </Button>
        <Button variant={"secondary"} onClick={() => close(undefined)}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );
});
