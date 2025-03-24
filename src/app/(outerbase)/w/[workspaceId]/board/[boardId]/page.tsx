"use client";

import NavigationDashboardLayout from "@/app/(outerbase)/nav-board-layout";
import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import Board, { DashboardProps } from "@/components/board";
import { Loader } from "@/components/orbit/loader";
import { WEBSITE_NAME } from "@/const";
import OuterbaseBoardStorageDriver from "@/drivers/board-storage/outerbase";

import { getOuterbaseDashboard } from "@/outerbase-cloud/api";
import { OuterbaseAPIDashboardDetail } from "@/outerbase-cloud/api-type";
import OuterbaseBoardSourceDriver from "@/outerbase-cloud/database-source";
import { useOuterbaseDashboardList } from "@/outerbase-cloud/hook";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR, { KeyedMutator } from "swr";

export const runtime = "edge";

function BoardPageEditor({
  initialValue,
}: {
  initialValue: OuterbaseAPIDashboardDetail;
  mutate: KeyedMutator<OuterbaseAPIDashboardDetail>;
}) {
  const { boardId } = useParams<{
    workspaceId: string;
    boardId: string;
  }>();
  const { currentWorkspace } = useWorkspaces();
  const [interval, setIntervals] = useState<number>(0);

  const boardSources = useMemo(() => {
    if (!currentWorkspace) return;
    return new OuterbaseBoardSourceDriver(currentWorkspace);
  }, [currentWorkspace]);

  const storageDriver = useMemo(() => {
    if (!currentWorkspace) return;
    return new OuterbaseBoardStorageDriver(
      currentWorkspace.short_name,
      boardId
    );
  }, [boardId, currentWorkspace]);

  const [value, setValue] = useState<DashboardProps>(initialValue);
  const [filter, setFilter] = useState({});

  if (!boardSources) {
    return <div>Loading Workspace....</div>;
  }

  return (
    <Board
      value={value}
      onChange={setValue}
      filterValue={filter}
      onFilterValueChange={setFilter}
      sources={boardSources}
      storage={storageDriver}
      interval={interval}
      onChangeInterval={setIntervals}
    />
  );
}

export default function BoardPage() {
  const { workspaceId, boardId } = useParams<{
    boardId: string;
    workspaceId: string;
  }>();
  const { data, mutate } = useSWR(`board-${boardId}`, () => {
    return getOuterbaseDashboard(workspaceId, boardId);
  });

  const { currentWorkspace, loading: workspaceLoading } = useWorkspaces();
  const { data: dashboardList, isLoading: dashboardLoading } =
    useOuterbaseDashboardList();

  const dashboards = useMemo(() => {
    if (!currentWorkspace) return [];
    if (!dashboardList) return [];

    const tmp = (dashboardList ?? []).filter(
      (board) =>
        board.workspace_id === currentWorkspace.id && board.base_id === null
    );

    tmp.sort((a, b) => a.name.localeCompare(b.name));
    return tmp.map((board) => {
      return {
        id: board.id,
        name: board.name,
        href: `/w/${currentWorkspace.short_name}/board/${board.id}`,
      };
    });
  }, [dashboardList, currentWorkspace]);

  return (
    <NavigationDashboardLayout
      loading={workspaceLoading || dashboardLoading}
      boards={dashboards}
      workspaceName={currentWorkspace?.name}
      backHref={`/w/${workspaceId}`}
    >
      <title>{data?.name ?? WEBSITE_NAME}</title>
      <div className="relative overflow-x-hidden overflow-y-auto">
        {data ? (
          <BoardPageEditor initialValue={data} mutate={mutate} />
        ) : (
          <Loader />
        )}
      </div>
    </NavigationDashboardLayout>
  );
}
