import { StudioExtension } from "@/core/extension-base";
import { StudioExtensionContext } from "@/core/extension-manager";
import { createTabExtension } from "@/core/extension-tab";
import { Book } from "@phosphor-icons/react";
import DataCatalogTab from "./data-catalog-tab";
import DataCatalogModelTab from "./data-model-tab";
import DataCatalogDriver from "./driver";
import DataCatalogSidebar from "./sidebar";
import DataCatalogResultHeader from "./table-result-header";

export const dataCatalogTab = createTabExtension({
  key: () => "data-catalog",
  name: "Data Catalog",
  generate: () => ({
    icon: Book,
    title: "Data Catalog",
    component: <DataCatalogTab />,
  }),
});

export const dataCatalogModelTab = createTabExtension({
  key: () => "data-catalog-model",
  name: "Data Model",
  generate: () => ({
    icon: Book,
    title: "Data Model",
    component: <DataCatalogModelTab />,
  }),
});
export default class DataCatalogExtension extends StudioExtension {
  extensionName = "data-catalog";

  constructor(public readonly driver: DataCatalogDriver) {
    super();
  }

  init(studio: StudioExtensionContext): void {
    this.driver.load().then().catch();

    studio.registerSidebar({
      key: "data-catalog",
      name: "Data Catalog",
      icon: <Book className="h-6 w-6" />,
      content: <DataCatalogSidebar />,
    });

    studio.registerQueryHeaderContextMenu((header) => {
      const from = header.metadata.from;
      if (!from) return;

      return {
        key: "data-catalog",
        title: "",
        component: (
          <DataCatalogResultHeader
            schemaName={from.schema}
            tableName={from.table}
            columnName={from.column}
            driver={this.driver}
          />
        ),
      };
    });
  }
}
