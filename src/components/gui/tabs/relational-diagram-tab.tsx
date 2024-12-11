import { DatabaseSchemaNode } from "@/components/database-schema-node";
import { useSchema } from "@/context/schema-provider";
import { DatabaseSchemas } from "@/drivers/base-driver";
import { addEdge, Background, Connection, Controls, Edge, MiniMap, Node, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useState } from "react";
import { Toolbar } from "../toolbar";
import { Button } from "@/components/ui/button";
import { LucideRefreshCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import SchemaNameSelect from "../schema-editor/schema-name-select";
import Dagre from '@dagrejs/dagre';

function getLayoutElements(nodes: Node[], edges: Edge[], options: any) {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    }),
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      // return { ...node }
      return { ...node, position: { x, y } };
    }),
    edges,
  };
}

function mapSchema(schema: DatabaseSchemas, selectedSchema: string): { initialNodes: Node[]; initialEdges: Edge[] } {
  const initialNodes: unknown[] = [];
  const initialEdges: Edge[] = [];

  for (const item of schema[selectedSchema]) {
    const items: unknown[] = [];
    const relationShip = schema[selectedSchema].filter(x => x.tableSchema?.columns.filter(c => c.constraint?.foreignKey).map(c => c.constraint?.foreignKey?.foreignTableName).includes(item.name));

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
      type: 'databaseSchema',
      position: { x: relationShip.length < 0 ? 200 : 0, y: relationShip.length * 100 },
      countRelationship: relationShip.length,
      measured: {
        width: 370,
        height: ((item.tableSchema?.columns.length || 0) * 60) + 67
      },
      data: {
        label: item.name,
        schema: items
      }
    })
  }

  const nodes = initialNodes.sort((a: any, b: any) => b.countRelationship - a.countRelationship) as any;

  const layout = getLayoutElements(nodes, initialEdges, { direction: 'LR' })

  return {
    initialNodes: layout.nodes,
    initialEdges: layout.edges
  }
}

function LayoutFlow() {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const { schema: initialSchema, currentSchemaName, refresh } = useSchema();
  const [schema] = useState(initialSchema);
  const [selectedSchema, setSelectedSchema] = useState(currentSchemaName);
  const [revision, setRevision] = useState(true);

  useEffect(() => {
    if (revision) {
      const { initialEdges, initialNodes } = mapSchema(schema, selectedSchema);
      setTimeout(() => {
        if (initialNodes) {
          // const layout = getLayoutElements(initialNodes, initialEdges, { direction: 'LR' })
          setNodes(initialNodes);
          setEdges(initialEdges);
          setRevision(false);
          typeof window !== "undefined" && window.requestAnimationFrame(() => {
            fitView();
          })
        }
      }, 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, revision])

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
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => {
              const layout = getLayoutElements(nodes, edges, { direction: 'LR' })
              setNodes(layout.nodes);
            }}
          // disabled={loading}
          >
            Vertical
          </Button>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => {
              const layout = getLayoutElements(nodes, edges, { direction: 'TB' })
              setNodes(layout.nodes);
            }}
          // disabled={loading}
          >
            Horizontal
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

export default function RelationalDiagramTab() {
  return (
    <ReactFlowProvider>
      <LayoutFlow />
    </ReactFlowProvider>
  )
}