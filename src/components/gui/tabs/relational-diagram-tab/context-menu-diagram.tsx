import { useStudioContext } from "@/context/driver-provider";
import { PropsWithChildren } from "react";

import { scc } from "@/core/command";
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
  const { databaseDriver } = useStudioContext();

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
