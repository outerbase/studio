import TableDataWindow from "@/components/gui/tabs/table-data-tab";
import { Table } from "@phosphor-icons/react";
import { createTabExtension } from "../extension-tab";

export const builtinOpenTableTab = createTabExtension<{
  schemaName: string;
  tableName: string;
}>({
  name: "table",
  key: (options) => {
    return options.schemaName + "-" + options?.tableName;
  },
  generate: (options) => ({
    title: options.tableName,
    component: (
      <TableDataWindow
        tableName={options.tableName}
        schemaName={options.schemaName}
      />
    ),
    icon: Table,
  }),
});
