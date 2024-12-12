import { Node, NodeProps, Position } from "@xyflow/react";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";

import { BaseNode } from "@/components/base-node";
import { LabeledHandle } from "@/components/labeled-handle";
import { CaretDown, CaretUp, Key, Star } from "@phosphor-icons/react";
import { useCallback, useState } from "react";

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
}: NodeProps<DatabaseSchemaNode>) {
  const [show, setShow] = useState(data.schema.length < 20 ? true : false);

  const toggleShow = useCallback(() => setShow(!show), [show]);

  const totalColumn = data.schema.length;
  const items = data.schema
    .sort((a, b) => Number(b.pk) - Number(a.pk) || Number(b.fk) - Number(a.fk))
    .map((entry) => {
      const key = [];

      if (entry.pk) key.push("PK");
      if (entry.fk) key.push("FK");
      if (entry.unique) key.push("UQ");
      return { ...entry, key };
    });

  return (
    <BaseNode className="p-0" selected={selected}>
      <h2 className="rounded-tl-md rounded-tr-md bg-secondary p-2 text-center text-sm text-muted-foreground h-[30px] max-w-[300px]">
        {data.label}
      </h2>
      {/* shadcn Table cannot be used because of hardcoded overflow-auto */}
      <table className="overflow-visible w-full">
        <TableBody>
          {(show ? items : items.filter((x) => x.key.length > 0)).map(
            (entry) => {
              return (
                <TableRow key={entry.title} className="relative text-xs">
                  <TableCell className="pl-0 pr-6 font-light h-[30px]">
                    {entry.key.length > 0 ? (
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
                    {entry.key.length > 0 ? (
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
          <TableRow
            className="relative text-xs bg-secondary text-muted-foreground cursor-pointer hover:text-muted"
            onClick={toggleShow}
          >
            <TableCell className="pl-0 pr-6 font-light h-[30px]">
              <div className="pl-2 text-xs">
                {show
                  ? "collapse"
                  : `more ${totalColumn - items.filter((x) => x.key.length > 0).length} columns`}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="pr-2 flex flex-row justify-end items-center">
                {!show ? <CaretDown size={15} /> : <CaretUp size={15} />}
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </table>
    </BaseNode>
  );
}
