import { Edge, NodeProps, Node, MarkerType, Position } from "@xyflow/react";
import Dagre from "@dagrejs/dagre";

interface ExplanationMysqlTable {
  id: string;
  table_name: string;
  cost_info: {
    query_cost: number;
    prefix_cost: number;
  };
  rows_produced_per_join: string;
}

interface ExplanationMysqlGroupOperation {
  id: string;
  cost_info: {
    query_cost: number;
    prefix_cost: number;
  };
  nested_loop: { table: ExplanationMysqlTable }[];
  table: ExplanationMysqlTable;
}

export interface ExplanationMysql {
  query_block: {
    id: string;
    cost_info: {
      query_cost: number;
      prefix_cost: number;
    };
    ordering_operation?: {
      id: string;
      cost_info: {
        query_cost: number;
        prefix_cost: number;
      };
      nested_loop: { table: ExplanationMysqlTable }[];
      table: ExplanationMysqlTable;
      grouping_operation?: ExplanationMysqlGroupOperation;
    };
    grouping_operation?: ExplanationMysqlGroupOperation;
    table?: ExplanationMysqlTable;
    nested_loop?: { table: ExplanationMysqlTable }[];
  };
}

export interface ExplainNodeProps extends NodeProps {
  data: {
    id: string;
    cost_info: {
      query_cost: number;
      prefix_cost: number;
      read_cost: number;
      eval_cost: number;
    };
    key: string;
    select_id: number;
    label: string;
    target?: string;
    rows_examined_per_scan: string;
    rows_produced_per_join: string;
    access_type: string;
    table_name: string;
    using_filesort: boolean;
    using_temporary_table: boolean;
  };
}

const dagreGraph = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const nodeWidth = 172;
const nodeHeight = 36;
const position = { x: 0, y: 0 };

export function formatCost(cost: number) {
  return parseFloat(String(cost)).toLocaleString("en-US", {
    maximumFractionDigits: 2,
    notation: "compact",
    compactDisplay: "short",
  });
}

function getLayoutedExplanationElements(
  nodes: Node[],
  edges: Edge[],
  direction = "TB"
) {
  const isHorizontal = direction === "LR";

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.measured?.width || nodeWidth,
      height: node.measured?.height || nodeHeight,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  Dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - (node.measured?.width || nodeWidth) / 2,
        y: nodeWithPosition.y - (node.measured?.height || nodeHeight) / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
}

