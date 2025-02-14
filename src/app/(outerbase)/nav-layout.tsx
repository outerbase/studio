"use client";
import { Input } from "@/components/orbit/input";
import {
  SidebarMenuHeader,
  SidebarMenuItem,
  SidebarMenuLoadingItem,
} from "@/components/sidebar-menu";
import {
  Clock,
  Database,
  MagnifyingGlass,
  Plus,
  Star,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";
import NavigationSigninBanner from "./nav-signin-banner";
import SidebarProfile from "./sidebar-profile";
import { useWorkspaces } from "./workspace-provider";

export default function NavigationLayout({ children }: PropsWithChildren) {
  const { workspaces, loading: workspaceLoading } = useWorkspaces();
  const pathname = usePathname();

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

        <div className="flex flex-col border-b py-2">
          <SidebarMenuItem
            text="Recent"
            icon={Clock}
            selected={pathname === "/"}
          />
          <SidebarMenuItem text="Favorite" icon={Star} />
        </div>

        <div className="flex flex-col border-b pb-2">
          <SidebarMenuHeader text="Workspace" />
          <SidebarMenuItem text="Local Workspace" icon={Database} />

          {workspaces.map((workspace) => {
            return (
              <SidebarMenuItem
                key={workspace.id}
                text={workspace.name}
                icon={Database}
                badge={
                  <span className="mr-2 rounded border px-1.5 py-0.5 text-xs">
                    Free
                  </span>
                }
              />
            );
          })}

          {workspaceLoading && (
            <>
              <SidebarMenuLoadingItem />
              <SidebarMenuLoadingItem />
              <SidebarMenuLoadingItem />
            </>
          )}

          <SidebarMenuItem text={"New Workspace"} icon={Plus} />
        </div>

        <NavigationSigninBanner />
      </div>
      <div className="flex min-h-screen w-full flex-col bg-neutral-50 dark:bg-neutral-950">
        {children}
      </div>
    </div>
  );
}
