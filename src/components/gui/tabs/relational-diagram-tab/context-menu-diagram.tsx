import React, { useCallback, useState } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '../../../ui/context-menu';
import { useDatabaseDriver } from '@/context/driver-provider';
import { openTab } from '@/messages/open-tab';
import { Node, NodeProps } from '@xyflow/react';
import { useSchema } from '@/context/schema-provider';
import { createTableSchemaDraft } from '../../../lib/sql-generate.schema';

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

export default function ContextMenuERD(props: React.PropsWithChildren<NodeProps<DatabaseSchemaNode>>) {
  const { databaseDriver } = useDatabaseDriver();
  const { refresh, currentSchemaName } = useSchema();
  const [loading, setLoading] = useState(false);

  const fetchTable = useCallback(
    async (schemaName: string, name: string) => {
      return databaseDriver
        .tableSchema(schemaName, name)
        .then((schema) => {
          return createTableSchemaDraft(schemaName, schema)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    },
    [databaseDriver]
  );

  const handleCopyName = () => {
    window.navigator.clipboard.writeText(props.data.label);
  }

  const handleEditTable = () => {
    openTab({
      tableName: props.data.label,
      type: 'schema',
      schemaName: currentSchemaName
    })
  }

  const handleCopyScriptCreate = () => {
    if (props.data.label && currentSchemaName) {
      setLoading(true);
      fetchTable(currentSchemaName, props.data.label).then((res: any) => {
        const script = res.createScript;
        window.navigator.clipboard.writeText(script);
      }).catch(console.error);
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger disabled={loading}>{props.children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Copy</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={handleCopyName}>Name</ContextMenuItem>
            <ContextMenuItem onClick={handleCopyScriptCreate}>Script Create</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        {
          databaseDriver.getFlags().supportCreateUpdateTable && <ContextMenuItem onClick={handleEditTable}>Edit Table</ContextMenuItem>
        }
        <ContextMenuItem onClick={() => refresh()}>Refresh</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}