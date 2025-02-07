"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWorkspaces } from "../../workspace-provider";

export default function useRedirectValidWorkspace() {
  const { workspaceId } = useParams();
  const { currentWorkspace, workspaces, loading } = useWorkspaces();
  const router = useRouter();

  useEffect(() => {
    // If the current workspace is not found, redirect to the first workspace
    if (loading) return;
    if (!workspaceId) return;
    if (workspaceId === "local-workspace") return;
    if (typeof window === "undefined") return;

    if (!currentWorkspace) {
      if (workspaces?.length) {
        router.replace(`/w/${workspaces[0].short_name}`);
      }
    }
  }, [loading, workspaces, currentWorkspace, workspaceId, router]);
}
