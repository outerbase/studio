"use client";

import { ButtonGroup, ButtonGroupItem } from "@/components/button-group";
import { Toolbar, ToolbarFiller } from "@/components/gui/toolbar";
import ResourceCard from "@/components/resource-card";
import {
  getDatabaseFriendlyName,
  getDatabaseIcon,
  getDatabaseVisual,
} from "@/components/resource-card/utils";
import { Button } from "@/components/ui/button";
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
  SortAscending,
  SortDescending,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import useSWR from "swr";
import { NavigationBar } from "../../navigation";
import { useWorkspaces } from "../../workspace-provider";
import { createBoardDialog } from "./create-board-dialog";

interface ResourceItem {
  id: string;
  type: string;
  name: string;
  href: string;
  status?: string;
}

export default function WorkspaceListPageClient() {
  const router = useRouter();
  const { currentWorkspace } = useWorkspaces();
  const { workspaceId } = useParams<{ workspaceId: string }>();

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

    const allResources = [...baseResources, ...boardResources];

    return allResources.sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? "")
    );
  }, [currentWorkspace, boards]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <NavigationBar />

      <div className="container mx-auto p-4">
        <div className="mb-8">
          <Toolbar>
            <ButtonGroup>
              <ButtonGroupItem>All</ButtonGroupItem>
              <ButtonGroupItem>Bases</ButtonGroupItem>
              <ButtonGroupItem>Boards</ButtonGroupItem>
            </ButtonGroup>
            <ButtonGroup>
              <ButtonGroupItem>
                <SortAscending size={16} />
              </ButtonGroupItem>
              <ButtonGroupItem>
                <SortDescending size={16} />
              </ButtonGroupItem>
              <ButtonGroupItem>
                <CalendarDots size={16} />
              </ButtonGroupItem>
              <ButtonGroupItem>
                <CalendarDots size={16} />
              </ButtonGroupItem>
              <ButtonGroupItem>
                <CalendarDots size={16} />
              </ButtonGroupItem>
            </ButtonGroup>

            <ToolbarFiller />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button>New Resource</Button>
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
          </Toolbar>
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
              <DropdownMenuItem>Remove</DropdownMenuItem>
            </ResourceCard>
          ))}
        </div>
      </div>
    </div>
  );
}
