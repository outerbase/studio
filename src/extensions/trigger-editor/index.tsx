import { StudioExtension } from "@/core/extension-base";
import { StudioExtensionContext } from "@/core/extension-manager";
import { createTabExtension } from "@/core/extension-tab";
import TriggerTab from "./trigger-tab";
import { LucideCog } from "lucide-react";

export const triggerEditorExtensionTab = createTabExtension<{
  schemaName?: string;
  name?: string;
  tableName?: string;
}>({
  name: 'trigger',
  key: (options) => {
    return `${options.schemaName}.${options.name}`;
  },
  generate: (options) => ({
    title: options.name || 'New Trigger',
    component: (
      <TriggerTab schemaName={options.schemaName ?? ''} name={options.name ?? ''} tableName={options.tableName ?? ''}/>
    ),
    icon: LucideCog,
  })
})

export default class TriggerEditorExtension extends StudioExtension {
  extensionName = "trigger-editor";

  init(studio: StudioExtensionContext): void {
    studio.registerCreateResourceMenu({
      key: "trigger",
      title: "Create Trigger",
      onClick: () => {
        triggerEditorExtensionTab.open({});
      },
    });

    studio.registerResourceContextMenu((resource) => {
      if (resource.type !== "trigger") return;
      return {
        key: "trigger",
        title: "Edit Trigger",
        onClick: () => {
          triggerEditorExtensionTab.open({
            schemaName: resource.schemaName,
            name: resource.name,
            tableName: resource.tableName
          });
        },
      };
    }, "modification");
  }
}
