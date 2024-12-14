import React, { PropsWithChildren } from "react";
import { useDatabaseDriver } from "@/context/driver-provider";
import { openTab } from "@/messages/open-tab";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../../ui/context-menu";

export default function ContextMenuERD({
  schemaName,
  tableName,
  children,
}: PropsWithChildren<{ schemaName: string; tableName: string }>) {
  const { databaseDriver } = useDatabaseDriver();

  const handleEditTable = () => {
    openTab({
      tableName: tableName,
      type: "schema",
      schemaName: schemaName,
    });
  };

  const handleOpenTableData = () => {
    openTab({
      tableName: tableName,
      type: "table",
      schemaName: schemaName,
    });
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
