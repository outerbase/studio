import { MySQLIcon, SQLiteIcon } from "@/components/icons/outerbase-icon";
import { MenuBar } from "@/components/orbit/menu-bar";
import { CaretDown } from "@phosphor-icons/react";
import { useMemo } from "react";
import NavigationHeader from "./nav-header";
import {
  getResourceItemPropsFromBase,
  ResourceItemList,
} from "./resource-item-helper";
import { useWorkspaces } from "./workspace-provider";

export default function RecentResource() {
  const { workspaces, loading: workspaceLoading } = useWorkspaces();

  const recentBases = useMemo(() => {
    return workspaces
      .map((w) => w.bases.map((base) => getResourceItemPropsFromBase(w, base)))
      .flat()
      .sort((a, b) => {
        return b.lastUsed - a.lastUsed;
      });
  }, [workspaces]);

  const resources = recentBases;

  return (
    <>
      <NavigationHeader title="Recent" />
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

        <ResourceItemList resources={resources} loading={workspaceLoading} />
      </div>
    </>
  );
}
