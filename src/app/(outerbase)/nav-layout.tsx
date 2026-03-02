"use client";
import { SidebarMenuHeader, SidebarMenuItem } from "@/components/sidebar-menu";
import { cn } from "@/lib/utils";
import { Database, List } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";

export default function NavigationLayout({ children }: PropsWithChildren) {
  const [mobileToggle, setMobileToggle] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex w-screen flex-col lg:h-screen lg:flex-row">
      <div className="bg-background sticky top-0 z-25 flex w-full shrink-0 flex-col overflow-hidden border-r-0 border-b lg:w-[250px] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-2 py-2">
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
          </div>
        </div>
      </div>
      <div className="flex min-h-screen w-full flex-col overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
        {children}
      </div>
    </div>
  );
}
