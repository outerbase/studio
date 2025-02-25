import { BaseHandle } from "@/components/base-handle";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Position } from "@xyflow/react";
import { Key } from "lucide-react";
import { ERDSchemaNodeColumnProps } from "./database-schema-node";

export default function ERDTableColumn({
  column,
}: {
  column: ERDSchemaNodeColumnProps;
}) {
  return (
    <TableRow className="group relative text-sm">
      <TableCell className="h-[30px] p-0 pr-6 pl-2 font-mono text-sm font-light">
        <BaseHandle
          id={column.title}
          type="target"
          position={Position.Left}
          className="h-[10px]! w-[10px]! opacity-0 group-hover:opacity-100"
        />
        <div className="flex h-[30px] items-center">
          <div className="w-6">
            {column.pk && <Key size={15} color={"rgb(153 27 27)"} />}
            {column.fk && <Key size={15} color={"rgb(245 158 11)"} />}
          </div>
          <div className="max-w-[120px] truncate">{column.title}</div>
        </div>
      </TableCell>
      <TableCell className="relative h-[30px] p-0 pr-0 text-sm font-thin">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-muted-foreground flex h-[30px] w-[100px] items-center justify-end pr-2 font-mono">
              <div className="truncate">{column.type}</div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">{column.type}</TooltipContent>
        </Tooltip>
        <BaseHandle
          id={column.title}
          type="source"
          position={Position.Right}
          className="h-[10px]! w-[10px]! opacity-0 group-hover:opacity-100"
        />
      </TableCell>
    </TableRow>
  );
}
