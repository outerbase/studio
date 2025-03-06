"use client";
import ClientOnly from "@/components/client-only";
import { SidebarMenuHeader, SidebarMenuItem } from "@/components/sidebar-menu";
import ThemeToggle from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DiamondsFour, Stack } from "@phosphor-icons/react";
import ThemeLayout from "../(theme)/theme_layout";

export default function StorybookRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientOnly>
      <ThemeLayout>
        <div className="flex h-screen w-screen overflow-hidden">
          <div className="flex w-[300px] flex-col border-r">
            <div className="flex p-2">
              <ThemeToggle />
            </div>

            <SidebarMenuItem icon={Stack} text="Guideline" href="/storybook" />
            <SidebarMenuHeader text="Shadcn UI" />

            <SidebarMenuItem
              icon={Stack}
              text="Dialog"
              href="https://ui.shadcn.com/docs/components/dialog"
            />
            <SidebarMenuItem
              icon={Stack}
              text="Create Dialog"
              href="/storybook/create-dialog"
            />
            <SidebarMenuItem
              icon={Stack}
              text="Dropdown Menu"
              href="https://ui.shadcn.com/docs/components/dropdown-menu"
            />
            <SidebarMenuItem
              icon={Stack}
              text="Popover"
              href="https://ui.shadcn.com/docs/components/popover"
            />

            <SidebarMenuHeader text="Orbit Design System" />
            <SidebarMenuItem
              icon={Stack}
              text="Avatar"
              href="/storybook/avatar"
            />
            <SidebarMenuItem
              icon={Stack}
              text="Button"
              href="/storybook/button"
            />
            <SidebarMenuItem
              icon={Stack}
              text="Input"
              href="/storybook/input"
            />
            <SidebarMenuItem
              icon={Stack}
              text="Label"
              href="/storybook/label"
            />
            <SidebarMenuItem
              icon={Stack}
              text="Loader"
              href="/storybook/loader"
            />
            <SidebarMenuItem
              icon={Stack}
              text="Menu bar"
              href="/storybook/menu-bar"
            />
            <SidebarMenuItem
              icon={Stack}
              text="Select"
              href="/storybook/select"
            />

            <SidebarMenuItem
              icon={Stack}
              text="Toggle"
              href="/storybook/toggle"
            />

            <Separator />
            <SidebarMenuHeader text="Advanced UI Components" />
            <SidebarMenuItem
              icon={Stack}
              text="Toolbar"
              href="/storybook/toolbar"
            />
            <SidebarMenuItem
              icon={DiamondsFour}
              text="List View"
              href="/storybook/listview"
            />
            <SidebarMenuItem
              icon={DiamondsFour}
              text="Chart Editor"
              href="/storybook/chart-editor"
            />
            <SidebarMenuItem text="Board" href="/storybook/board" />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <TooltipProvider>{children}</TooltipProvider>
          </div>
        </div>
      </ThemeLayout>
    </ClientOnly>
  );
}
