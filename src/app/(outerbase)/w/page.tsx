"use client";

import PageLoading from "@/components/page-loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "../session-provider";
import { useWorkspaces } from "../workspace-provider";

export default function OuterbaseMainPage() {
  const { token, isLoading, session } = useSession();
  const { workspaces } = useWorkspaces();
  const router = useRouter();

  useEffect(() => {
    // If there is no token, it means user has not logged in before.
    // We will forward them to local workspace.
    if (!token) {
      router.push("/w/local-workspace");
      return;
    } else if (!isLoading && session && workspaces) {
      // Valid session, we will forward to the first workspace
      if (workspaces.length) {
        router.push(`/w/${workspaces[0].short_name}`);
      }
    } else if (!isLoading && !session) {
      // Invalid session, it might be expired session. We will
      // ask them for login again
      router.push("/sigin");
    }
  }, [token, session, isLoading, workspaces, router]);

  return <PageLoading>Loading Session</PageLoading>;
}
