import SchemaEditorTab from "@/components/gui/tabs/schema-editor-tab";
import { LucideTableProperties } from "lucide-react";
import { createTabExtension } from "../extension-tab";

export const builtinOpenSchemaTab = createTabExtension<
  | {
      schemaName?: string;
      tableName?: string;
    }
  | undefined
>({
  name: "schema",
  key: (options) => {
    if (!options?.tableName) {
      return "create";
    }
    return `${options.schemaName}-${options.tableName}`;
  },
  generate: (options) => ({
    title: options?.tableName ? options.tableName : "New Table",
    component: (
      <SchemaEditorTab
        tableName={options?.tableName}
        schemaName={options?.schemaName}
      />
    ),
    icon: LucideTableProperties,
  }),
});
