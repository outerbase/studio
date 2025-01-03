import { DatabaseResultSet, SupportedDialect } from "@/drivers/base-driver";
import { useMemo } from "react";
import { z } from "zod";
import QueryExplanationDiagram from "./query-explanation-diagram";
import { convertSQLiteRowToMySQL } from "./query-explanation-diagram/build-query-explanation-flow";

interface QueryExplanationProps {
  data: DatabaseResultSet;
  dialect?: SupportedDialect;
}

export interface ExplanationRow {
  id: number;
  parent: number;
  notused: number;
  detail: string;
}

export type ExplanationRowWithChildren = ExplanationRow & {
  children: ExplanationRowWithChildren[];
};

const queryExplanationRowSchema = z.object({
  id: z.number(),
  parent: z.number(),
  notused: z.number(),
  detail: z.string(),
});

export function isExplainQueryPlan(sql: string, dialect: SupportedDialect) {
  if (!["sqlite", "mysql"].includes(dialect)) return false;

  if (sql.toLowerCase().startsWith("explain query plan")) {
    return true;
  }

  if (sql.toLowerCase().startsWith("explain format=json")) {
    return true;
  }

  if (sql.toLowerCase().startsWith("explain (format json)")) {
    return true;
  }

  return false;
}

function buildQueryExplanationTree(nodes: ExplanationRow[]) {
  const map: Record<number, ExplanationRowWithChildren> = {};
  const tree: ExplanationRowWithChildren[] = [];

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

function mapExplanationRows(props: QueryExplanationProps) {
  let isExplanationRows = null;

  if (props.dialect === "sqlite") {
    isExplanationRows = z.array(queryExplanationRowSchema).safeParse(
      props.data.rows.map((r) => ({
        ...r,
        id: Number(r.id),
        parent: Number(r.parent),
        notused: Number(r.notused),
      }))
    );
  }

  if (props.dialect === "mysql") {
    const row = (props.data.rows || [])[0];
    const explain = String(row.EXPLAIN);
    return {
      _tag: "SUCCESS",
      value: JSON.parse(explain),
    };
  }

  if (props.dialect === "postgres") {
    return {
      _tag: "SUCCESS" as const,
      value: "Postgres dialect is not supported yet",
    };
  }

  if (isExplanationRows?.error) {
    return { _tag: "ERROR" as const, value: isExplanationRows.error };
  }

  return {
    _tag: "SUCCESS" as const,
    value: buildQueryExplanationTree(isExplanationRows?.data || []),
  };
}

export function QueryExplanation(props: QueryExplanationProps) {
  const tree = useMemo(() => mapExplanationRows(props), [props]);

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

  let value = tree.value;

  if (props.dialect === "sqlite") {
    value = convertSQLiteRowToMySQL(
      props.data.rows as unknown as ExplanationRow[]
    );
  }

  return (
    <div className="p-5 font-mono h-full overflow-y-auto">
      {["mysql", "sqlite"].includes(props.dialect as string) ? (
        <QueryExplanationDiagram items={value} />
      ) : (
        <p className="text-destructive">{value}</p>
      )}
    </div>
  );
}
