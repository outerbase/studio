import { BaseHandle } from "@/components/base-handle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Position } from "@xyflow/react";
import { ExplainNodeProps, formatCost } from "../buildQueryExplanationFlow";

export function TableBlock(props: ExplainNodeProps) {
  let bgColor = 'bg-emerald-700';
  let label = 'Unique Key Lookup';

  if (props.data.access_type === 'ALL') {
    bgColor = 'bg-rose-700';
    label = 'Full Table Scan'
  }

  if (props.data.access_type === 'range') {
    bgColor = 'bg-yellow-700';
    label = 'Index Range Scan';
  }

  if (props.data.access_type === 'ref') {
    label = 'Non-Unique Key Lookup'
  }

  if (props.data.access_type === 'index') {
    bgColor = 'bg-rose-700';
    label = "Full Index Scan";
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <BaseHandle
            type="source"
            position={Position.Top}
            id={props.id}
            className="opacity-0 group-hover:opacity-100 !w-[10px] !h-[10px]"
          />
          <BaseHandle
            type="source"
            position={Position.Right}
            id={'right'}
            className="opacity-0 group-hover:opacity-100 !w-[10px] !h-[10px]"
          />
          <div className={`flex flex-row justify-between items-center text-[8pt]`}>
            <div><small>{formatCost(Number(props.data.cost_info.read_cost) + Number(props.data.cost_info.eval_cost))}</small></div>
            <div><small>{formatCost(Number(props.data.rows_examined_per_scan))} rows</small></div>
          </div>
          <div className={`p-2 text-white text-[9pt] border-b rounded-md text-center ${bgColor}`}>
            <small>{label}</small>
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