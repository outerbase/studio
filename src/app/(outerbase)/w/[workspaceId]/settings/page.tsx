"use client";
import { NavigationBar } from "@/app/(outerbase)/nav";
import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import { Loader } from "@/components/orbit/loader";
import WorkspaceDeleteSection from "./delete";
import WorkspaceDetailSection from "./detail";
import WorkspaceGatewaySection from "./gateway";
import WorkspaceMemberSection from "./members";

export default function WorkspaceBillingPage() {
  const { currentWorkspace } = useWorkspaces();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <NavigationBar />

      <div className="container mt-10 flex flex-col p-4">
        <h1 className="text-lg font-bold">Workspace settings</h1>

        {currentWorkspace ? (
          <>
            <WorkspaceDetailSection workspace={currentWorkspace} />
            <WorkspaceMemberSection />
            <WorkspaceGatewaySection />
            <WorkspaceDeleteSection workspace={currentWorkspace} />
          </>
        ) : (
          <div className="my-12 flex flex-col items-center justify-center gap-4">
            <Loader size={50} />
            Loading workspace...
          </div>
        )}
      </div>
    </div>
  );
}
