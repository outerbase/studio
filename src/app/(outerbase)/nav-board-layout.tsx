"use client";
import { Input } from "@/components/orbit/input";
import {
  SidebarMenuHeader,
  SidebarMenuItem,
  SidebarMenuLoadingItem,
} from "@/components/sidebar-menu";
import { useOuterbaseDashboardList } from "@/outerbase-cloud/hook";
import { ChartBar, GlobeSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useMemo } from "react";
import SidebarProfile from "./sidebar-profile";
import { useWorkspaces } from "./workspace-provider";

export default function NavigationDashboardLayout({
  children,
}: PropsWithChildren) {
  const router = useRouter();
  const { currentWorkspace, loading: workspaceLoading } = useWorkspaces();
  const pathname = usePathname();

  const { data: dashboardList, isLoading: dashboardLoading } =
    useOuterbaseDashboardList();

  const { boardId } = useParams<{ boardId?: string }>();

  const dashboards = useMemo(() => {
    if (!currentWorkspace) return [];
    if (!dashboardList) return [];

    const tmp = (dashboardList ?? []).filter(
      (board) =>
        board.workspace_id === currentWorkspace.id && board.base_id === null
    );

    tmp.sort((a, b) => a.name.localeCompare(b.name));
    return tmp;
  }, [dashboardList, currentWorkspace]);

  return (
    <div className="flex h-screen w-screen">
      <div className="w-[250px] shrink-0 border-r">
        <div className="px-2 py-2">
          <SidebarProfile />
        </div>

        <div className="px-2">
          <Input
            size="base"
            className="bg-secondary"
            placeholder="Search for anything"
            preText={<MagnifyingGlass className="mr-2" />}
          />
        </div>

        {currentWorkspace && (
          <div className="text-primary mt-2 border-b p-3 py-4">
            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={() => router.push(`/w/${currentWorkspace.short_name}`)}
            >
              <GlobeSimple weight="bold" className="h-5 w-5" />
              <span className="font-semibold">{currentWorkspace.name}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col border-b pb-2">
          <SidebarMenuHeader text="Dashboards" />

          {dashboards.map((board) => {
            return (
              <SidebarMenuItem
                key={board.id}
                selected={board.id === boardId}
                text={board.name ?? "Untitled"}
                icon={ChartBar}
                onClick={() => {
                  router.push(
                    `/w/${currentWorkspace?.short_name}/board/${board.id}`
                  );
                }}
              />
            );
          })}

          {(workspaceLoading || dashboardLoading) && (
            <>
              <SidebarMenuLoadingItem />
              <SidebarMenuLoadingItem />
              <SidebarMenuLoadingItem />
            </>
          )}
        </div>
      </div>
      <div className="flex min-h-screen w-full flex-col overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
        {children}
      </div>
    </div>
  );
}
