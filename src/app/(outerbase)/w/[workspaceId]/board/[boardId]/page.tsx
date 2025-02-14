"use client";

import NavigationLayout from "@/app/(outerbase)/nav-layout";
import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import Board from "@/components/board";
import { Loader } from "@/components/orbit/loader";
import OuterbaseBoardStorageDriver from "@/drivers/board-storage/outerbase";

import { getOuterbaseDashboard } from "@/outerbase-cloud/api";
import { OuterbaseAPIDashboardDetail } from "@/outerbase-cloud/api-type";
import OuterbaseBoardSourceDriver from "@/outerbase-cloud/database-source";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR, { KeyedMutator } from "swr";

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

  const [value, setValue] = useState(initialValue);
  const [filter, setFilter] = useState({});

  if (!boardSources) {
    return <div>Loading Workspace....</div>;
  }

  console.log("xxx", filter);

  return (
    <Board
      value={value as any}
      onChange={setValue as any}
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

  return (
    <NavigationLayout>
      <div className="flex flex-1 overflow-x-hidden overflow-y-auto">
        {data ? (
          <BoardPageEditor initialValue={data} mutate={mutate} />
        ) : (
          <Loader />
        )}
      </div>
    </NavigationLayout>
  );
}
