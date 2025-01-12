import TriggerTab from "@/components/gui/tabs/trigger-tab";
import { LucideCog } from "lucide-react";
import { createTabExtension } from "../extension-tab";

export const builtinOpenTriggerTab = createTabExtension<{
  schemaName: string;
  tableName?: string;
  name?: string;
}>({
  name: "trigger",
  key: (options) => {
    return (
      options.schemaName +
      "-" +
      (options?.tableName ?? "") +
      "-" +
      (options?.name ?? "")
    );
  },
  generate: (options) => ({
    title: options.name || "New Trigger",
    component: (
      <TriggerTab
        schemaName={options.schemaName}
        name={options.name ?? ""}
        tableName={options.tableName ?? ""}
      />
    ),
    icon: LucideCog,
  }),
});
