import { DatabaseSchemaNode } from "@/components/database-schema-node";
import { useSchema } from "@/context/schema-provider";
import { DatabaseSchemas } from "@/drivers/base-driver";
import { addEdge, Background, Connection, Controls, Edge, MiniMap, Node, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useState } from "react";
import { Toolbar } from "../toolbar";
import { Button } from "@/components/ui/button";
import { LucideRefreshCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import SchemaNameSelect from "../schema-editor/schema-name-select";

function mapSchema(schema: DatabaseSchemas, selectedSchema: string) {
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  for (const item of schema[selectedSchema]) {
    const items: unknown[] = [];
    const index = schema[selectedSchema].findIndex(f => f.name === item.name);

    for (const column of item.tableSchema?.columns || []) {
      items.push({
        title: column.name,
        type: column.type,
        pk: !!column.pk,
        fk: !!column.constraint?.foreignKey,
        unique: !!column.constraint?.unique,
      })

      if (column.constraint && column.constraint.foreignKey) {
        initialEdges.push({
          id: `${item.name}-${column.constraint.foreignKey.foreignTableName}`,
          source: item.name,
          target: column.constraint.foreignKey.foreignTableName || '',
          sourceHandle: column.name,
          targetHandle: column.constraint.foreignKey.foreignColumns ? column.constraint.foreignKey.foreignColumns[0] : '',
          animated: true,
        });
      }
    }

    initialNodes.push({
      id: String(item.name),
      position: { x: index * 150, y: index * 150 },
      type: 'databaseSchema',
      data: {
        label: item.name,
        schema: items
      }
    })
  }

  return {
    initialNodes,
    initialEdges
  }
}

export default function RelationalDiagramTab() {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const { schema: initialSchema, currentSchemaName, refresh } = useSchema();
  const [schema] = useState(initialSchema);
  const [selectedSchema, setSelectedSchema] = useState(currentSchemaName);
  const [revision, setRevision] = useState(true);

  useEffect(() => {
    if (revision) {
      const { initialEdges, initialNodes } = mapSchema(schema, selectedSchema);
      setNodes(initialNodes);
      setEdges(initialEdges);
      setRevision(false);
    }
  }, [schema, selectedSchema, setEdges, setNodes, revision])

  const nodeTypes = {
    databaseSchema: DatabaseSchemaNode,
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((els) => addEdge(params, els)),
    [setEdges],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden relative">
      <div className="border-b pb-1">
        <h1 className="text-lg font-semibold text-primary p-4 mb-1">
          Entity Relationship Diagram
        </h1>
      </div>
      <div className="shrink-0 grow-0 border-b border-neutral-200 dark:border-neutral-800">
        <Toolbar>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={refresh}
          // disabled={loading}
          >
            <LucideRefreshCcw className="w-4 h-4 text-green-600" />
          </Button>
          <div className="mx-1">
            <Separator orientation="vertical" />
          </div>
          <SchemaNameSelect
            value={selectedSchema}
            onChange={(value) => {
              setSelectedSchema(value);
              setRevision(true);
            }}
          />
        </Toolbar>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}