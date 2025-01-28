"use client";

import {
  getOuterbaseDashboardList,
  getOuterbaseWorkspace,
} from "@/outerbase-cloud/api";
import {
  OuterbaseAPIBase,
  OuterbaseAPIDashboard,
} from "@/outerbase-cloud/api-type";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WorkspaceListPageClient({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [bases, setBases] = useState<OuterbaseAPIBase[]>([]);
  const [boards, setBoards] = useState<OuterbaseAPIDashboard[]>([]);

  useEffect(() => {
    Promise.all([
      getOuterbaseWorkspace(),
      getOuterbaseDashboardList(workspaceId),
    ])
      .then(([workspace, boards]) => {
        setBases(
          workspace.items.find((w) => w.short_name === workspaceId)?.bases ?? []
        );
        setBoards((boards.items ?? []).filter((b) => b.base_id === null));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [workspaceId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Board</h1>
      <div className="flex flex-wrap gap-4 p-4">
        {boards.map((board) => (
          <Link
            key={board.id}
            className="border p-4"
            href={`/w/${workspaceId}/board/${board.id}`}
          >
            {board.name}
          </Link>
        ))}
      </div>

      <h1>Base</h1>
      <div className="flex flex-wrap gap-4 p-4">
        {bases.map((base) => (
          <Link
            key={base.id}
            className="border p-4"
            href={`/w/${workspaceId}/${base.short_name}`}
          >
            {base.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
