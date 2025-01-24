import { TableCell, TableRow } from "@/components/ui/table";
import { ERDSchemaNodeColumnProps } from "./database-schema-node";
import { BaseHandle } from "@/components/base-handle";
import { Position } from "@xyflow/react";
import { Key } from "lucide-react";

export default function ERDTableColumn({
  column,
}: {
  column: ERDSchemaNodeColumnProps;
}) {
  return (
    <TableRow className="group relative text-xs">
      <TableCell className="p-0 pr-6 font-light h-[30px] text-sm pl-2 font-mono">
        <BaseHandle
          id={column.title}
          type="target"
          position={Position.Left}
          className="opacity-0 group-hover:opacity-100 !w-[10px] !h-[10px]"
        />
        <div className="h-[30px] flex items-center">
          <div className="w-6">
            {column.pk && <Key size={15} color={"rgb(153 27 27)"} />}
            {column.fk && <Key size={15} color={"rgb(245 158 11)"} />}
          </div>
          <div className="max-w-[120px] truncate">{column.title}</div>
        </div>
      </TableCell>
      <TableCell className="p-0 pr-0 text-right font-thin h-[30px] text-sm">
        <div className="h-[30px] flex items-center justify-end pr-2 font-mono text-muted-foreground max-w-[75px] truncate">
          {column.type}
        </div>
        <BaseHandle
          id={column.title}
          type="source"
          position={Position.Right}
          className="opacity-0 group-hover:opacity-100 !w-[10px] !h-[10px]"
        />
      </TableCell>
    </TableRow>
  );
}
