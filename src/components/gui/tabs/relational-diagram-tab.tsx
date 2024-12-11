import { DatabaseSchemaNode } from "@/components/database-schema-node";
import { useSchema } from "@/context/schema-provider";
import { DatabaseSchemas } from "@/drivers/base-driver";
import {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useState } from "react";
import { Toolbar } from "../toolbar";
import { Button } from "@/components/ui/button";
import { LucideRefreshCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import SchemaNameSelect from "../schema-editor/schema-name-select";
import Dagre from "@dagrejs/dagre";
import {
  AlignCenterHorizontalSimple,
  AlignCenterVerticalSimple,
} from "@phosphor-icons/react";
import { DownloadImageDiagram } from "../export/download-image-diagram";

function getLayoutElements(
  nodes: Node[],
  edges: Edge[],
  options: Dagre.GraphLabel
) {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph(options);

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    })
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;
      return { ...node, position: { x, y } };
    }),
    edges,
  };
}

function mapSchema(
  schema: DatabaseSchemas,
  selectedSchema: string
): { initialNodes: Node[]; initialEdges: Edge[] } {
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  for (const item of schema[selectedSchema]) {
    if (item.type !== "table") continue;

    const items: unknown[] = [];
    const relationship = schema[selectedSchema].filter((x) =>
      x.tableSchema?.columns
        .filter((c) => c.constraint?.foreignKey)
        .map((c) => c.constraint?.foreignKey?.foreignTableName)
        .includes(item.name)
    );

    for (const column of item.tableSchema?.columns || []) {
      let FK = !!column.constraint?.foreignKey;
      if (column.constraint && column.constraint.foreignKey) {
        initialEdges.push({
          id: `${item.name}-${column.constraint.foreignKey.foreignTableName}`,
          source: item.name,
          target: column.constraint.foreignKey.foreignTableName || "",
          sourceHandle: column.name,
          targetHandle: column.constraint.foreignKey.foreignColumns
            ? column.constraint.foreignKey.foreignColumns[0]
            : "",
          animated: true,
        });
      }

      for (const constraint of item.tableSchema?.constraints ?? []) {
        if (
          constraint.foreignKey &&
          constraint.foreignKey.foreignTableName !== item.name &&
          (constraint.foreignKey.foreignColumns ?? []).length === 1
        ) {

          if ((constraint.foreignKey.columns ?? []).includes(column.name)) {
            FK = true;
          }

          initialEdges.push({
            id: `${item.name}-${constraint.foreignKey.foreignTableName}`,
            source: item.name,
            target: constraint.foreignKey.foreignTableName || "",
            sourceHandle: constraint.foreignKey.columns
              ? constraint.foreignKey.columns[0]
              : "",
            targetHandle: constraint.foreignKey.foreignColumns
              ? constraint.foreignKey.foreignColumns[0]
              : "",
            animated: true,
          });
        }
      }

      items.push({
        title: column.name,
        type: column.type,
        pk: !!column.pk,
        fk: FK,
        unique: !!column.constraint?.unique,
      });
    }

    initialNodes.push({
      id: String(item.name),
      type: "databaseSchema",
      position: {
        x: relationship.length < 0 ? 200 : 0,
        y: relationship.length * 100,
      },
      measured: {
        width: 300,
        height: (item.tableSchema?.columns.length || 0) * 32 + 32,
      },
      data: {
        label: item.name,
        schema: items,
      },
    });
  }

  let initialNodesNoneRelationship = initialNodes.filter(x => !initialEdges.map(e => [e.source, e.target]).flat().includes(x.id)).sort((a, b) => (b.measured?.height || 0) - (a.measured?.height || 0));

  const layout = getLayoutElements([...initialNodes.filter(f => !initialNodesNoneRelationship.map(x => x.id).includes(f.id)), ...initialNodesNoneRelationship], initialEdges, {
    rankdir: "LR",
    marginx: 50,
    marginy: 50,
  });

  initialNodesNoneRelationship = layout.nodes.filter(x => !initialEdges.map(e => [e.source, e.target]).flat().includes(x.id));

  const maxHeight = initialNodesNoneRelationship.reduce((a, b) => a = a + (b.measured?.height || 0), 0);
  const squareRoot = Math.sqrt(300 * maxHeight);
  // check how many column in row 
  const cell = Math.ceil(squareRoot / 300);

  const topPosition = Math.max(...layout.nodes.map(x => x.position.x));
  const positionX = topPosition + 300
  const positionY = layout.nodes[layout.nodes.map(x => x.position.x).indexOf(topPosition)].position.y;

  const nodeBox: Node[][] = [...new Array(cell)].map((_, i) => [
    {
      ...initialNodesNoneRelationship[i],
      position: {
        x: positionX + (225 * i),
        y: positionY
      }
    }
  ])

  for (const node of initialNodesNoneRelationship) {
    const index = initialNodesNoneRelationship.findIndex(f => f.id === node.id);
    const items = nodeBox.map(x => x.map(m => (m.measured?.height || 0) + 25).reduce((a, b) => a = a + b, 0))
    const next = items.indexOf(Math.min(...items));
    if (index >= cell) {
      nodeBox[next].push({
        ...node,
        position: {
          x: nodeBox[next][0].position.x,
          y: positionY + items[next]
        }
      })
    }
  }

  const nodes = [...layout.nodes.filter(f => !initialNodesNoneRelationship.map(x => x.id).includes(f.id)), ...nodeBox.flat()];

  return {
    initialNodes: nodes,
    initialEdges: layout.edges,
  };
}

function LayoutFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { schema: initialSchema, currentSchemaName, refresh } = useSchema();
  const [schema] = useState(initialSchema);
  const [selectedSchema, setSelectedSchema] = useState(currentSchemaName);

  useEffect(() => {
    if (selectedSchema) {
      const { initialEdges, initialNodes } = mapSchema(schema, selectedSchema);
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [schema, selectedSchema, setNodes, setEdges]);

  const nodeTypes = {
    databaseSchema: DatabaseSchemaNode,
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((els) => addEdge(params, els)),
    [setEdges]
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
          <Button variant={"ghost"} size={"sm"} onClick={refresh}>
            <LucideRefreshCcw className="w-4 h-4 text-green-600" />
          </Button>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => {
              const layout = getLayoutElements(nodes, edges, {
                rankdir: "LR",
                marginx: 50,
                marginy: 50,
              });
              setNodes(layout.nodes);
            }}
          >
            <AlignCenterVerticalSimple size={15} />
          </Button>
          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => {
              const layout = getLayoutElements(nodes, edges, {
                rankdir: "TB",
                marginx: 50,
                marginy: 50,
              });
              setNodes(layout.nodes);
            }}
          >
            <AlignCenterHorizontalSimple size={15} />
          </Button>
          <div className="mx-1">
            <Separator orientation="vertical" />
          </div>
          <DownloadImageDiagram />
          <div className="mx-1">
            <Separator orientation="vertical" />
          </div>
          <SchemaNameSelect
            value={selectedSchema}
            onChange={(value) => {
              setSelectedSchema(value);
            }}
          />
        </Toolbar>
      </div>
      {
        selectedSchema && <div className="flex-1 relative overflow-hidden">
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
      }
    </div>
  );
}

export default function RelationalDiagramTab() {
  return (
    <ReactFlowProvider>
      <LayoutFlow />
    </ReactFlowProvider>
  );
}