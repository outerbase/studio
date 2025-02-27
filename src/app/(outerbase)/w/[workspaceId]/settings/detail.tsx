"use client";
import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import LabelInput from "@/components/label-input";
import { Button } from "@/components/orbit/button";
import { OuterbaseAPIWorkspace } from "@/outerbase-cloud/api-type";
import { updateOuterbaseWorkspace } from "@/outerbase-cloud/api-workspace";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function WorkspaceDetailSection({
  workspace,
}: {
  workspace: OuterbaseAPIWorkspace;
}) {
  const router = useRouter();
  const { refreshWorkspace } = useWorkspaces();
  const [loading, setLoading] = useState(false);
  const [shortName, setShortName] = useState(workspace.short_name);
  const [name, setName] = useState(workspace.name);

  const onUpdateClicked = useCallback(() => {
    setLoading(true);
    updateOuterbaseWorkspace(workspace.id, { short_name: shortName, name })
      .then(() => {
        refreshWorkspace().then(() => {
          if (workspace.short_name !== shortName) {
            router.push(`/w/${shortName}/settings`);
          }
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));
  }, [shortName, name, workspace, router, refreshWorkspace]);

  return (
    <div className="mt-12 flex flex-col gap-4">
      <h2 className="font-bold">Details</h2>

      <div className="flex gap-2">
        <LabelInput
          value={name}
          onValueChange={setName}
          label="Workspace name"
          placeholder="Workspace name"
          size="lg"
        />
        <LabelInput
          value={shortName}
          onValueChange={setShortName}
          label="Workspace URL"
          preText="studio.outerbase.com/"
          placeholder="my-stellar-app"
          size="lg"
        />
        <div className="flex items-end">
          <Button
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!name}
            onClick={onUpdateClicked}
          >
            Update
          </Button>
        </div>
      </div>
    </div>
  );
}