export function buildQueryExplanationFlow(item: ExplanationMysql) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  // Keep all tables
  const nodesTables = new Set();
  const edgesTable = new Set();
  let keyNestedloopAndTableShouldConnected = "query_block";

  let table = item.query_block.table || null;
  const ordering_operation = item.query_block.ordering_operation || null;
  const group_operation =
    item.query_block.grouping_operation ||
    item.query_block.ordering_operation?.grouping_operation ||
    null;
  let nested_loop = item.query_block.nested_loop || [];

  if (item.query_block) {
    nodes.push({
      id: "query_block",
      data: { ...item.query_block },
      type: "QUERY_BLOCK",
      position,
    });
  }

  if (ordering_operation && group_operation) {
    keyNestedloopAndTableShouldConnected = "group_operation";
    nested_loop =
      item.query_block.ordering_operation?.grouping_operation?.nested_loop ||
      [];
    table =
      item.query_block.ordering_operation?.grouping_operation?.table || null;
    nodes.push({
      id: "ordering_operation",
      data: { ...item.query_block.ordering_operation },
      type: "ORDERING_OPERATION",
      position,
      measured: {
        width: 100,
      },
    });
    nodes.push({
      id: "group_operation",
      data: { ...item.query_block.ordering_operation?.grouping_operation },
      type: "GROUP_OPERATION",
      position,
      measured: {
        width: 100,
      },
    });
    edges.push({
      id: `query_block-ordering_operation`,
      target: "query_block",
      source: "ordering_operation",
      targetHandle: "query_block",
      sourceHandle: "ordering_operation",
      type: "smoothstep",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
      },
      style: {
        strokeWidth: 2,
      },
      animated: true,
    });
    edges.push({
      id: `ordering_operation-group_operation`,
      target: "ordering_operation",
      source: "group_operation",
      targetHandle: "ordering_operation",
      sourceHandle: "group_operation",
      type: "smoothstep",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
      },
      style: {
        strokeWidth: 2,
      },
      animated: true,
    });
  }

  if (ordering_operation && !group_operation) {
    keyNestedloopAndTableShouldConnected = "ordering_operation";
    nested_loop = item.query_block.ordering_operation?.nested_loop || [];
    table = item.query_block.ordering_operation?.table || null;
    nodes.push({
      id: "ordering_operation",
      data: { ...item.query_block.ordering_operation },
      type: "ORDERING_OPERATION",
      position,
      measured: {
        width: 100,
      },
    });
    edges.push({
      id: `query_block-ordering_operation`,
      target: "query_block",
      source: "ordering_operation",
      targetHandle: "query_block",
      sourceHandle: "ordering_operation",
      type: "smoothstep",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
      },
      style: {
        strokeWidth: 2,
      },
      animated: true,
    });
  }

  if (!ordering_operation && group_operation) {
    keyNestedloopAndTableShouldConnected = "group_operation";
    nested_loop = item.query_block.grouping_operation?.nested_loop || [];
    table = item.query_block.grouping_operation?.table || null;
    nodes.push({
      id: "group_operation",
      data: { ...item.query_block.grouping_operation },
      type: "GROUP_OPERATION",
      position,
      measured: {
        width: 100,
      },
    });
    edges.push({
      id: `query_block-group_operation`,
      target: "query_block",
      source: "group_operation",
      targetHandle: "query_block",
      sourceHandle: "group_operation",
      type: "smoothstep",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
      },
      style: {
        strokeWidth: 2,
      },
      animated: true,
    });
  }

  const nested_reverse = (nested_loop || []).reverse();

  if (table) {
    nodes.push({
      id: table.table_name,
      data: { ...table },
      type: "TABLE",
      position,
    });

    edges.push({
      id: `${keyNestedloopAndTableShouldConnected}-${table.table_name}`,
      target: keyNestedloopAndTableShouldConnected,
      source: table.table_name,
      targetHandle: keyNestedloopAndTableShouldConnected,
      sourceHandle: "right",
      type: "smoothstep",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
      },
      style: {
        strokeWidth: 2,
      },
      animated: true,
    });

    return getLayoutedExplanationElements(nodes, edges, "LR");
  }

  if (!table && nested_reverse.length > 0) {
    for (const [index, value] of nested_reverse.entries()) {
      nodes.push({
        id: "nested_loop_" + index,
        data: {
          label: "nested loop",
          cost_info: {
            prefix_cost: value.table.cost_info.prefix_cost,
          },
          target: `nested_loop_${index}-${value.table.table_name}`,
          rows_produced_per_join: value.table.rows_produced_per_join,
        },
        type: "NESTED_LOOP",
        position,
        measured: {
          width: 100,
          height: 50,
        },
      });
      edges.push({
        id:
          index === 0
            ? `${keyNestedloopAndTableShouldConnected}-nested_loop_0`
            : `nested_loop_${index - 1}-nested_loop_${index}`,
        target:
          index === 0
            ? keyNestedloopAndTableShouldConnected
            : "nested_loop_" + (index - 1),
        source: index === 0 ? "nested_loop_0" : "nested_loop_" + index,
        targetHandle:
          index === 0 ? keyNestedloopAndTableShouldConnected : "left",
        sourceHandle: index === 0 ? "nested_loop_0" : "nested_loop_" + index,
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
        },
        style: {
          strokeWidth: 2,
        },
        animated: true,
        label: formatCost(Number(value.table.rows_produced_per_join)) + " rows",
        labelShowBg: false,
        labelStyle: {
          fill: "#AAAAAA",
          color: "#AAAAAA",
          transform: "translate(-5%, -5%)",
        },
      });
    }

    const layout = getLayoutedExplanationElements(nodes, edges, "LR");

    for (const [index, value] of nested_reverse.entries()) {
      const key = index === nested_reverse.length - 1 ? index - 1 : index;
      const nested = layout.nodes.find((f) => f.id === `nested_loop_${index}`);
      nodesTables.add({
        id: value.table.table_name,
        data: {
          ...value.table,
        },
        type: "TABLE",
        position: {
          x: (nested?.position.x || 0) + 50,
          y: (nested?.position.y || 0) + (nested?.measured?.height || 0) + 100,
        },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      });
      edgesTable.add({
        id: `nested_loop_${key}-${value.table.table_name}`,
        target: "nested_loop_" + key,
        source: value.table.table_name,
        targetHandle: index === nested_reverse.length - 1 ? "left" : "bottom",
        sourceHandle: value.table.table_name,
        type: "smoothstep",
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
        },
        style: {
          strokeWidth: 2,
        },
        animated: true,
      });
    }
    return {
      nodes: [
        ...layout.nodes.filter((_, i) => i < layout.nodes.length - 1),
        ...nodesTables,
      ],
      edges: [...layout.edges, ...edgesTable],
    };
  }

  return {
    nodes: [],
    edges: [],
  };
}
