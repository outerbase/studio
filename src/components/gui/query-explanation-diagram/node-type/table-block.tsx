import { BaseHandle } from "@/components/base-handle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Position } from "@xyflow/react";
import { ExplainNodeProps, formatCost } from "../buildQueryExplanationFlow";

export function TableBlock(props: ExplainNodeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <BaseHandle
            type="target"
            position={Position.Top}
            id={props.id}
            className="opacity-0 group-hover:opacity-100 !w-[10px] !h-[10px]"
          />
          <div className={`flex flex-row justify-between items-center text-[8pt]`}>
            <div><small>{formatCost(Number(props.data.cost_info.read_cost) + Number(props.data.cost_info.eval_cost))}</small></div>
            <div><small>{formatCost(Number(props.data.rows_examined_per_scan))} rows</small></div>
          </div>
          <div className={`p-2 text-white text-[9pt] border-b rounded-md text-center ${props.data.access_type === 'ALL' ? 'bg-rose-700' : 'bg-emerald-700'}`}>
            <small>{props.data.access_type === 'ALL' ? 'Full Table Scan' : props.data.access_type === 'eq_ref' ? 'Unique Key Lookup' : 'Non-Unique Key Lookup'}</small>
          </div>
          <div className="flex flex-col justify-center text-[8pt] items-center">
            <div>
              <small>{props.data.table_name}</small>
            </div>
            <div>
              <small className="font-bold">{props.data.key}</small>
            </div>
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