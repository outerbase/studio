"use client";
import { Input } from "@/components/orbit/input";
import {
  SidebarMenuHeader,
  SidebarMenuItem,
  SidebarMenuLoadingItem,
} from "@/components/sidebar-menu";
import { ChartBar, GlobeSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { PropsWithChildren } from "react";
import SidebarProfile from "./sidebar-profile";

interface NavigationDashboardLayoutProps {
  boards?: {
    name: string;
    id: string;
    href: string;
  }[];
  workspaceName?: string;
  backHref?: string;
  loading?: boolean;
}

export default function NavigationDashboardLayout({
  children,
  backHref,
  boards,
  workspaceName,
  loading,
}: PropsWithChildren<NavigationDashboardLayoutProps>) {
  const router = useRouter();
  const { boardId } = useParams<{ boardId?: string }>();

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

        {!loading && (
          <div className="text-primary mt-2 border-b p-3 py-4">
            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={() => {
                if (backHref) router.push(backHref);
              }}
            >
              <GlobeSimple weight="bold" className="h-5 w-5" />
              <span className="font-semibold">{workspaceName}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col border-b pb-2">
          <SidebarMenuHeader text="Dashboards" />

          {(boards ?? []).map((board) => {
            return (
              <SidebarMenuItem
                key={board.id}
                selected={board.id === boardId}
                text={board.name ?? "Untitled"}
                icon={ChartBar}
                onClick={() => {
                  router.push(board.href);
                }}
              />
            );
          })}

          {loading && (
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
