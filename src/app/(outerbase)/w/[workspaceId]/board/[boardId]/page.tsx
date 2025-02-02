"use client";

import Board from "@/components/board";
import ClientOnly from "@/components/client-only";
import { getOuterbaseDashboard } from "@/outerbase-cloud/api";
import { OuterbaseAPIDashboardDetail } from "@/outerbase-cloud/api-type";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

function BoardPageEditor({
  initialValue,
}: {
  initialValue: OuterbaseAPIDashboardDetail;
}) {
  console.log(initialValue);
  const [value, setValue] = useState(initialValue);

  return <Board value={value as any} setValue={setValue as any} />;
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
    <div className="h-screen w-screen overflow-hidden">
      <ClientOnly>
        <BoardPageEditor initialValue={data} />
      </ClientOnly>
    </div>
  );
}
