import SchemaEditorTab from "@/components/gui/tabs/schema-editor-tab";
import { LucideTableProperties } from "lucide-react";
import openUnsafeTab from "./open-tab";

export default function builtinOpenSchemaTab(payload: {
  schemaName?: string;
  tableName?: string;
}) {
  return openUnsafeTab({
    title: payload.tableName ? payload.tableName : "New Table",
    identifier: "schema",
    key: !payload.tableName
      ? "create-schema"
      : "schema-" + payload.schemaName + "-" + payload.tableName,
    component: (
      <SchemaEditorTab
        tableName={payload.tableName}
        schemaName={payload.schemaName}
      />
    ),
    icon: LucideTableProperties,
    type: "schema",
  });
}
