"use client";
import { produce } from "immer";
import { Dispatch, SetStateAction, useMemo } from "react";
import ChartSeries from "./chart-series";
import { ChartLabelDisplayY, ChartValue } from "./chart-type";
import { SimpleCombobox } from "./simple-combobox";
import SimpleInput from "./simple-input";
import SimpleToggle from "./simple-toggle";

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
  if (isNotChartComponent) return null;

  const selectYAxisDisplay = useMemo(() => {
    if (isNotChartComponent) return null;
    const yAxisSideValues = [
      {
        value: "left",
        label: "Left",
      },
      {
        value: "right",
        label: "Right",
      },
      {
        value: "hidden",
        label: "Hidden",
      },
    ];
    return (
      <div>
        <SimpleCombobox
          hideArrow={true}
          values={yAxisSideValues}
          selected={value.params.options?.yAxisLabelDisplay ?? "left"}
          placeholder="Select display..."
          onChange={function (v: string): void {
            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.params.options.yAxisLabelDisplay =
                  v as ChartLabelDisplayY;
              });
            });
          }}
        ></SimpleCombobox>
      </div>
    );
  }, [isNotChartComponent, onChange, value.params.options?.yAxisLabelDisplay]);

  return (
    <div>
      <p className="mb-1.5 text-sm font-bold opacity-70">Y Axis</p>
      <div className="flex items-center justify-between gap-2">
        <SimpleInput
          value={value.params.options?.yAxisLabel}
          placeholder={value.params.options?.yAxisKeys[0] ?? "Y Axis Label"}
          onSumit={(v) => {
            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.params.options.yAxisLabel = v;
              });
            });
          }}
        />
        {selectYAxisDisplay}

        <SimpleToggle
          values={["Show", "Hide"]}
          onChange={(v) => {
            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.params.options.yAxisLabelHidden = v === "Hide";
              });
            });
          }}
          selectedValue={
            value.params.options?.yAxisLabelHidden ? "Hide" : "Show"
          }
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
