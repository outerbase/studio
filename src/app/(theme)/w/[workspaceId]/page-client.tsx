"use client";

import ResourceCard from "@/components/resource-card";
import {
  getDatabaseFriendlyName,
  getDatabaseIcon,
} from "@/components/resource-card/utils";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  getOuterbaseDashboardList,
  getOuterbaseWorkspace,
} from "@/outerbase-cloud/api";
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
    <div className="bg-secondary min-h-screen">
      {/* <h1>Board</h1>
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

      <h1>Base</h1> */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {bases.map((base) => (
            <ResourceCard
              className="w-full"
              key={base.id}
              color="default"
              icon={getDatabaseIcon(base.sources[0]?.type)}
              href={`/w/${workspaceId}/${base.short_name}`}
              title={base.name}
              subtitle={getDatabaseFriendlyName(base.sources[0]?.type)}
            >
              <DropdownMenuItem>Remove</DropdownMenuItem>
            </ResourceCard>
          ))}
        </div>
      </div>
    </div>
  );
}
