import { SidebarMenuItem } from "@/components/sidebar-menu";
import { dataCatalogModelTab } from ".";

export default function DataCatalogSidebar() {
  return (
    <div className="flex flex-1 flex-col">
      <SidebarMenuItem
        text="Data Model"
        onClick={() => dataCatalogModelTab.open({})}
      />
    </div>
  );
}
