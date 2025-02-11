import { BoardSourceDriver } from "@/drivers/board-source/base-source";
import { useEffect, useState } from "react";
import { ChartValue } from "../chart/chart-type";
import { BoardCanvas } from "./board-canvas";
import BoardChartEditor from "./board-chart-editor";
import { BoardFilter } from "./board-filter";
import { BoardFilterProps } from "./board-filter-dialog";
import { BoardProvider } from "./board-provider";

export interface DashboardProps {
  charts: ChartValue[];
  layout: ReactGridLayout.Layout[];
  name: string;
  data: {
    filters: BoardFilterProps[];
  };
}

export type BoardEditorMode = "ADD_CHART" | "REARRANGING_CHART" | null;

interface Props {
  value: DashboardProps;
  sources?: BoardSourceDriver;
  interval: number;
  onChange: (value: DashboardProps) => void;
  onChangeInterval: (v: number) => void;
  onLayoutSave: () => void;
  onLayoutCancel: () => void;
  onRemove: (key: string) => void;
  onAddChart: (value: ChartValue) => Promise<ChartValue | undefined>;
}

export default function Board({
  value,
  sources,
  interval,
  onChange,
  onChangeInterval,
  onLayoutCancel,
  onLayoutSave,
  onRemove,
  onAddChart,
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

  return (
    <BoardProvider
      sources={sources}
      lastRunTimestamp={lastRunTimestamp}
      setting={{ autoRefresh, name: value.name }}
      setBoardMode={setEditMode}
      onAddChart={onAddChart}
      onLayoutSave={onLayoutSave}
      onLayoutRemove={onRemove}
      value={value}
    >
      <div className="relative flex flex-1 flex-col">
        <BoardFilter
          value={value}
          onChange={onChange}
          editMode={editMode}
          onChangeEditMode={setEditMode}
          interval={interval}
          onChangeInterval={onChangeInterval}
          onRefresh={() => {
            setLastRunTimestamp(Date.now());
          }}
          onCancel={() => {
            setEditMode(null);
            onLayoutCancel();
          }}
        />
        <div className="relative flex-1">
          <BoardCanvas
            value={value}
            onChange={(v) => {
              onChange({
                ...value,
                layout: v,
              });
            }}
            editMode={editMode}
            setEditMode={setEditMode}
          />
        </div>

        {editMode === "ADD_CHART" && (
          <div className="bg-background fixed top-14 bottom-0 left-0 z-50 flex w-screen">
            <BoardChartEditor onChange={onChange} />
          </div>
        )}

        {editMode === "ADD_CHART" && (
          <div className="bg-background fixed top-14 bottom-0 left-0 z-50 flex w-screen">
            <BoardChartEditor onChange={onChange} />
          </div>
        )}
      </div>
    </BoardProvider>
  );
}
