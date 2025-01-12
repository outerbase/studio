import TableDataWindow from "@/components/gui/tabs/table-data-tab";
import { Table } from "@phosphor-icons/react";
import openUnsafeTab from "./open-tab";

export default function builtinOpenTableTab(payload: {
  schemaName: string;
  tableName: string;
}) {
  return openUnsafeTab({
    title: payload.tableName,
    identifier: "table",
    key: "table-" + payload.schemaName + "-" + payload.tableName,
    component: (
      <TableDataWindow
        tableName={payload.tableName}
        schemaName={payload.schemaName}
      />
    ),
    icon: Table,
    type: "table",
  });
}
