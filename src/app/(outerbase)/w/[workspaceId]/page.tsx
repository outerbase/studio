"use client";

import { Input } from "@/components/orbit/input";
import { MenuBar } from "@/components/orbit/menu-bar";
import { useOuterbaseDashboardList } from "@/outerbase-cloud/hook";
import {
  CalendarDots,
  Eye,
  MagnifyingGlass,
  SortAscending,
  SortDescending,
  Users,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import NavigationHeader from "../../nav-header";
import NavigationLayout from "../../nav-layout";
import NewResourceButton from "../../new-resource-button";
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

  return (
    <>
      <title>{currentWorkspace?.name ?? "Untitled"}</title>
      <NavigationLayout>
        <NavigationHeader title={currentWorkspace?.name ?? "Untitled"} />

        <div className="flex flex-1 flex-col content-start gap-4 overflow-x-hidden overflow-y-auto p-4">
          <div className="flex gap-2">
            <NewResourceButton onCreateBoard={onCreateBoardClicked} />

            <Input
              preText={<MagnifyingGlass className="mr-2" />}
              placeholder="Search"
            />

            <div className="flex-1"></div>

            <MenuBar
              size="lg"
              items={[
                { value: "all", content: <SortAscending size={16} /> },
                { value: "recent", content: <SortDescending size={16} /> },
                { value: "updated", content: <CalendarDots size={16} /> },
                { value: "created", content: <Eye size={16} /> },
                { value: "name", content: <Users size={16} /> },
              ]}
            />
          </div>

          <ResourceItemList
            bases={bases}
            boards={dashboards}
            loading={workspaceLoading}
            onBoardRemove={onDeleteBoardClicked}
            onBaseRemove={onDeleteBaseClicked}
          />
        </div>
      </NavigationLayout>
    </>
  );
}
