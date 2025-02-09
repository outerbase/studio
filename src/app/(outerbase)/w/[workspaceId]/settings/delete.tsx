import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
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
import { OuterbaseAPIWorkspace } from "@/outerbase-cloud/api-type";
import { deleteOuterbaseWorkspace } from "@/outerbase-cloud/api-workspace";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

function DeleteWorkspaceDialog({
  workspace,
  close,
}: {
  workspace: OuterbaseAPIWorkspace;
  close: (value: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const onDeletedClicked = useCallback(() => {
    setLoading(true);
    deleteOuterbaseWorkspace(workspace.id)
      .then(() => {
        close(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [close, workspace]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Confirm deletion of {workspace.name}</DialogTitle>
      </DialogHeader>

      <DialogDescription className="text-base">
        Deleting this workspace will delete all Bases and revoke all connections
        made to your databases. All members will lose access. This action is
        permanent and cannot be undone.
      </DialogDescription>

      <div className="flex flex-col gap-4">
        <div>
          <CopyableText text={workspace.name} />
        </div>

        <LabelInput
          label="Enter the name of this Workspace to confirm:"
          placeholder="Enter workspace name"
          size="lg"
          value={name}
          onValueChange={setName}
        />
      </div>

      <DialogFooter>
        <Button
          disabled={name !== workspace.name}
          variant="destructive"
          loading={loading}
          onClick={onDeletedClicked}
        >
          I understand, delete my workspace
        </Button>
        <Button onClick={() => close(false)}>Cancel</Button>
      </DialogFooter>
    </>
  );
}

const deleteWorkspaceDialog = createDialog<
  {
    workspace: OuterbaseAPIWorkspace;
  },
  boolean
>(
  ({ workspace, close }) => {
    return <DeleteWorkspaceDialog workspace={workspace} close={close} />;
  },
  { defaultValue: false, slot: "workspace" }
);

export default function WorkspaceDeleteSection({
  workspace,
}: {
  workspace: OuterbaseAPIWorkspace;
}) {
  const router = useRouter();
  const { refreshWorkspace } = useWorkspaces();

  const onDeleteClicked = useCallback(async () => {
    const success = await deleteWorkspaceDialog.show({ workspace });
    if (success) {
      refreshWorkspace().then(() => router.push("/"));
    }
  }, [workspace, router, refreshWorkspace]);

  return (
    <div className="mt-12 flex flex-col gap-4">
      <h2 className="font-bold">Delete workspace</h2>
      <p className="text-base">
        This will delete all Bases within this workspace. All members will lose
        access.
      </p>

      <div>
        <Button size="lg" variant="destructive" onClick={onDeleteClicked}>
          Delete Workspace
        </Button>
      </div>
    </div>
  );
}
