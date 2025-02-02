"use client";

import { useWorkspaces } from "@/app/(outerbase)/workspace-provider";
import Board from "@/components/board";
import ClientOnly from "@/components/client-only";
import { getOuterbaseDashboard } from "@/outerbase-cloud/api";
import { OuterbaseAPIDashboardDetail } from "@/outerbase-cloud/api-type";
import OuterbaseBoardSourceDriver from "@/outerbase-cloud/database-source";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";

function BoardPageEditor({
  initialValue,
}: {
  initialValue: OuterbaseAPIDashboardDetail;
}) {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { workspaces } = useWorkspaces();

  const boardSources = useMemo(
    () =>
      new OuterbaseBoardSourceDriver(
        workspaces.find(
          (w) => w.id === workspaceId || w.short_name === workspaceId
        )!
      ),
    [workspaces, workspaceId]
  );
  const [value, setValue] = useState(initialValue);

  return (
    <Board
      value={value as any}
      setValue={setValue as any}
      sources={boardSources}
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
