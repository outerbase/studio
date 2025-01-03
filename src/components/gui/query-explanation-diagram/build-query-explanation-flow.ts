import { Edge, NodeProps, Node, MarkerType, Position } from "@xyflow/react";
import Dagre from "@dagrejs/dagre";
import { ExplanationRow } from "../query-explanation";

interface ExplanationMysqlTable {
  id: string;
  table_name: string;
  cost_info: {
    query_cost: number;
    prefix_cost: number;
  };
  rows_produced_per_join: string;
  lable?: string | null;
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
    union_result?: {
      query_specifications: { query_block: ExplanationMysql }[];
    };
    select_id: number;
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

function parseDetailLiteToMysql(detail: string) {
  let table = null;
  let type = null;
  let extra = null;
  let key = null;

  if (detail.includes("SCAN")) {
    table = detail.match(/SCAN (\w+)/)?.[1] || null;
    type = "ALL"; // Full table scan
  } else if (detail.includes("SEARCH")) {
    table = detail.match(/SEARCH (\w+)/)?.[1] || null;
    extra = detail.match(/\((.+)\)/)?.[1] || null;
    key = detail.match(/USING (\w+) (\w+)/)?.[2] || null;
    type = "range"; // Range-based search
  } else if (detail.includes("USING INDEX")) {
    extra = "Using index";
  }

  return { table, type, extra, key };
}

export function convertSQLiteRowToMySQL(
  rows: ExplanationRow[]
): ExplanationMysql {
  const haveUnion = rows.some((row) => row.detail.includes("UNION"));
  const tables: { table: ExplanationMysqlTable }[] = [];
  const cost_info = {
    prefix_cost: 0,
    query_cost: 0,
  };
  const query_specifications: { query_block: ExplanationMysql }[] = [];

  if (haveUnion) {
    const main_query_block = rows.find((r) => r.parent === 0);
    const query_blocks = rows.filter((r) => r.parent === main_query_block?.id);
    for (const block of query_blocks) {
      const blockRows = rows.filter((r) => r.parent === block.id);
      const convert = convertSQLiteRowToMySQL(blockRows);
      (query_specifications as unknown[]).push({
        query_block: {
          select_id: Number(block.id || 0),
          cost_info,
          id: block.id,
          table: convert.query_block.table,
          nested_loop: convert.query_block.nested_loop,
          label: block.detail,
        },
      });
    }
  }

  for (const row of rows) {
    const parsedDetail = parseDetailLiteToMysql(row.detail);
    if (parsedDetail.table) {
      const table = {
        table: {
          id: String(row.id || ""),
          table_name: parsedDetail.table || "",
          cost_info: {
            prefix_cost: 0,
            query_cost: 0,
            read_cost: 0,
            eval_cost: 0,
          },
          rows_produced_per_join: "0",
          rows_examined_per_scan: "0",
          access_type: parsedDetail.type,
          key: parsedDetail.key,
          lable: parsedDetail.extra,
        },
      };
      tables.push(table);
    }
  }

  if (haveUnion) {
    return {
      query_block: {
        select_id: 1,
        cost_info,
        id: "query_info",
        union_result: {
          query_specifications,
        },
      },
    };
  }

  return {
    query_block: {
      select_id: 1,
      cost_info: {
        prefix_cost: 0,
        query_cost: 0,
      },
      id: "query_info",
      table:
        tables.length === 1
          ? {
              ...tables[0].table,
            }
          : undefined,
      nested_loop: tables.length > 1 ? tables : undefined,
    },
  };
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

export function buildQueryExplanationFlow(item: ExplanationMysql, id?: number) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  // Keep all tables
  const nodesTables = new Set();
  const edgesTable = new Set();
  let keyNestedloopAndTableShouldConnected = `query_block${id ? `-${id}` : ""}`;

  let table = item.query_block.table || null;
  const ordering_operation = item.query_block.ordering_operation || null;
  const group_operation =
    item.query_block.grouping_operation ||
    item.query_block.ordering_operation?.grouping_operation ||
    null;
  const union_result = item.query_block?.union_result || null;
  let nested_loop = item.query_block.nested_loop || [];

  if (item.query_block) {
    nodes.push({
      id: `query_block${id ? `-${id}` : ""}`,
      data: { ...item.query_block },
      type: "QUERY_BLOCK",
      position,
    });
    if (id) {
      edges.push({
        id: `union_result-query_block${id ? `-${id}` : ""}`,
        target: "union_result",
        source: `query_block-${id}`,
        targetHandle: "union_result",
        sourceHandle: `query_block-${id}`,
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
      position: position,
      measured: {
        width: 100,
      },
    });
    nodes.push({
      id: "group_operation",
      data: { ...item.query_block.ordering_operation?.grouping_operation },
      type: "GROUP_OPERATION",
      position: position,
      measured: {
        width: 100,
      },
    });
    edges.push({
      id: `query_block${id ? `-${id}` : ""}-ordering_operation`,
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
      position: position,
      measured: {
        width: 100,
      },
    });
    edges.push({
      id: `query_block${id ? `-${id}` : ""}-ordering_operation`,
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
      position: position,
      measured: {
        width: 100,
      },
    });
    edges.push({
      id: `query_block${id ? `-${id}` : ""}-group_operation`,
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

  if (union_result) {
    const union_flow: any[] = [];
    nodes.push({
      id: "query_block",
      data: {
        ...item.query_block,
        cost_info: {
          query_cost: 0,
        },
      },
      type: "QUERY_BLOCK",
      position: {
        x: 300,
        y: -100,
      },
    });
    nodes.push({
      id: "union_result",
      data: { label: "UNION" },
      type: "UNION_RESULT",
      position: {
        x: 150,
        y: -100,
      },
    });
    edges.push({
      id: "query_block-union_result",
      target: "query_block",
      source: "union_result",
      targetHandle: "query_block",
      sourceHandle: "union_result",
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
    for (const union of union_result.query_specifications) {
      const unionNodeEdge: {
        nodes: Node[] | unknown[];
        edges: Edge[] | unknown[];
      } = buildQueryExplanationFlow(
        union as unknown as ExplanationMysql,
        (union as unknown as ExplanationMysql).query_block.select_id || 0
      );
      union_flow.push(unionNodeEdge);
    }

    const layout = getLayoutedExplanationElements(
      [...nodes, ...union_flow.map((x) => x.nodes).flat()],
      [...edges, ...union_flow.map((x) => x.edges).flat()],
      "LR"
    );

    return {
      nodes: layout.nodes.map((node) => {
        return {
          ...node,
          position: {
            ...node.position,
            x: node.position.x,
          },
        };
      }),
      edges: layout.edges,
    };
  }

  const nested_reverse = (nested_loop || []).reverse();

  if (table) {
    nodes.push({
      id: `${table.table_name}${id}`,
      data: { ...table },
      type: "TABLE",
      position: position,
    });

    edges.push({
      id: `${keyNestedloopAndTableShouldConnected}-${table.table_name}${id}`,
      target: keyNestedloopAndTableShouldConnected,
      source: `${table.table_name}${id}`,
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
        position: position,
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
        label:
          value.table.rows_produced_per_join === "0"
            ? ""
            : formatCost(Number(value.table.rows_produced_per_join)) + " rows",
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
        id: `${value.table.table_name}${id}`,
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
        id: `nested_loop_${key}-${value.table.table_name}${id}`,
        target: "nested_loop_" + key,
        source: `${value.table.table_name}${id}`,
        targetHandle:
          index === nested_reverse.length - 1 || id ? "left" : "bottom",
        sourceHandle: id ? "right" : `${value.table.table_name}${id}`,
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
        label: value.table.lable ? value.table.lable : "",
        labelShowBg: false,
        labelStyle: {
          fill: "#AAAAAA",
          color: "#AAAAAA",
          transform: "translate(-5%, -5%)",
        },
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
