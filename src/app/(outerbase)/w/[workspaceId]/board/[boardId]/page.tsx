"use client";

import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import Board from "@/components/board";
import ClientOnly from "@/components/client-only";
import {
  getOuterbaseDashboard,
  updateOuterbaseDashboard,
} from "@/outerbase-cloud/api";
import { OuterbaseAPIDashboardDetail } from "@/outerbase-cloud/api-type";
import OuterbaseBoardSourceDriver from "@/outerbase-cloud/database-source";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";

function BoardPageEditor({
  initialValue,
}: {
  initialValue: OuterbaseAPIDashboardDetail;
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
    updateOuterbaseDashboard(workspaceId, boardId, input);
  }, [boardId, value, workspaceId]);

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
      onCancel={() => setValue(initialValue)}
      onSave={onSave}
    />
  );
}

export default function BoardPage() {
  const { workspaceId, boardId } = useParams<{
    boardId: string;
    workspaceId: string;
  }>();
  const { data } = useSWR(`board-${boardId}`, () => {
    return getOuterbaseDashboard(workspaceId, boardId);
  });

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-y-autp h-screen w-screen overflow-x-hidden">
      <ClientOnly>
        <BoardPageEditor initialValue={data} />
      </ClientOnly>
    </div>
  );
}
