import { SidebarMenuHeader, SidebarMenuItem } from "@/components/sidebar-menu";
import { Database } from "@phosphor-icons/react";
import { dataCatalogModelTab, dataCatalogTab } from ".";

export default function DataCatalogSidebar() {
  return (
    <div className="flex flex-1 flex-col">
      <SidebarMenuHeader text="Data Catalog" />
      <SidebarMenuItem
        text="Data Catalog"
        onClick={() => dataCatalogTab.open({})}
        icon={Database}
      />
      <SidebarMenuItem
        text="Data Model"
        onClick={() => dataCatalogModelTab.open({})}
        icon={Database}
      />
    </div>
  );
}
