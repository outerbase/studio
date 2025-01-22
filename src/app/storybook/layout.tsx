import { SidebarMenuHeader, SidebarMenuItem } from "@/components/sidebar-menu";
import { Separator } from "@/components/ui/separator";
import { Component, Layers2 } from "lucide-react";

export default async function StorybookRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body>
      <div className="flex h-screen w-screen">
        <div className="flex w-[300px] flex-col border-r">
          <SidebarMenuHeader text="Basic UI Components" />
          <SidebarMenuItem icon={Layers2} text="Input & Button" />
          <SidebarMenuItem icon={Layers2} text="Dialog" />
          <SidebarMenuItem icon={Layers2} text="Dropdown Menu" />
          <SidebarMenuItem icon={Layers2} text="Popover" />
          <SidebarMenuItem icon={Layers2} text="Toolbar" />
          <Separator />
          <SidebarMenuHeader text="Advanced UI Components" />
          <SidebarMenuItem
            icon={Component}
            text="List View"
            href="/storybook/listview"
          />
          <SidebarMenuItem icon={Layers2} text="Sidebar Menu" />
        </div>
        <div className="flex-1 p-8">{children}</div>
      </div>
    </body>
  );
}
