"use client";

import { NavigationBar } from "@/app/(outerbase)/nav";
import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import Board from "@/components/board";
import {
  getOuterbaseDashboard,
  updateOuterbaseDashboard,
} from "@/outerbase-cloud/api";
import { OuterbaseAPIDashboardDetail } from "@/outerbase-cloud/api-type";
import OuterbaseBoardSourceDriver from "@/outerbase-cloud/database-source";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import useSWR, { KeyedMutator } from "swr";

function BoardPageEditor({
  initialValue,
  mutate,
}: {
  initialValue: OuterbaseAPIDashboardDetail;
  mutate: KeyedMutator<OuterbaseAPIDashboardDetail>;
}) {
  const { workspaceId, boardId } = useParams<{
    workspaceId: string;
    boardId: string;
  }>();
  const { workspaces } = useWorkspaces();
  const [interval, setIntervals] = useState<number>(0);

  const boardSources = useMemo(() => {
    if (workspaces.length === 0) return;
    return new OuterbaseBoardSourceDriver(
      workspaces.find(
        (w) => w.id === workspaceId || w.short_name === workspaceId
      )!
    );
  }, [workspaceId, workspaces]);

  const [value, setValue] = useState(initialValue);

  const onSave = useCallback(() => {
    const input = {
      base_id: null,
      chart_ids: value.chart_ids,
      data: (value as any).data,
      layout: value.layout.map(({ w, h, i, x, y }) => ({ w, h, x, y, i })),
      directory_index: (value as any).directory_index,
      name: value.name,
      type: value.type,
    };
    updateOuterbaseDashboard(workspaceId, boardId, input)
      .then()
      .finally(mutate);
  }, [boardId, value, workspaceId, mutate]);

  if (!boardSources) {
    return <div>Loading Workspace....</div>;
  }

  return (
    <Board
      value={value as any}
      onChange={setValue as any}
      sources={boardSources}
      interval={interval}
      onChangeInterval={setIntervals}
      onLayoutCancel={() => setValue(initialValue)}
      onLayoutSave={onSave}
      onRemove={() => {}}
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

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <NavigationBar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <BoardPageEditor initialValue={data} mutate={mutate} />
      </div>
    </div>
  );
}
