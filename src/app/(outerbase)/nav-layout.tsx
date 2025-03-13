"use client";
import {
  SidebarMenuHeader,
  SidebarMenuItem,
  SidebarMenuLoadingItem,
} from "@/components/sidebar-menu";
import { cn } from "@/lib/utils";
import { Database, List, Plus } from "@phosphor-icons/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import NavigationProfile from "./nav-profile";
import NavigationSigninBanner from "./nav-signin-banner";
import { useSession } from "./session-provider";
import { useWorkspaces } from "./workspace-provider";

export default function NavigationLayout({ children }: PropsWithChildren) {
  const router = useRouter();
  const [mobileToggle, setMobileToggle] = useState(false);
  const { session } = useSession();
  const { workspaces, loading: workspaceLoading } = useWorkspaces();
  const pathname = usePathname();
  const { workspaceId } = useParams<{ workspaceId?: string }>();

  return (
    <div className="flex w-screen flex-col lg:h-screen lg:flex-row">
      <div className="bg-background sticky top-0 z-25 flex w-full shrink-0 flex-col overflow-hidden border-r-0 border-b lg:w-[250px] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-2 py-2">
          <NavigationProfile />
          <List
            className="mr-2 block h-6 w-6 cursor-pointer lg:hidden"
            onClick={() => {
              setMobileToggle(!mobileToggle);
            }}
          />
        </div>

        {mobileToggle && (
          <div
            className="fixed top-0 right-0 bottom-0 left-0 z-25 backdrop-blur-md lg:hidden"
            onClick={() => {
              setMobileToggle(false);
            }}
          ></div>
        )}

        <div
          className={cn(
            "bg-background fixed right-0 z-50 flex hidden h-screen w-2/3 flex-1 overflow-scroll border-b border-l pb-2 md:w-1/2 lg:relative lg:z-0 lg:block lg:h-auto lg:w-auto",
            {
              block: mobileToggle,
            }
          )}
        >
          <div className="flex flex-1 flex-col">
            <SidebarMenuHeader text="Workspace" />
            <SidebarMenuItem
              selected={pathname === "/local" || pathname === "/local-setting"}
              text="Local Workspace"
              icon={Database}
              href="/local"
            />

            {workspaces.map((workspace) => {
              return (
                <SidebarMenuItem
                  key={workspace.id}
                  text={workspace.name}
                  icon={Database}
                  onClick={
                    workspace.short_name === workspaceId
                      ? undefined
                      : () => {
                          router.push(`/w/${workspace.short_name}`);
                        }
                  }
                  selected={workspace.short_name === workspaceId}
                  badge={
                    !workspace.is_enterprise &&
                    workspace.subscription.plan === "starter" ? (
                      <span className="mr-2 rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-sm font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                        Free
                      </span>
                    ) : undefined
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

            <SidebarMenuItem
              text={"New Workspace"}
              icon={Plus}
              onClick={() => {
                if (session?.user) {
                  router.push("/new-workspace");
                } else {
                  localStorage.setItem("continue-redirect", "/new-workspace");
                  router.push("/signin");
                }
              }}
            />
          </div>

          <NavigationSigninBanner />
        </div>
      </div>
      <div className="flex min-h-screen w-full flex-col overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
        {children}
      </div>
    </div>
  );
}
