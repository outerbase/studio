import isEmptyResultStats from "../lib/empty-stats";
import { MultipleQueryResult } from "../lib/multiple-query";
import ExportResultButton from "./export/export-result-button";
import ResultTable from "./query-result-table";
import ResultStats from "./result-stat";
import { useMemo } from "react";
import OptimizeTableState from "./table-optimized/OptimizeTableState";

export default function QueryResult({
  result,
}: {
  result: MultipleQueryResult;
}) {
  const data = useMemo(() => {
    const state = OptimizeTableState.createFromResult(result.result);
    state.setReadOnlyMode(true);
    return state;
  }, [result]);

  const stats = result.result.stat;

  return (
    <div className="flex flex-col h-full w-full border-t">
      <div className="grow overflow-hidden">
        <ResultTable data={data} />
      </div>
      {stats && !isEmptyResultStats(stats) && (
        <div className="shrink-0">
          <div className="flex p-1 border-t">
            <ResultStats stats={stats} />
            <div>
              <ExportResultButton data={data} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
