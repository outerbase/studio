"use client";
import { produce } from "immer";
import { Dispatch, SetStateAction, useMemo } from "react";
import { MenuBar } from "../orbit/menu-bar";
import { Select } from "../orbit/select";
import { capitalizeFirstChar } from "./chart-background-selection";
import ChartSeries from "./chart-series";
import { ChartLabelDisplayY, ChartValue } from "./chart-type";
import SimpleInput from "./simple-input";

interface ChartYAxisSectionProps {
  value: ChartValue;
  onChange: Dispatch<SetStateAction<ChartValue>>;
  isNotChartComponent: boolean;
  columns: string[];
}

export default function ChartYAxisSection({
  value,
  onChange,
  isNotChartComponent,
  columns,
}: ChartYAxisSectionProps) {
  const selectYAxisDisplay = useMemo(() => {
    if (isNotChartComponent) return null;

    return (
      <div>
        <Select
          size="lg"
          options={[
            {
              value: "Left",
              label: "Left",
            },
            {
              value: "Right",
              label: "Right",
            },
            {
              value: "Hidden",
              label: "Hidden",
            },
          ]}
          setValue={function (value: string): void {
            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.params.options.yAxisLabelDisplay =
                  value.toLowerCase() as ChartLabelDisplayY;
              });
            });
          }}
          value={capitalizeFirstChar(
            value.params.options?.yAxisLabelDisplay ?? "left"
          )}
        />
      </div>
    );
  }, [isNotChartComponent, onChange, value.params.options?.yAxisLabelDisplay]);

  return (
    <div>
      <p className="mb-1.5 text-sm font-bold opacity-70">Y Axis</p>
      <div className="flex items-center justify-between gap-2">
        <SimpleInput
          value={value.params.options?.yAxisLabel}
          placeholder={
            value.params.options?.yAxisKeys?.length > 0
              ? value.params.options?.yAxisKeys[0]
              : "Y Axis Label"
          }
          onSumit={(v) => {
            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.params.options.yAxisLabel = v === "" ? undefined : v;
              });
            });
          }}
        />
        {selectYAxisDisplay}
        <MenuBar
          size="lg"
          value={value.params.options?.yAxisLabelHidden ? "hide" : "show"}
          onChange={(v) => {
            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.params.options.yAxisLabelHidden = v === "hide";
              });
            });
          }}
          items={[
            {
              value: "show",
              content: "Show",
            },
            {
              value: "hide",
              content: "Hide",
            },
          ]}
        />
      </div>
      <ChartSeries
        value={value}
        onChange={function (value: SetStateAction<ChartValue>): void {
          onChange(value);
        }}
        isNotChartComponent={isNotChartComponent}
        columns={columns}
      ></ChartSeries>
    </div>
  );
}
