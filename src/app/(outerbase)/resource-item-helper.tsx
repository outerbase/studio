import ResourceCard from "@/components/resource-card";
import {
  getDatabaseFriendlyName,
  getDatabaseIcon,
  getDatabaseVisual,
} from "@/components/resource-card/utils";
import { timeSince } from "@/lib/utils-datetime";
import {
  OuterbaseAPIBase,
  OuterbaseAPIDashboard,
  OuterbaseAPIWorkspace,
} from "@/outerbase-cloud/api-type";
import ResourceCardLoading from "./resource-card-loading";

export interface ResourceItemProps {
  id: string;
  type: string;
  name: string;
  href: string;
  status?: string;
  lastUsed: number;
}

export function getResourceItemPropsFromBase(
  workspace: OuterbaseAPIWorkspace,
  base: OuterbaseAPIBase
): ResourceItemProps {
  return {
    id: base.id,
    type: base.sources[0]?.type ?? "database",
    name: base.name,
    href: `/w/${workspace.short_name}/${base.short_name}`,
    lastUsed: new Date(base.last_analytics_event.created_at).getTime(),
  };
}

export function getResourceItemPropsFromBoard(
  workspace: OuterbaseAPIWorkspace,
  board: OuterbaseAPIDashboard
): ResourceItemProps {
  return {
    id: board.id,
    type: "board",
    name: board.name,
    href: `/w/${workspace?.short_name}/board/${board.id}`,
    lastUsed: new Date(board.updated_at).getTime(),
  };
}

export function ResourceItemList({
  resources,
  loading,
}: {
  resources: ResourceItemProps[];
  loading?: boolean;
}) {
  return (
    <div className="flex grid grid-cols-1 flex-wrap gap-4 min-[700px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4 min-[1500px]:grid-cols-5 min-[1800px]:grid-cols-6 min-[2100px]:grid-cols-7">
      {loading && (
        <>
          <ResourceCardLoading />
          <ResourceCardLoading />
          <ResourceCardLoading />
          <ResourceCardLoading />
        </>
      )}

      {resources.map((resource) => {
        const status = `Last updated ${timeSince(resource.lastUsed)} ago`;

        return (
          <ResourceCard
            className="w-full"
            key={resource.id}
            color="default"
            icon={getDatabaseIcon(resource.type)}
            href={resource.href}
            title={resource.name}
            subtitle={getDatabaseFriendlyName(resource.type)}
            visual={getDatabaseVisual(resource.type)}
            status={status}
          />
        );
      })}
    </div>
  );
}
