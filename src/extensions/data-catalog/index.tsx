import { StudioExtension } from "@/core/extension-base";
import { StudioExtensionContext } from "@/core/extension-manager";
import { createTabExtension } from "@/core/extension-tab";
import { LucideDatabase, LucideNotepadText } from "lucide-react";
import DataCatalogModelTab from "./data-model-tab";
import DataCatalogDriver from "./driver";
import DataCatalogSidebar from "./sidebar";

export const dataCatalogModelTab = createTabExtension({
  key: () => "data-catalog-model",
  name: "Data Model",
  generate: () => ({
    icon: LucideNotepadText,
    title: "Data Model",
    component: <DataCatalogModelTab />,
  }),
});
export default class DataCatalogExtension extends StudioExtension {
  extensionName = "data-catalog";

  constructor(protected driver: DataCatalogDriver) {
    super();
  }

  init(studio: StudioExtensionContext): void {
    studio.registerSidebar({
      key: "data-catalog",
      name: "Data Catalog 3",
      icon: <LucideDatabase />,
      content: <DataCatalogSidebar />,
    });
  }
}
