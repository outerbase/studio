import isEmptyResultStats from "../lib/empty-stats";
import { MultipleQueryResult } from "../lib/multiple-query";
import ExportResultButton from "./export/export-result-button";
import ResultTable from "./query-result-table";
import ResultStats from "./result-stat";
import { useMemo } from "react";
import OptimizeTableState from "./table-optimized/OptimizeTableState";
import { QueryExplanation, isExplainQueryPlan } from "./query-explain";

export default function QueryResult({
  result,
}: {
  result: MultipleQueryResult;
}) {
  const data = useMemo(() => {
    if (isExplainQueryPlan(result.sql)) {
      return { _tag: "EXPLAIN", value: result.result } as const;
    }

    const state = OptimizeTableState.createFromResult(result.result);
    state.setReadOnlyMode(true);
    return { _tag: "QUERY", value: state } as const;
  }, [result]);

  const stats = result.result.stat;

  return (
    <div className="flex flex-col h-full w-full border-t">
      <div className="grow overflow-hidden">
        {data._tag === "QUERY" ? (
          <ResultTable data={data.value} />
        ) : (
          <QueryExplanation data={data.value} />
        )}
      </div>
      {stats && !isEmptyResultStats(stats) && (
        <div className="shrink-0">
          <div className="flex p-1 border-t">
            <ResultStats stats={stats} />

            {data._tag === "QUERY" && (
              <div>
                <ExportResultButton data={data.value} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
