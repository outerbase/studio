"use client";

import { ButtonGroup, ButtonGroupItem } from "@/components/button-group";
import { Toolbar } from "@/components/gui/toolbar";
import ResourceCard from "@/components/resource-card";
import {
  getDatabaseFriendlyName,
  getDatabaseIcon,
  getDatabaseVisual,
} from "@/components/resource-card/utils";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  CalendarDots,
  SortAscending,
  SortDescending,
} from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { NavigationBar } from "../../navigation";
import { useWorkspaces } from "../../workspace-provider";

export default function WorkspaceListPageClient() {
  const { workspaces } = useWorkspaces();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  // const boards = data?.boards ?? [];
  const bases =
    workspaces.find(
      (workspace) =>
        workspace.short_name === workspaceId || workspace.id === workspaceId
    )?.bases ?? [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
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
          </Toolbar>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {bases.map((base) => (
            <ResourceCard
              className="w-full"
              key={base.id}
              color="default"
              icon={getDatabaseIcon(base.sources[0]?.type)}
              href={`/w/${workspaceId}/${base.short_name}`}
              title={base.name}
              subtitle={getDatabaseFriendlyName(base.sources[0]?.type)}
              visual={getDatabaseVisual(base.sources[0]?.type)}
            >
              <DropdownMenuItem>Remove</DropdownMenuItem>
            </ResourceCard>
          ))}
        </div>
      </div>
    </div>
  );
}
