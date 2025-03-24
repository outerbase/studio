"use client";

import { ConnectionTemplateDictionary } from "@/components/connection-config-editor/template";
import { useOuterbaseDashboardList } from "@/outerbase-cloud/hook";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import NavigationHeader from "../../nav-header";
import NavigationLayout from "../../nav-layout";
import {
  getResourceItemPropsFromBase,
  getResourceItemPropsFromBoard,
  ResourceItemList,
  ResourceItemProps,
} from "../../resource-item-helper";
import { useWorkspaces } from "../../workspace-provider";
import { deleteBaseDialog } from "./dialog-base-delete";
import { createBoardDialog } from "./dialog-board-create";
import { deleteBoardDialog } from "./dialog-board-delete";

export const runtime = "edge";

export default function WorkspaceListPage() {
  const router = useRouter();
  const {
    currentWorkspace,
    loading: workspaceLoading,
    refreshWorkspace,
  } = useWorkspaces();
  const { data: dashboardList, mutate: refreshDashboardList } =
    useOuterbaseDashboardList();

  const bases = useMemo(() => {
    if (!currentWorkspace) return [];

    const bases =
      (currentWorkspace.bases ?? []).map((base) => {
        return getResourceItemPropsFromBase(currentWorkspace, base);
      }) ?? [];

    return bases;
  }, [currentWorkspace]);

  const dashboards = useMemo(() => {
    if (!currentWorkspace) return [];

    return (
      (dashboardList ?? [])
        .filter(
          (board) =>
            board.workspace_id === currentWorkspace.id && board.base_id === null
        )
        .map((board) => {
          return getResourceItemPropsFromBoard(currentWorkspace, board);
        }) ?? []
    );
  }, [currentWorkspace, dashboardList]);

  const onDeleteBoardClicked = useCallback(
    (deletedResource: ResourceItemProps) => {
      if (!currentWorkspace) return;

      deleteBoardDialog
        .show({
          workspaceId: currentWorkspace.id,
          boardId: deletedResource.id,
          boardName: deletedResource.name,
        })
        .then(() => {
          refreshDashboardList();
        })
        .catch();
    },
    [currentWorkspace, refreshDashboardList]
  );

  const onDeleteBaseClicked = useCallback(
    (deletedResource: ResourceItemProps) => {
      if (!currentWorkspace) return;

      deleteBaseDialog
        .show({
          workspaceId: currentWorkspace.id,
          baseId: deletedResource.id,
          baseName: deletedResource.name,
        })
        .then(() => {
          refreshWorkspace();
        })
        .catch();
    },
    [currentWorkspace, refreshWorkspace]
  );

  const onCreateBoardClicked = useCallback(() => {
    if (!currentWorkspace) return;

    createBoardDialog
      .show({
        workspaceId: currentWorkspace.id,
      })
      .then((createdBoard) => {
        if (!createdBoard) return;

        refreshDashboardList();
        router.push(
          `/w/${currentWorkspace.short_name}/board/${createdBoard.id}`
        );
      });
  }, [currentWorkspace, router, refreshDashboardList]);

  const onBaseEditClicked = useCallback(
    (editResource: ResourceItemProps) => {
      if (!currentWorkspace) return;
      if (ConnectionTemplateDictionary[editResource.type ?? ""] === undefined) {
        toast("Editing this type of resource is not supported at the moment.");
        return;
      }

      router.push(
        `/w/${currentWorkspace.short_name}/edit-base/${editResource.id}`
      );
    },
    [currentWorkspace, router]
  );

  return (
    <>
      <title>{currentWorkspace?.name ?? "Untitled"}</title>
      <NavigationLayout>
        <NavigationHeader />

        <div className="flex flex-1 flex-col content-start gap-4 overflow-x-hidden overflow-y-auto p-4">
          <ResourceItemList
            bases={bases}
            boards={dashboards}
            loading={workspaceLoading}
            onBoardRemove={onDeleteBoardClicked}
            onBaseRemove={onDeleteBaseClicked}
            onBoardCreate={onCreateBoardClicked}
            onBaseEdit={onBaseEditClicked}
            workspaceId={currentWorkspace?.short_name}
          />
        </div>
      </NavigationLayout>
    </>
  );
}
