"use client";
import {
  SidebarMenuHeader,
  SidebarMenuItem,
  SidebarMenuLoadingItem,
} from "@/components/sidebar-menu";
import { CaretLeft, ChartBar } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { PropsWithChildren } from "react";

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
      <div className="w-[250px] shrink-0 border-r overflow-hidden flex flex-col">
        <div
          className="flex h-12 cursor-pointer items-center gap-2 border-b px-2 text-base font-bold"
          onClick={() => {
            if (backHref) router.push(backHref);
          }}
        >
          <CaretLeft weight="bold" />
          <span>{workspaceName}</span>
        </div>

        <div className="flex flex-1 flex-col pb-2 overflow-scroll">
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
