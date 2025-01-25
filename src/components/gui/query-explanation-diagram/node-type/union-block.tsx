import { BaseHandle } from "@/components/base-handle";
import { ExplainNodeProps } from "../build-query-explanation-flow";
import { Position } from "@xyflow/react";

export function UnionBlock(props: ExplainNodeProps) {
  return (
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
      <div className="flex flex-row justify-center max-w-[200px]  p-2 w-[150px] items-center bg-gray-300 text-gray-900 border-gray-900 text-[8pt]">
        <small>{props.data.label}</small>
      </div>
    </div>
  );
}
