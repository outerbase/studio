"use client";

import {
  SavedConnectionItem,
  SavedConnectionLocalStorage,
} from "@/app/(theme)/connect/saved-connection-storage";
import { MySQLIcon, SQLiteIcon } from "@/components/icons/outerbase-icon";
import { CaretDown } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import NavigationHeader from "../nav-header";
import NavigationLayout from "../nav-layout";
import NewResourceButton from "../new-resource-button";
import { ResourceItemList, ResourceItemProps } from "../resource-item-helper";
import { createLocalBoardDialog } from "./dialog-board-create";
import { useLocalDashboardList } from "./hooks";

export default function LocalConnectionPage() {
  const [baseResources, setBaseResources] = useState<ResourceItemProps[]>([]);

  useEffect(() => {
    setBaseResources(
      SavedConnectionLocalStorage.getList().map((conn: SavedConnectionItem) => {
        return {
          href: `/client/s/${conn.driver}?p=${conn.id}`,
          name: conn.name,
          lastUsed: 0,
          id: conn.id,
          type: conn.driver,
          status: "",
        } as ResourceItemProps;
      })
    );
  }, []);

  // Getting the board from indexdb
  const { data: dashboardList, mutate: refreshDashboard } =
    useLocalDashboardList();
  const dashboardResources = useMemo(() => {
    return (
      (dashboardList ?? []).map((board) => {
        return {
          href: `/local/board/${board.id}`,
          name: board.content.name,
          lastUsed: board.content.updated_at,
          id: board.id,
          type: "board",
        } as ResourceItemProps;
      }) ?? []
    );
  }, [dashboardList]);

  const onCreateBoardClicked = useCallback(() => {
    createLocalBoardDialog.show({}).then(() => {
      refreshDashboard(undefined, { revalidate: true });
    });
  }, [refreshDashboard]);

  return (
    <NavigationLayout>
      <NavigationHeader title={"Local Worksapce"} />
      <div className="flex flex-1 flex-col content-start gap-4 overflow-x-hidden overflow-y-auto p-4">
        <div className="flex gap-2">
          <NewResourceButton onCreateBoard={onCreateBoardClicked} />
        </div>

        <div className="my-4 flex gap-4">
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

        <ResourceItemList boards={dashboardResources} bases={baseResources} />
      </div>
    </NavigationLayout>
  );
}
