"use client";
import { getOuterbaseWorkspace } from "@/outerbase-cloud/api";
import { OuterbaseAPIWorkspace } from "@/outerbase-cloud/api-type";
import { createContext, PropsWithChildren, useContext } from "react";
import useSWR from "swr";

const WorkspaceContext = createContext<{
  workspaces: OuterbaseAPIWorkspace[];
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

  return (
    <WorkspaceContext.Provider
      value={{ workspaces: data?.items || [], loading: isLoading }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
