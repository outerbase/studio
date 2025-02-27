import { fillVariables, SupportedDialect } from "@outerbase/sdk-transform";
import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "../chart";
import { ChartValue } from "../chart/chart-type";
import { useBoardContext } from "./board-provider";
import BoardSqlErrorLog from "./board-sql-error-log";

export default function BoardChart({ value }: { value: ChartValue }) {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { sources, lastRunTimestamp, resolvedFilterValue } = useBoardContext();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sql = value ? ((value?.params?.layers ?? [])[0]?.sql ?? "") : "";
  const sourceId = value?.source_id;

  const finalSql = useMemo(() => {
    return fillVariables(
      sql,
      resolvedFilterValue,
      (sources?.sourceList().find((s) => s.id === sourceId)?.type ??
        "sqlite") as unknown as SupportedDialect
    );
  }, [sql, sources, sourceId, resolvedFilterValue]);

  useEffect(() => {
    if (!sources || !sourceId || !finalSql) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    sources
      .query(sourceId, finalSql)
      .then((v) => {
        setData(v.rows);
      })
      .catch((e) => {
        setErrorMessage(e.toString());
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sources, sourceId, finalSql, lastRunTimestamp, loaderRef]);

  useEffect(() => {
    if (loaderRef.current && loading) {
      const interval = setInterval(() => {
        if (loaderRef.current) {
          const progress = Math.min(
            ((Date.now() - lastRunTimestamp) / 3000) * 100,
            80
          );

          loaderRef.current.style.width = `${progress}%`;
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [lastRunTimestamp, loading, loaderRef]);

  return (
    <>
      {loading && (
        <div
          key={lastRunTimestamp}
          className="absolute top-0 right-0 left-0 z-10 h-[3px]"
        >
          <div
            ref={loaderRef}
            key={lastRunTimestamp}
            className="h-[3px] w-[0%] bg-blue-400 transition-all"
          ></div>
        </div>
      )}
      {data && !errorMessage && (
        <Chart className="h-full w-full" value={value} data={data} />
      )}
      {errorMessage && <BoardSqlErrorLog value={errorMessage} />}
    </>
  );
}
