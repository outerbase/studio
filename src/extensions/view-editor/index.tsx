import { StudioExtension } from "@/core/extension-base";
import { createTabExtension } from "@/core/extension-tab";
import ViewTab from "./view-tab";
import { LucideView } from "lucide-react";
import { StudioExtensionContext } from "@/core/extension-manager";

export const viewEditorExtensionTab = createTabExtension<{
  schemaName?: string;
  name?: string;
}>({
  name: "view",
  key: (options) => {
    return `${options.schemaName}.${options.name}`;
  },
  generate: (options) => ({
    title: options.name || "New View",
    component: (
      <ViewTab schemaName={options.schemaName} name={options.name ?? ""} />
    ),
    icon: LucideView,
  }),
});

export default class ViewEditorExtension extends StudioExtension {
  extensionName = "view-editor";

  init(studio: StudioExtensionContext): void {
    studio.registerCreateResourceMenu({
      key: "view",
      title: "Create View",
      onClick: () => {
        viewEditorExtensionTab.open({});
      },
    });

    studio.registerResourceContextMenu((resource) => {
      if (resource.type !== "view") return;
      return {
        key: "view",
        title: "Edit View",
        onClick: () => {
          viewEditorExtensionTab.open({
            schemaName: resource.schemaName,
            name: resource.name,
          });
        },
      };
    }, "modification");
  }
}
