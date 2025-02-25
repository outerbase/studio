import { BoardSourceDriver } from "@/drivers/board-source/base-source";
import { IBoardStorageDriver } from "@/drivers/board-storage/base";
import { useEffect, useMemo, useState } from "react";
import { ChartValue } from "../chart/chart-type";
import { BoardCanvas } from "./board-canvas";
import BoardChartEditor from "./board-chart-editor";
import { BoardFilter } from "./board-filter";
import { BoardFilterProps } from "./board-filter-dialog";
import { BoardProvider } from "./board-provider";
import { BoardTool } from "./board-tool/board-tool";

export interface DashboardProps {
  charts: ChartValue[];
  layout: ReactGridLayout.Layout[];
  name: string;
  data: {
    filters: BoardFilterProps[];
  };
}

export type BoardEditorMode = {
  mode: "ADD_CHART" | "REARRANGING_CHART";
  chart?: ChartValue;
} | null;

interface Props {
  value: DashboardProps;
  filterValue: Record<string, string>;
  onFilterValueChange?: (value: Record<string, string>) => void;
  sources?: BoardSourceDriver;
  storage?: IBoardStorageDriver;
  interval: number;
  onChange: (value: DashboardProps) => void;
  onChangeInterval: (v: number) => void;
}

export default function Board({
  value,
  sources,
  storage,
  interval,
  onChange,
  onChangeInterval,
  filterValue,
  onFilterValueChange,
}: Props) {
  const [editMode, setEditMode] = useState<BoardEditorMode>(null);

  const autoRefresh = [
    "5s",
    "10s",
    "30s",
    "1m",
    "5m",
    "15m",
    "30m",
    "1h",
    "2h",
    "1d",
  ];

  const [lastRunTimestamp, setLastRunTimestamp] = useState(() => {
    return Date.now();
  });

  useEffect(() => {
    if (!interval) return;

    const intervalId = setInterval(() => {
      setLastRunTimestamp(Date.now());
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [interval]);

  const resolvedFilterValue = useMemo(() => {
    const tmp = structuredClone(filterValue);

    value.data.filters.forEach((f) => {
      if (!tmp[f.name]) {
        tmp[f.name] = f.defaultValue;
      }
    });

    return tmp;
  }, [value, filterValue]);

  return (
    <BoardProvider
      filterValue={filterValue}
      sources={sources}
      storage={storage}
      onChange={onChange}
      lastRunTimestamp={lastRunTimestamp}
      setting={{ autoRefresh, name: value.name }}
      setBoardMode={setEditMode}
      boardMode={editMode}
      value={value}
      resolvedFilterValue={resolvedFilterValue}
      onFilterValueChange={onFilterValueChange}
    >
      <div className="relative h-auto min-h-screen w-full">
        <BoardFilter
          value={value}
          onChange={onChange}
          interval={interval}
          onChangeInterval={onChangeInterval}
          onRefresh={() => {
            setLastRunTimestamp(Date.now());
          }}
          onCancel={() => {
            setEditMode(null);
          }}
        />
        <BoardCanvas
          value={value}
          onChange={(v) => {
            onChange({
              ...value,
              layout: v,
            });
          }}
        />
        {editMode?.mode === "ADD_CHART" && (
          <>
            <div className="fixed top-0 left-0 z-50 h-full w-full backdrop-blur-sm"></div>
            <div className="bg-background fixed top-[5%] right-[5%] bottom-[5%] left-[5%] z-50 flex overflow-hidden rounded-lg border-2">
              <BoardChartEditor
                onChange={onChange}
                initialValue={editMode?.chart}
              />
            </div>
          </>
        )}

        {editMode?.mode === "ADD_CHART" && (
          <>
            <div className="fixed top-0 left-0 z-50 h-full w-full backdrop-blur-sm"></div>
            <div className="bg-background fixed top-[5%] right-[5%] bottom-[5%] left-[5%] z-50 flex overflow-hidden rounded-lg border-2">
              <BoardChartEditor
                onChange={onChange}
                initialValue={editMode?.chart}
              />
            </div>
          </>
        )}
      </div>
      <BoardTool />
    </BoardProvider>
  );
}
