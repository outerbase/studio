import { useStudioContext } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import { MultipleQueryResult } from "@/lib/sql/multiple-query";
import { useMemo, useState } from "react";
import AggregateResultButton from "../aggregate-result/aggregate-result-button";
import ExportResultButton from "../export/export-result-button";
import ResultTable from "../query-result-table";
import ResultStats from "../result-stat";
import { createTableStateFromResult } from "../table-result/helper";

export default function QueryResult({
  result,
}: {
  result: MultipleQueryResult;
}) {
  const { databaseDriver } = useStudioContext();
  const { schema } = useSchema();

  // We cache the schema to prevent re-initial
  // the state when schema changes and lost all the
  // changes in the table
  const [cachedSchemas] = useState(schema);

  const data = useMemo(() => {
    const state = createTableStateFromResult({
      driver: databaseDriver,
      result: result.result,
      schemas: cachedSchemas,
    });

    state.setReadOnlyMode(true);
    state.setSql(result.sql);
    return state;
  }, [result, databaseDriver, cachedSchemas]);

  const stats = result.result.stat;

  return (
    <div className="flex h-full w-full flex-col border-t">
      <div className="grow overflow-hidden">
        <ResultTable data={data} />
      </div>
      {stats && (
        <div className="flex shrink-0 justify-between border-t">
          <div className="flex p-1">
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
