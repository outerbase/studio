import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Position } from "@xyflow/react";
import { BaseHandle } from "@/components/base-handle";
import { ExplainNodeProps, formatCost } from "../buildQueryExplanationFlow";

export function NestedLoop(props: ExplainNodeProps) {
  console.log(props.data)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <BaseHandle
            type="target"
            position={Position.Right}
            id={props.id}
            className="opacity-0 group-hover:opacity-100 !w-[10px] !h-[10px]"
          />
          <BaseHandle
            type="source"
            position={Position.Left}
            id={'left'}
            className="opacity-0 group-hover:opacity-100 !w-[10px] !h-[10px]"
          />
          <BaseHandle
            type="source"
            position={Position.Bottom}
            id={'bottom'}
            className="opacity-0 group-hover:opacity-100 !w-[10px] !h-[10px]"
          />
          <div className="flex flex-row justify-between items-center text-[8pt]">
            <div><small>{formatCost(props.data.cost_info.prefix_cost)}</small></div>
          </div>
          <div className="w-[50px] h-[50px] rotate-45 p-2 bg-secondary text-muted-foreground text-[9pt] border-b rounded-md overflow-hidden text-center my-2 mx-2">
            <div className="-rotate-45"><small>{props.data.label}</small></div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div>
          <p className="!text-[9pt]">Prefix Cost: {props.data.cost_info.prefix_cost}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}