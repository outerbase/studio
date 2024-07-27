import { DatabaseResultSet } from "@/drivers/base-driver";
import { useMemo } from "react";
import { z } from "zod";

export interface QueryExplanationProps {
  data: DatabaseResultSet;
}

export interface ExplainRow {
  id: number;
  parent: number;
  notused: number;
  detail: string;
}

export type ExplainRowWithChildren = ExplainRow & {
  children?: ExplainRowWithChildren[];
};

const queryExplanationRowSchema = z.object({
  id: z.number(),
  parent: z.number(),
  notused: z.number(),
  detail: z.string(),
});

export function isExplainQueryPlan(sql: string) {
  return sql.toLowerCase().startsWith("explain query plan");
}

function buildQueryExplanationTree(nodes: ExplainRow[]) {
  const map: Record<number, ExplainRow & { children: ExplainRow[] }> = {};
  const tree: ExplainRowWithChildren[] = [];

  nodes.forEach((node) => {
    map[node.id] = { ...node, children: [] };
  });

  nodes.forEach((node) => {
    if (node.parent === 0) {
      tree.push(map[node.id]);
    } else {
      map[node.parent].children.push(map[node.id]);
    }
  });

  return tree;
}

export function QueryExplanation(props: QueryExplanationProps) {
  const tree = useMemo(() => {
    const isExplanationRows = z
      .array(queryExplanationRowSchema)
      .safeParse(props.data.rows);

    if (isExplanationRows.error) {
      return { _tag: "ERROR" as const, value: isExplanationRows.error };
    }

    return {
      _tag: "SUCCESS" as const,
      value: buildQueryExplanationTree(isExplanationRows.data),
    };
  }, [props.data]);

  const treeDom = useMemo(() => {
    if (tree._tag === "ERROR") return null;

    return tree.value.map((node) => (
      <li key={`query-explanation-p-${node.parent}-${node.id}`}>
        <RenderQueryExplanationItem item={node} />
      </li>
    ));
  }, [tree]);

  if (tree._tag === "ERROR") {
    // The row structure doesn't match the explanation structure
    return (
      <div>
        <p className="text-destructive">
          Something went wrong while trying to display the explanation!
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 font-mono h-full overflow-y-auto">
      <ul>{treeDom}</ul>
    </div>
  );
}

function RenderQueryExplanationItem(props: { item: ExplainRowWithChildren }) {
  return (
    <div key={props.item.id} className="[--circle-width:16px]">
      <div className="py-1 flex items-center gap-x-4">
        <span className="size-[--circle-width] bg-gray-200 rounded-full" />
        <p className="py-1.5">{props.item.detail}</p>
      </div>

      {props.item.children && (
        <ul className="ml-7">
          {props.item.children.map((child) => {
            return (
              <li
                className="relative"
                key={`query-explanation-p-${child.parent}- ${child.id}`}
              >
                <span className="absolute left-[calc(var(--circle-width)/2)] -translate-x-1/2 z-[-1] h-full border-l-2 border-gray-200" />
                <RenderQueryExplanationItem key={child.id} item={child} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
