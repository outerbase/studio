"use client";

import Banner from "@/components/orbit/banner";
import RippleFilter from "@/components/orbit/banner/ripple-filter";
import { Button } from "@/components/orbit/button";
import { Input } from "@/components/orbit/input";
import { SidebarMenuHeader, SidebarMenuItem } from "@/components/sidebar-menu";
import { Clock, Database, MagnifyingGlass, Plus } from "@phosphor-icons/react";
import RecentResource from "./recent-page";
import { useSession } from "./session-provider";
import SidebarProfile from "./sidebar-profile";
import { useWorkspaces } from "./workspace-provider";

export default function OuterbaseMainPage() {
  const { token, isLoading, session } = useSession();
  const { workspaces } = useWorkspaces();

  return (
    <div className="flex h-screen w-screen">
      <div className="w-[250px] shrink-0 border-r">
        <div className="px-2 py-4">
          <SidebarProfile />
        </div>

        <div className="px-2">
          <Input
            size="base"
            placeholder="Search for anything"
            preText={<MagnifyingGlass className="mr-2" />}
          />
        </div>

        <div className="flex flex-col border-b py-2">
          <SidebarMenuItem text="Recent" icon={Clock} />
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

          <div></div>

          <SidebarMenuItem text={"New Workspace"} icon={Plus} />

          <div className="flex p-3">
            <Banner
              image={"/assets/clouds.jpg"}
              filter={<RippleFilter />}
              className="ripple w-full"
            >
              <div className="absolute top-0 right-0 bottom-0 left-0 z-5 bg-white opacity-25"></div>

              <div className="absolute top-2 left-3 z-15 w-[200px] text-left text-sm text-black">
                <h2 className="text-lg font-semibold">Unlock Full Potential</h2>
                <p className="mb-2">
                  Outerbase Cloud gives you AI-driver insights, managed
                  database, and team collaboation.
                </p>

                <Button size="sm">Sign In</Button>
              </div>

              <div className="ease-bounce absolute right-5 bottom-5 z-10 transition-transform duration-300 group-hover:-translate-3 group-hover:scale-105">
                <img
                  src={"/assets/sat.png"}
                  width={50}
                  height={50}
                  className="float"
                  alt="img"
                />
              </div>
            </Banner>
          </div>
        </div>
        <div className="flex flex-col">
          <SidebarMenuItem text="Billing" />
          <SidebarMenuItem text="Setting" />
        </div>
      </div>
      <div className="flex min-h-screen w-full flex-col bg-neutral-50 dark:bg-neutral-950">
        <RecentResource />
      </div>
    </div>
  );
}
