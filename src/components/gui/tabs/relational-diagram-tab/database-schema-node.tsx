import { BaseNode } from "@/components/base-node";
import { TableBody } from "@/components/ui/table";
import { Node, NodeProps } from "@xyflow/react";
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
        <h2 className="bg-secondary text-muted-foreground flex h-[30px] max-w-[300px] items-center justify-center rounded-tl-md rounded-tr-md p-2 text-sm transition-all hover:text-blue-600">
          {data.label}
        </h2>
      </ContextMenuERD>
      {/* shadcn Table cannot be used because of hardcoded overflow-auto */}
      <table className="w-full overflow-visible">
        <TableBody>
          {schema.map((entry) => {
            return <ERDTableColumn key={entry.title} column={entry} />;
          })}
        </TableBody>
      </table>
    </BaseNode>
  );
}
