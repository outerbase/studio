import { BaseHandle } from "@/components/base-handle";
import { Position } from "@xyflow/react";
import { ExplainNodeProps } from "../build-query-explanation-flow";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function OperationBlock(props: ExplainNodeProps) {
  const borderColor = props.data.using_filesort
    ? "border-rose-500"
    : "border-yellow-500";
  const label = props.type === "ORDERING_OPERATION" ? "ORDER" : "GROUP";
  const subLabel =
    props.type === "ORDERING_OPERATION" ? "filesort" : "tmp table";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <BaseHandle
            type="source"
            position={Position.Right}
            id={props.id}
            className="opacity-0 group-hover:opacity-100 w-[10px]! h-[10px]!"
          />
          <BaseHandle
            type="target"
            position={Position.Left}
            id={props.id}
            className="opacity-0 group-hover:opacity-100 w-[10px]! h-[10px]!"
          />
          <div className="flex flex-row justify-between items-center text-[8pt]">
            <small>{subLabel}</small>
          </div>
          <div className="flex flex-row items-center">
            <div
              className={`max-w-[200px] w-[100px] text-center  p-2 bg-gray-300 text-gray-900 ${borderColor} text-[9pt] border-2 rounded-md py-4`}
            >
              <div>
                <small>{label}</small>
              </div>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div>
          {props.data.using_temporary_table && (
            <p className="text-[9pt]!">Using Temporary Table: True</p>
          )}
          <p className="text-[9pt]!">
            Using Filesort: {props.data.using_filesort ? "True" : "False"}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
