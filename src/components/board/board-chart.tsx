import { useEffect, useState } from "react";
import Chart, { ChartValue } from "../chart";
import { useBoardContext } from "./board-provider";

export default function BoardChart({ value }: { value: ChartValue }) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const { sources } = useBoardContext();

  const sql = value.params.layers[0].sql;
  const sourceId = value.source_id;

  useEffect(() => {
    if (!sources || !sourceId || !sql) {
      return;
    }

    sources
      .query(sourceId, sql)
      .then((v) => {
        setData(v);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [sources, sourceId, sql]);

  if (value.type !== "line") return null;

  return <Chart className="h-full w-full" value={value} data={data} />;
}
