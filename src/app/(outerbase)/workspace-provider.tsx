"use client";
import { getOuterbaseWorkspace } from "@/outerbase-cloud/api";
import { OuterbaseAPIWorkspace } from "@/outerbase-cloud/api-type";
import { useParams } from "next/navigation";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import useSWR from "swr";

const WorkspaceContext = createContext<{
  workspaces: OuterbaseAPIWorkspace[];
  currentWorkspace?: OuterbaseAPIWorkspace;
  loading: boolean;
}>({ workspaces: [], loading: true });

export function useWorkspaces() {
  return useContext(WorkspaceContext);
}

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const { data, isLoading } = useSWR(
    "workspaces",
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

  console.log(data, workspaceId, currentWorkspace);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces: data?.items || [],
        loading: isLoading,
        currentWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
