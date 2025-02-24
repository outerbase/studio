"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NavigationLayout from "./nav-layout";
import { ResourceItemList } from "./resource-item-helper";
import { useSession } from "./session-provider";
import { useWorkspaces } from "./workspace-provider";

export default function OuterbaseMainPage() {
  const router = useRouter();
  const { isLoading: sessionLoading, session } = useSession();
  const { workspaces, loading: workspaceLoading } = useWorkspaces();

  useEffect(() => {
    if (sessionLoading) return;

    // Invalid session, go to local connection
    if (!session) {
      router.push("/local");
    }

    if (workspaceLoading) return;
    if (!workspaces) return;

    // Redirect to the first workspace
    if (workspaces.length > 0) {
      router.push(`/w/${workspaces[0].short_name}`);
    } else {
      router.push("/local");
    }
  }, [session, sessionLoading, workspaceLoading, workspaces, router]);

  return (
    <NavigationLayout>
      <div className="flex flex-1 flex-col content-start gap-4 overflow-x-hidden overflow-y-auto p-4">
        <ResourceItemList boards={[]} bases={[]} loading />
      </div>
    </NavigationLayout>
  );
}
