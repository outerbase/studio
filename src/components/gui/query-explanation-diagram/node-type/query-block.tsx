import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Position } from "@xyflow/react";
import { BaseHandle } from "@/components/base-handle";
import { ExplainNodeProps, formatCost } from "../build-query-explanation-flow";

export function QueryBlock(props: ExplainNodeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <BaseHandle
            type="target"
            position={Position.Left}
            id={props.id}
            className="opacity-0 group-hover:opacity-100 w-[10px]! h-[10px]!"
          />
          <BaseHandle
            type="source"
            position={Position.Right}
            id={props.id}
            className="opacity-0 group-hover:opacity-100 w-[10px]! h-[10px]!"
          />
          <div className="flex flex-row justify-between items-center text-[8pt]">
            <div
              className={`${props.data.cost_info.query_cost === 0 ? "hidden" : ""}`}
            >
              <small>
                Query cost: {formatCost(props.data.cost_info.query_cost || 0)}
              </small>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <div className="max-w-[200px] p-2 bg-gray-300 text-gray-900 border-gray-900 text-[9pt] border-b rounded-md py-4">
              <div>
                <small>
                  {props.id.split("-")?.[0] || null}{" "}
                  {props.data.select_id ? `#${props.data.select_id}` : ""}
                </small>
              </div>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div>
          <p className="text-[9pt]!">Select ID: {props.data.select_id}</p>
          <p
            className={`text-[9pt]! ${props.data.cost_info.query_cost === 0 ? "hidden" : ""}`}
          >
            Query Cost: {props.data.cost_info.query_cost}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
