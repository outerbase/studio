"use client";

import { Button } from "@/components/orbit/button";
import { Input } from "@/components/orbit/input";
import { MenuBar } from "@/components/orbit/menu-bar";
import ResourceCard from "@/components/resource-card";
import {
  getDatabaseFriendlyName,
  getDatabaseIcon,
  getDatabaseVisual,
} from "@/components/resource-card/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { timeSince } from "@/lib/utils-datetime";
import { getOuterbaseDashboardList } from "@/outerbase-cloud/api";
import {
  CalendarDots,
  CaretDown,
  Eye,
  MagnifyingGlass,
  SortAscending,
  SortDescending,
  Users,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { NavigationBar } from "../../nav";
import { useWorkspaces } from "../../workspace-provider";
import { deleteBaseDialog } from "./dialog-base-delete";
import { createBoardDialog } from "./dialog-board-create";
import { deleteBoardDialog } from "./dialog-board-delete";
import useRedirectValidWorkspace from "./redirect-valid-workspace";

interface ResourceItem {
  id: string;
  type: string;
  name: string;
  href: string;
  status?: string;
}

export default function WorkspaceListPageClient() {
  const router = useRouter();
  const { currentWorkspace, refreshWorkspace } = useWorkspaces();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const [filterType, setFilterType] = useState("all");
  const [filterName, setFilterName] = useState("");

  useRedirectValidWorkspace();

  const { data: boards, mutate } = useSWR(
    `/workspace/${workspaceId}/boards`,
    () => {
      return getOuterbaseDashboardList(workspaceId);
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const resources: ResourceItem[] = useMemo(() => {
    const baseResources = (currentWorkspace?.bases ?? []).map((base) => ({
      id: base.id,
      type: base.sources[0]?.type ?? "database",
      name: base.name,
      href: `/w/${currentWorkspace?.short_name}/${base.short_name}`,
      status: base.last_analytics_event?.created_at
        ? `Last viewed ${timeSince(new Date(base.last_analytics_event?.created_at))} ago`
        : undefined,
    }));

    const boardResources = (boards?.items ?? [])
      .filter((board) => board.base_id === null)
      .map((board) => ({
        id: board.id,
        type: "board",
        name: board.name,
        href: `/w/${currentWorkspace?.short_name}/board/${board.id}`,
        status: `Last updated ${timeSince(new Date(board?.updated_at ?? ""))} ago`,
      }));

    let allResources = [...baseResources, ...boardResources];

    // Apply filters
    if (filterName) {
      allResources = allResources.filter((resource) =>
        resource.name?.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    if (filterType === "base") {
      allResources = allResources.filter(
        (resource) => resource.type !== "board"
      );
    } else if (filterType === "board") {
      allResources = allResources.filter(
        (resource) => resource.type === "board"
      );
    }

    return allResources.sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? "")
    );
  }, [currentWorkspace, boards, filterName, filterType]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <NavigationBar />

      <div className="container mx-auto mt-10 p-4">
        <div className="sticky top-14 z-20 mb-12 flex gap-4 bg-neutral-50 pb-2 dark:bg-neutral-950">
          <div className="flex-1">
            <Input
              preText={<MagnifyingGlass size={16} className="mr-2" />}
              size="lg"
              placeholder="Search resources..."
              onValueChange={setFilterName}
              value={filterName}
            />
          </div>

          <MenuBar
            size="lg"
            items={[
              { value: "all", content: "All" },
              { value: "base", content: "Bases" },
              { value: "board", content: "Boards" },
            ]}
            onChange={setFilterType}
            value={filterType}
          />

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" variant="primary">
                New Resource <CaretDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>New Base</DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  const createdBoard = await createBoardDialog.show({
                    workspaceId,
                  });

                  if (createdBoard) {
                    mutate();
                    router.push(`/w/${workspaceId}/board/${createdBoard.id}`);
                  }
                }}
              >
                New Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {resources.map((resource) => (
            <ResourceCard
              className="w-full"
              key={resource.id}
              color="default"
              icon={getDatabaseIcon(resource.type)}
              href={resource.href}
              title={resource.name}
              subtitle={getDatabaseFriendlyName(resource.type)}
              visual={getDatabaseVisual(resource.type)}
              status={resource.status}
            >
              {resource.type === "board" && (
                <DropdownMenuItem
                  onClick={() => {
                    deleteBoardDialog
                      .show({
                        workspaceId,
                        boardId: resource.id,
                        boardName: resource.name,
                      })
                      .then(() => mutate());
                  }}
                >
                  Remove board
                </DropdownMenuItem>
              )}
              {resource.type !== "board" && (
                <DropdownMenuItem
                  onClick={() => {
                    deleteBaseDialog
                      .show({
                        workspaceId,
                        baseId: resource.id,
                        baseName: resource.name,
                      })
                      .then(() => refreshWorkspace());
                  }}
                >
                  Remove
                </DropdownMenuItem>
              )}
            </ResourceCard>
          ))}
        </div>
      </div>
    </div>
  );
}
