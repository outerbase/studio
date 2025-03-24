"use client";
import NavigationHeader from "@/app/(outerbase)/nav-header";
import NavigationLayout from "@/app/(outerbase)/nav-layout";
import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import { Loader } from "@/components/orbit/loader";
import WorkspaceDeleteSection from "./delete";
import WorkspaceDetailSection from "./detail";

export const runtime = "edge";

export default function WorkspaceBillingPage() {
  const { currentWorkspace } = useWorkspaces();

  return (
    <NavigationLayout>
      <NavigationHeader />

      <div className="container mt-10 flex flex-col p-4">
        <h1 className="text-lg font-bold">Workspace settings</h1>

        {currentWorkspace ? (
          <>
            <WorkspaceDetailSection workspace={currentWorkspace} />
            {/* <WorkspaceMemberSection />
            <WorkspaceGatewaySection /> */}
            <WorkspaceDeleteSection workspace={currentWorkspace} />
          </>
        ) : (
          <div className="my-12 flex flex-col items-center justify-center gap-4">
            <Loader size={50} />
            Loading workspace...
          </div>
        )}
      </div>
    </NavigationLayout>
  );
}
