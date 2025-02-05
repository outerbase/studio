import { useEffect, useRef, useState } from "react";
import Chart from "../chart";
import { ChartValue } from "../chart/chart-type";
import { useBoardContext } from "./board-provider";

export default function BoardChart({ value }: { value: ChartValue }) {
  const [data, setData] = useState<Record<string, unknown>[] | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { sources, lastRunTimestamp } = useBoardContext();
  const [loading, setLoading] = useState(false);

  const sql = value.params.layers[0].sql;
  const sourceId = value.source_id;

  useEffect(() => {
    if (!sources || !sourceId || !sql) {
      return;
    }

    setLoading(true);

    sources
      .query(sourceId, sql)
      .then((v) => {
        setData(v);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sources, sourceId, sql, lastRunTimestamp, loaderRef]);

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
      {data ? (
        <Chart className="h-full w-full" value={value} data={data} />
      ) : null}
    </>
  );
}
