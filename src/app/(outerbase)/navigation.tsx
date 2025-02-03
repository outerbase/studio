import { getDatabaseIcon } from "@/components/resource-card/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useWorkspaces } from "./workspace-provider";

function WorkspaceSelector() {
  const router = useRouter();
  const { workspaces } = useWorkspaces();
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
        <label className="text-muted-foreground mt-1 px-3 py-1 text-xs font-bold">
          WORKSPACES
        </label>
        {workspaces.map((workspace) => (
          <div
            onClick={() => router.push(`/w/${workspace.short_name}`)}
            key={workspace.id}
            onMouseEnter={() => setSelectedWorkspaceId(workspace.short_name)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "cursor-pointer justify-start py-0.5"
            )}
          >
            {workspace.name}
          </div>
        ))}
      </div>
      <div className="flex h-full w-1/2 flex-col gap-0.5 overflow-y-auto p-1 text-sm">
        <label className="text-muted-foreground mt-1 px-3 py-1 text-xs font-bold">
          BASES
        </label>
        {bases.map((base) => {
          const IconComponent = getDatabaseIcon(base.sources[0]?.type);

          return (
            <div
              onClick={() =>
                router.push(`/w/${selectedWorkspaceId}/${base.short_name}`, {})
              }
              key={base.id}
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                "cursor-pointer justify-start p-2"
              )}
            >
              <IconComponent className="mr-2 h-4 w-4" />
              {base.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function NavigationBar() {
  return (
    <div className="p-1">
      <Popover open>
        <PopoverTrigger asChild>
          <Button>Workspace</Button>
        </PopoverTrigger>
        <PopoverContent className="h-[400px] w-[500px] p-0">
          <WorkspaceSelector />
        </PopoverContent>
      </Popover>
    </div>
  );
}
