import React, { PropsWithChildren } from "react";
import { useDatabaseDriver } from "@/context/driver-provider";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../../ui/context-menu";
import { scc } from "@/core/command";

export default function ContextMenuERD({
  schemaName,
  tableName,
  children,
}: PropsWithChildren<{ schemaName: string; tableName: string }>) {
  const { databaseDriver } = useDatabaseDriver();

  const handleEditTable = () => {
    scc.tabs.openBuiltinSchema({
      schemaName: schemaName,
      tableName: tableName,
    });
  };

  const handleOpenTableData = () => {
    scc.tabs.openBuiltinTable({ tableName: tableName, schemaName: schemaName });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleOpenTableData}>
          Expore Table Data
        </ContextMenuItem>
        {databaseDriver.getFlags().supportCreateUpdateTable && (
          <ContextMenuItem onClick={handleEditTable}>
            Edit Table
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
