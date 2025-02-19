import ResourceCard from "@/components/resource-card";
import {
  getDatabaseFriendlyName,
  getDatabaseIcon,
  getDatabaseVisual,
} from "@/components/resource-card/utils";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { timeSince } from "@/lib/utils-datetime";
import {
  OuterbaseAPIBase,
  OuterbaseAPIDashboard,
  OuterbaseAPIWorkspace,
} from "@/outerbase-cloud/api-type";
import { Pencil, Trash } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
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
    lastUsed: base.last_analytics_event?.created_at
      ? new Date(base.last_analytics_event?.created_at).getTime()
      : 0,
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
  bases,
  boards,
  loading,
  onBoardRemove,
  onBaseRemove,
  onBaseEdit,
}: {
  bases: ResourceItemProps[];
  boards: ResourceItemProps[];
  loading?: boolean;
  onBoardRemove?: (item: ResourceItemProps) => void;
  onBaseRemove?: (item: ResourceItemProps) => void;
  onBaseEdit?: (item: ResourceItemProps) => void;
}) {
  return (
    <>
      {boards.length > 0 && (
        <>
          <h2 className="text-base font-bold">Boards</h2>
          <div className="flex grid grid-cols-1 flex-wrap gap-4 min-[700px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4 min-[1500px]:grid-cols-5 min-[1800px]:grid-cols-6 min-[2100px]:grid-cols-7">
            <AnimatePresence initial={false}>
              {boards.map((resource: ResourceItemProps) => {
                const status = `Last updated ${timeSince(resource.lastUsed)} ago`;

                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResourceCard
                      className="w-full"
                      color="default"
                      key={resource.id}
                      icon={getDatabaseIcon(resource.type)}
                      href={resource.href}
                      title={resource.name}
                      subtitle={getDatabaseFriendlyName(resource.type)}
                      visual={getDatabaseVisual(resource.type)}
                      status={status}
                    >
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => {
                          if (onBoardRemove) onBoardRemove(resource);
                        }}
                      >
                        <Trash size={16} className="mr-2" />
                        Remove board
                      </DropdownMenuItem>
                    </ResourceCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      )}

      {boards.length > 0 && <h2 className="text-base font-bold">Bases</h2>}

      <div className="flex grid grid-cols-1 flex-wrap gap-4 min-[700px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4 min-[1500px]:grid-cols-5 min-[1800px]:grid-cols-6 min-[2100px]:grid-cols-7">
        {loading && (
          <>
            <ResourceCardLoading />
            <ResourceCardLoading />
            <ResourceCardLoading />
            <ResourceCardLoading />
          </>
        )}

        {bases.length > 0 && (
          <AnimatePresence initial={false}>
            {bases.map((resource: ResourceItemProps) => {
              const status = `Last updated ${timeSince(resource.lastUsed)} ago`;

              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResourceCard
                    key={resource.id}
                    className="w-full"
                    color="default"
                    icon={getDatabaseIcon(resource.type)}
                    href={resource.href}
                    title={resource.name}
                    subtitle={getDatabaseFriendlyName(resource.type)}
                    visual={getDatabaseVisual(resource.type)}
                    status={status}
                  >
                    <DropdownMenuItem
                      onClick={() => {
                        if (onBaseEdit) onBaseEdit(resource);
                      }}
                    >
                      <Pencil size={16} className="mr-2" />
                      Edit base
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500"
                      onClick={() => {
                        if (onBaseRemove) onBaseRemove(resource);
                      }}
                    >
                      <Trash size={16} className="mr-2" />
                      Remove base
                    </DropdownMenuItem>
                  </ResourceCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </>
  );
}
