import { BoardSourceDriver } from "@/drivers/board-source/base-source";
import { useEffect, useState } from "react";
import { ChartValue } from "../chart/chart-type";
import { BoardCanvas } from "./board-canvas";
import { BoardFilter } from "./board-filter";
import { BoardFilterProps } from "./board-filter-dialog";
import { BoardProvider } from "./board-provider";

export interface BoardData {
  filters: any[];
  version: number;
  isWorkspaceScoped: boolean;
}

export interface BoardLayout {
  w: number;
  h: number;
  x: number;
  y: number;
  i: string;
}

export interface BoardRoot {
  base_id: any;
  chart_ids: string[];
  data: BoardData;
  directory_index: number;
  layout: BoardLayout[];
  name: string;
  type: string;
}

export interface DashboardProps {
  charts: ChartValue[];
  layout: ReactGridLayout.Layout[];
  name: string;
  data: {
    filters: BoardFilterProps[];
  };
}

interface Props {
  value: DashboardProps;
  sources?: BoardSourceDriver;
  interval: number;
  onChange: (value: DashboardProps) => void;
  onChangeInterval: (v: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function Board({
  value,
  sources,
  interval,
  onChange,
  onChangeInterval,
  onCancel,
  onSave,
}: Props) {
  const [editMode, setEditMode] = useState<
    "ADD_CHART" | "REARRANGING_CHART" | null
  >(null);

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
    >
      <div>
        <BoardFilter
          filters={value.data.filters}
          onFilters={(v) =>
            onChange({
              ...value,
              data: {
                ...value.data,
                filters: v,
              },
            })
          }
          editMode={editMode}
          onChangeEditMode={setEditMode}
          interval={interval}
          onChangeInterval={onChangeInterval}
          onRefresh={() => {
            setLastRunTimestamp(Date.now());
          }}
          onCancel={() => {
            setEditMode(null);
            onCancel();
          }}
          onSave={onSave}
        />
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
    </BoardProvider>
  );
}
