"use client";
import { getOuterbaseWorkspace } from "@/outerbase-cloud/api";
import { OuterbaseAPIWorkspace } from "@/outerbase-cloud/api-type";
import { noop } from "lodash";
import { useParams, useRouter } from "next/navigation";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
import useSWR from "swr";
import { useSession } from "./session-provider";

const WorkspaceContext = createContext<{
  workspaces: OuterbaseAPIWorkspace[];
  currentWorkspace?: OuterbaseAPIWorkspace;
  refreshWorkspace: () => void;
  loading: boolean;
}>({ workspaces: [], loading: true, refreshWorkspace: noop });

export function useWorkspaces() {
  return useContext(WorkspaceContext);
}

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { token } = useSession();

  const { data, isLoading, mutate } = useSWR(
    token ? "workspaces" : undefined,
    () => {
      return getOuterbaseWorkspace();
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const { workspaceId } = useParams<{ workspaceId?: string }>();

  const currentWorkspace = useMemo(() => {
    if (!workspaceId) return;
    if (!data) return;

    return data?.items.find(
      (workspace) =>
        workspace.short_name === workspaceId || workspace.id === workspaceId
    );
  }, [workspaceId, data]);

  useEffect(() => {
    // If the current workspace is not found, redirect to the first workspace
    if (isLoading) return;
    if (!workspaceId) return;
    if (workspaceId === "local-workspace") return;
    if (typeof window === "undefined") return;

    if (!currentWorkspace) {
      if (data?.items.length) {
        router.replace(`/w/${data.items[0].short_name}`);
      }
    }
  }, [isLoading, data, currentWorkspace, workspaceId, router]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces: data?.items || [],
        loading: isLoading,
        currentWorkspace,
        refreshWorkspace: mutate,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
