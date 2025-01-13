import ViewTab from "@/components/gui/tabs/view-tab";
import { createTabExtension } from "../extension-tab";
import { LucideCog } from "lucide-react";

export const buildinOpenViewTab = createTabExtension<{
  schemaName: string;
  tableName?: string;
  name?: string;
}>({
  name: "view",
  key: (options) => {
    return (
      options.schemaName +
      "-" +
      (options.tableName ?? "") +
      "-" +
      (options.name ?? "")
    );
  },
  generate: (options) => ({
    title: options.name || "New View",
    component: (
      <ViewTab
        schemaName={options.schemaName}
        name={options.name ?? ""}
        tableName={options.tableName ?? ""}
      />
    ),
    icon: LucideCog,
  }),
});
