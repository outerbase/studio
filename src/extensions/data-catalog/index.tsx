import { StudioExtension } from "@/core/extension-base";
import { StudioExtensionContext } from "@/core/extension-manager";
import { LucideDatabase } from "lucide-react";
import DataCatalogDriver from "./driver";
import DataCatalogSidebar from "./sidebar";

export default class DataCatalogExtension extends StudioExtension {
  extensionName = "data-catalog";

  constructor(protected driver: DataCatalogDriver) {
    super();
  }

  init(studio: StudioExtensionContext): void {
    // do something here
    studio.registerSidebar({
      key: "data-catalog",
      name: "Data Catalog",
      icon: <LucideDatabase />,
      content: <DataCatalogSidebar />,
    });
  }
}
