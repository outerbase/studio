import { Node, NodeProps } from "@xyflow/react";
import { TableBody } from "@/components/ui/table";
import { BaseNode } from "@/components/base-node";
import ContextMenuERD from "./context-menu-diagram";
import ERDTableColumn from "./erd-table-column";

export interface ERDSchemaNodeColumnProps {
  title: string;
  type: string;
  pk: boolean;
  fk: boolean;
  unique: boolean;
}

export type ERDSchemaNodeProps = Node<{
  label: string;
  schemaName: string;
  schema: ERDSchemaNodeColumnProps[];
}>;

export function DatabaseSchemaNode({
  data,
  selected,
}: NodeProps<ERDSchemaNodeProps>) {
  const schema = data.schema;

  return (
    <BaseNode className="p-0" selected={selected}>
      <ContextMenuERD tableName={data.label} schemaName={data.schemaName}>
        <h2 className="rounded-tl-md rounded-tr-md bg-secondary p-2 flex items-center justify-center text-sm text-muted-foreground h-[30px] max-w-[300px] hover:text-blue-600 transition-all">
          {data.label}
        </h2>
      </ContextMenuERD>
      {/* shadcn Table cannot be used because of hardcoded overflow-auto */}
      <table className="overflow-visible w-full">
        <TableBody>
          {schema.map((entry) => {
            return <ERDTableColumn key={entry.title} column={entry} />;
          })}
        </TableBody>
      </table>
    </BaseNode>
  );
}
