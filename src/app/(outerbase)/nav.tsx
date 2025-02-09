"use client";
import { OuterbaseIcon } from "@/components/icons/outerbase";
import { Button } from "@/components/orbit/button";
import { getDatabaseIcon } from "@/components/resource-card/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CaretUpDown, Gear, GlobeHemisphereEast } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import NavigationProfile from "./nav-profile";
import { useWorkspaces } from "./workspace-provider";

export function NavigationBar() {
  const { currentWorkspace } = useWorkspaces();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  return (
    <div className="bg-netural-100 dark:bg-background relative sticky top-0 z-50 flex h-14 items-center justify-center gap-2 px-2">
      <div className="text-primary absolute left-0 flex h-14 items-center pl-2">
        <Link href={`/w/${workspaceId}`}>
          <OuterbaseIcon className="h-8 w-8" />
        </Link>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost">
              {currentWorkspace?.name} <CaretUpDown className="ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="h-[400px] w-[500px] p-0" align="start">
            <WorkspaceSelector />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-4 text-sm">
        <Link
          href={`/w/${workspaceId}`}
          className="flex cursor-pointer items-center gap-1"
        >
          <GlobeHemisphereEast weight="fill" className="size-5" /> Home
        </Link>
        <Link
          href={`/w/${workspaceId}/settings`}
          className="flex cursor-pointer items-center gap-1"
        >
          <Gear className="size-5" />
          Settings
        </Link>
        <Link
          href={`/w/${workspaceId}/billing`}
          className="flex cursor-pointer items-center gap-1"
        >
          <Gear className="size-5" />
          Billing
        </Link>
      </div>

      <div className="absolute right-0 flex gap-2 pr-2">
        <div className="bg-secondary text-secondary-foreground flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-semibold">
          Feedback
        </div>

        <NavigationProfile />
      </div>
    </div>
  );
}

function WorkspaceSelector() {
  const router = useRouter();
  const { workspaces, currentWorkspace } = useWorkspaces();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(workspaceId);

  const selectedWorkspace = workspaces.find(
    (w) => w.id === selectedWorkspaceId || w.short_name === selectedWorkspaceId
  );

  const bases = useMemo(() => {
    const currentBases = [...(selectedWorkspace?.bases ?? [])];
    currentBases.sort((a, b) => a.name.localeCompare(b.name));
    return currentBases;
  }, [selectedWorkspace]);

  return (
    <div className="flex h-[400px] w-[500px]">
      <div className="flex h-full w-1/2 flex-col gap-0.5 border-r p-1">
        <label className="text-muted-foreground mt-1 px-2 py-1 text-sm">
          WORKSPACES
        </label>

        <Button
          variant="ghost"
          className="font-normal"
          onClick={() => router.push(`/w/local-workspace`)}
          toggled={!currentWorkspace}
        >
          Local
        </Button>

        {workspaces.map((workspace) => (
          <Button
            key={workspace.id}
            onClick={() => router.push(`/w/${workspace.short_name}`)}
            onMouseEnter={() => setSelectedWorkspaceId(workspace.short_name)}
            variant="ghost"
            toggled={currentWorkspace?.id === workspace.id}
            className="font-normal"
          >
            {workspace.name}
          </Button>
        ))}
      </div>
      <div className="flex h-full w-1/2 flex-col gap-0.5 overflow-y-auto p-1 text-sm">
        <label className="text-muted-foreground mt-1 px-3 py-1 text-sm">
          BASES
        </label>
        {bases.map((base) => {
          const IconComponent = getDatabaseIcon(base.sources[0]?.type);

          return (
            <Button
              key={base.id}
              variant="ghost"
              className="font-normal"
              onClick={() =>
                router.push(`/w/${selectedWorkspaceId}/${base.short_name}`, {})
              }
            >
              <IconComponent className="h-4 w-4" />
              {base.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
