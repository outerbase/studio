import { MySQLIcon, SQLiteIcon } from "@/components/icons/outerbase-icon";
import { MenuBar } from "@/components/orbit/menu-bar";
import ResourceCard from "@/components/resource-card";
import {
  getDatabaseFriendlyName,
  getDatabaseIcon,
  getDatabaseVisual,
} from "@/components/resource-card/utils";
import { CaretDown } from "@phosphor-icons/react";
import { useMemo } from "react";
import NewResourceButton from "./new-resource-button";
import ResourceCardLoading from "./resource-card-loading";
import { useWorkspaces } from "./workspace-provider";

interface ResourceItem {
  id: string;
  type: string;
  name: string;
  href: string;
  status?: string;
  lastUsed: number;
}

export default function RecentResource() {
  const { workspaces, loading: workspaceLoading } = useWorkspaces();

  const recentBases = useMemo(() => {
    return workspaces
      .map((w) =>
        w.bases.map(
          (base) =>
            ({
              id: base.id,
              type: base.sources[0]?.type ?? "database",
              name: base.name,
              href: `/w/${w.short_name}/${base.short_name}`,
              lastUsed: new Date(
                base.last_analytics_event.created_at
              ).getTime(),
            }) as ResourceItem
        )
      )
      .flat()
      .sort((a, b) => {
        return b.lastUsed - a.lastUsed;
      });
  }, [workspaces]);

  const resources = recentBases;

  return (
    <>
      <div className="bg-background flex h-12 items-center border-b px-4">
        <div className="flex-1 text-base">Recent</div>
        <div>
          <NewResourceButton />
        </div>
      </div>
      <div className="flex flex-1 flex-col content-start gap-4 overflow-x-hidden overflow-y-auto p-4">
        <div className="mb-8 flex gap-4">
          <button className="bg-background dark:bg-secondary flex items-center gap-2 rounded-lg border p-4">
            <SQLiteIcon className="h-10 w-10" />
            <div className="flex flex-col gap-1 text-left">
              <span className="text-base font-bold">SQLite Playgorund</span>
              <span className="text-sm">
                Launch in-memory SQLite on browser
              </span>
            </div>
            <CaretDown className="ml-4 h-4 w-4" />
          </button>

          <button className="bg-background dark:bg-secondary flex items-center gap-2 rounded-lg border p-4">
            <MySQLIcon className="h-10 w-10" />
            <div className="flex flex-col gap-1 text-left">
              <span className="text-base font-bold">MySQL Playgorund</span>
              <span className="text-sm">
                Spin up cloud MySQL sandbox instance
              </span>
            </div>
          </button>
        </div>

        <div>
          <MenuBar
            value={"recent-view"}
            items={[
              { content: "Recent viewed", value: "recent-view" },
              { content: "Recent created", value: "recent-create" },
            ]}
          />
        </div>

        <div className="flex grid grid-cols-1 flex-wrap gap-4 min-[700px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4 min-[1500px]:grid-cols-5 min-[1800px]:grid-cols-6 min-[2100px]:grid-cols-7">
          {workspaceLoading && (
            <>
              <ResourceCardLoading />
              <ResourceCardLoading />
              <ResourceCardLoading />
              <ResourceCardLoading />
            </>
          )}

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
            />
          ))}
        </div>
      </div>
    </>
  );
}
