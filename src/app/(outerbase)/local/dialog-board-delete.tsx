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
import { useCallback, useState } from "react";
import { deleteLocalDashboard } from "./hooks";

export const deleteLocalBoardDialog = createDialog<{
  boardId: string;
  boardName: string;
}>(({ close, boardName, boardId }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const deleteClicked = useCallback(() => {
    if (name !== boardName) return;

    setLoading(true);

    deleteLocalDashboard(boardId)
      .then(() => {
        close(undefined);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [name, boardId, close, boardName]);

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
          loading={loading}
          variant={"destructive"}
          disabled={loading || boardName !== name}
          onClick={deleteClicked}
        >
          I understand, delete this board
        </Button>
        <Button variant={"secondary"} onClick={() => close(undefined)}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  );
});
