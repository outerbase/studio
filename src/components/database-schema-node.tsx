import { Node, NodeProps, Position } from "@xyflow/react";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";

import { BaseNode } from "@/components/base-node";
import { LabeledHandle } from "@/components/labeled-handle";
import { Key, Star } from "@phosphor-icons/react";
import ContextMenuERD from "./context-menu-diagram";

type DatabaseSchemaNode = Node<{
  label: string;
  schema: {
    title: string;
    type: string;
    pk: boolean;
    fk: boolean;
    unique: boolean;
  }[];
}>;

export function DatabaseSchemaNode({
  data,
  selected,
  ...props
}: NodeProps<DatabaseSchemaNode>) {
  const key = data.schema.filter(f => f.pk || f.fk).map(x => x.title);

  const schema = data.schema.sort((a, b) => Number(b.pk) - Number(a.pk) || Number(b.fk) - Number(a.fk)).filter((_, i) => i <= 20);

  return (
    <ContextMenuERD {...{ data, ...props }}>
      <BaseNode className="p-0" selected={selected}>
        <h2 className="rounded-tl-md rounded-tr-md bg-secondary p-2 text-center text-sm text-muted-foreground h-[30px] max-w-[300px]">
          {data.label}
        </h2>
        {/* shadcn Table cannot be used because of hardcoded overflow-auto */}
        <table className="overflow-visible w-full">
          <TableBody>
            {schema.filter((_, i) => i <= 20).map((entry) => {
              return (
                <TableRow key={entry.title} className="relative text-xs">
                  <TableCell className="pl-0 pr-6 font-light h-[30px]">
                    {key.includes(entry.title) ? (
                      <LabeledHandle
                        id={entry.title}
                        title={entry.title}
                        type="target"
                        position={Position.Left}
                        childrenKey={
                          <div className="w-6 mx-1 flex flex-row gap-[1px]">
                            {entry.pk && (
                              <Key size={15} color={"rgb(153 27 27)"} />
                            )}
                            {entry.fk && (
                              <Key size={15} color={"rgb(245 158 11)"} />
                            )}
                            {entry.unique && (
                              <div className="bg-rose-800 p-1 rounded-md w-5 flex flex-row items-center justify-center">
                                <Star size={10} color={"#FFFFFF"} />
                              </div>
                            )}
                          </div>
                        }
                      />
                    ) : (
                      <div className="pl-2">{entry.title}</div>
                    )}
                  </TableCell>
                  <TableCell className="pr-0 text-right font-thin h-[30px]">
                    {key.includes(entry.title) ? (
                      <LabeledHandle
                        id={entry.title}
                        title={entry.type}
                        type="source"
                        position={Position.Right}
                        className="p-0"
                        handleClassName="p-0"
                        labelClassName="p-0"
                      />
                    ) : (
                      <div className="pr-2">{entry.type}</div>
                    )}
                  </TableCell>
                </TableRow>
              );
            }
            )}
            {
              data.schema.length > 20 && <TableRow className="relative text-xs">
                <TableCell className="pl-0 pr-6 font-light h-[30px]">
                  <div className="text-sm text-muted-foreground pl-2">{data.schema.length - schema.length} more columns...</div>
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </table>
      </BaseNode>
    </ContextMenuERD>
  );
}
