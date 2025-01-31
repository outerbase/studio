"use client";

import ResourceCard from "@/components/resource-card";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  getOuterbaseDashboardList,
  getOuterbaseWorkspace,
} from "@/outerbase-cloud/api";
import { Database } from "@phosphor-icons/react";
import Link from "next/link";
import useSWR from "swr";

export default function WorkspaceListPageClient({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const { data, isLoading } = useSWR(`workspace-${workspaceId}`, () => {
    const fetching = async () => {
      const [workspaces, boards] = await Promise.all([
        getOuterbaseWorkspace(),
        getOuterbaseDashboardList(workspaceId),
      ]);

      return {
        bases:
          workspaces.items.find((w) => w.short_name === workspaceId)?.bases ??
          [],
        boards: (boards.items ?? []).filter((b) => b.base_id === null),
      };
    };

    return fetching();
  });

  const boards = data?.boards ?? [];
  const bases = data?.bases ?? [];

  if (isLoading) {
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
          <ResourceCard
            key={base.id}
            icon={() => <Database weight="fill" />}
            href={`/w/${workspaceId}/${base.short_name}`}
            title={base.name}
            subtitle={base.sources[0]?.type}
          >
            <DropdownMenuItem>Remove</DropdownMenuItem>
          </ResourceCard>
        ))}
      </div>
    </div>
  );
}
