"use client";
import { getOuterbaseWorkspace } from "@/outerbase-cloud/api";
import { OuterbaseAPIWorkspace } from "@/outerbase-cloud/api-type";
import { produce } from "immer";
import { noop } from "lodash";
import { useParams } from "next/navigation";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from "react";
import useSWR from "swr";
import { useSession } from "./session-provider";

const WorkspaceContext = createContext<{
  workspaces: OuterbaseAPIWorkspace[];
  currentWorkspace?: OuterbaseAPIWorkspace;
  refreshWorkspace: () => Promise<void>;

  /**
   * Updates the specified workspace in the cache directly,
   * instead of refreshing all workspaces from the server.
   * This is useful when the modify API returns the updated workspace object,
   * allowing us to save time by updating the cache directly.
   *
   * @param workspace - The workspace object to update in the cache.
   */
  refreshPartial: (workspace: OuterbaseAPIWorkspace) => void;
  loading: boolean;
}>({
  workspaces: [],
  loading: true,
  refreshWorkspace: async () => {},
  refreshPartial: noop,
});

export function useWorkspaces() {
  return useContext(WorkspaceContext);
}

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const { token } = useSession();

  const { data, isLoading, mutate } = useSWR(
    // The workspace cache depends on the token.
    // Including the token in the key ensures the cache is user-specific.
    // Without this, the cache might be shared between different users,
    // causing a brief period where the workspace data is incorrect
    // when a user logs out and another logs in.
    token ? `/workspaces?=${token}` : undefined,
    () => {
      return getOuterbaseWorkspace();
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      errorRetryCount: 0,
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

  const refreshPartial = useCallback(
    (modifiedWorkspace: OuterbaseAPIWorkspace) => {
      if (!data) return;

      const newData = produce(data, (draft) => {
        for (let i = 0; i < draft.items.length; i++) {
          if (draft.items[i].id === modifiedWorkspace.id) {
            draft.items[i] = modifiedWorkspace;
            return;
          }
        }

        draft.items.push(modifiedWorkspace);
      });

      mutate(newData, {
        revalidate: false,
        optimisticData: newData,
      });
    },
    [mutate, data]
  );

  const refreshWorkspace = useCallback(async () => {
    const newWorkspceList = await getOuterbaseWorkspace();
    mutate(newWorkspceList, {
      revalidate: true,
      optimisticData: newWorkspceList,
    });
  }, [mutate]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces: data?.items || [],
        loading: isLoading,
        currentWorkspace,
        refreshWorkspace,
        refreshPartial,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
