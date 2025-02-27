"use client";
import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import OuterbaseLogo from "@/components/icons/outerbase";
import { Button } from "@/components/orbit/button";
import { Input } from "@/components/orbit/input";
import { Label } from "@/components/orbit/label";
import { strippedWorkspaceName } from "@/lib/utils";
import { createOuterbaseWorkspace } from "@/outerbase-cloud/api-workspace";
import useOuterbaseMutation from "@/outerbase-cloud/hook";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const FRIENDLY_ERROR_NAME: Record<string, string> = {
  SHORT_NAME_TAKEN: "Workspace URL is unavailable.",
};

export default function NewWorkspacePage() {
  const {
    loading,
    error,
    trigger: createWorkspace,
  } = useOuterbaseMutation(createOuterbaseWorkspace);

  const router = useRouter();
  const { refreshPartial } = useWorkspaces();
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");

  const finalShortName = shortName || strippedWorkspaceName(name);

  const onCreateClicked = useCallback(() => {
    createWorkspace({
      name,
      short_name: finalShortName,
    }).then((workspace) => {
      if (workspace) {
        refreshPartial(workspace);
        router.push(`/w/${workspace.short_name}`);
      }
    });
  }, [name, finalShortName, createWorkspace, refreshPartial, router]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex w-1/2 items-center border-r">
        <div className="mx-auto flex w-full max-w-[400px] flex-col gap-4">
          <div>
            <OuterbaseLogo className="h-6" />
          </div>

          <h1 className="text-primary mb-8 text-2xl font-semibold">
            New Workspace
          </h1>

          <Label title="Workspace Name" required>
            <Input
              autoFocus
              placeholder="Enter workspace name"
              size="lg"
              value={name}
              onValueChange={setName}
            />
          </Label>

          <Label title="Workspace URL" required>
            <Input
              preText="studio.outerbase.com/"
              placeholder=""
              size="lg"
              value={shortName || strippedWorkspaceName(name)}
              onValueChange={setShortName}
            />
          </Label>

          {error && (
            <p className="text-sm text-red-500">
              {FRIENDLY_ERROR_NAME[error.message] ?? error.message}
            </p>
          )}

          <div className="mt-4">
            <Button
              loading={loading}
              size="lg"
              variant="primary"
              onClick={onCreateClicked}
              disabled={!name || !finalShortName}
            >
              Create Workspace
            </Button>
          </div>
        </div>
      </div>
      <div className="w-1/2"></div>
    </div>
  );
}
