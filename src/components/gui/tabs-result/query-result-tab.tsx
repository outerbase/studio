import { useMemo } from "react";
import { MultipleQueryResult } from "../../lib/multiple-query";
import ExportResultButton from "../export/export-result-button";
import ResultTable from "../query-result-table";
import ResultStats from "../result-stat";
import OptimizeTableState from "../table-optimized/OptimizeTableState";
import { useDatabaseDriver } from "@/context/driver-provider";
import AggregateResultButton from "../aggregate-result/aggregate-result-button";

export default function QueryResult({
  result,
}: {
  result: MultipleQueryResult;
}) {
  const { databaseDriver } = useDatabaseDriver();

  const data = useMemo(() => {
    const state = OptimizeTableState.createFromResult(
      databaseDriver,
      result.result
    );
    state.setReadOnlyMode(true);

    return state;
  }, [result, databaseDriver]);

  const stats = result.result.stat;

  return (
    <div className="flex flex-col h-full w-full border-t">
      <div className="grow overflow-hidden">
        <ResultTable data={data} />
      </div>
      {stats && (
        <div className="flex justify-between border-t shrink-0">
          <div className="flex p-1 ">
            <ResultStats stats={stats} />
            <div>
              <ExportResultButton data={data} />
            </div>
          </div>
          <div className="p-1 pr-3">
            <AggregateResultButton data={data} />
          </div>
        </div>
      )}
    </div>
  );
}
