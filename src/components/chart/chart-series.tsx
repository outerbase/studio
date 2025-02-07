import { produce } from "immer";
import { Dispatch, SetStateAction } from "react";
import { ButtonGroupItem } from "../button-group";
import { ChartSeriesCombobox } from "./chart-series-combobox";
import { ChartValue } from "./chart-type";

interface ChartSeriesProps {
  value: ChartValue;
  onChange: Dispatch<SetStateAction<ChartValue>>;
  isNotChartComponent: boolean;
  columns: string[];
}

export default function ChartSeries({
  value,
  onChange,
  isNotChartComponent,
  columns,
}: ChartSeriesProps) {
  if (isNotChartComponent) return null;

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between pb-2">
        <p className="mb-1.5 text-sm font-bold opacity-70">Series</p>
        <ButtonGroupItem
          onClick={() => {
            if (value.params.options?.yAxisKeys.length === columns.length)
              return;

            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.params.options.yAxisKeys.push(
                  columns.filter(
                    (key) => !draft.params.options.yAxisKeys.includes(key)
                  )[0]
                );
              });
            });
          }}
        >
          <p className="text-xs">Add Series</p>
        </ButtonGroupItem>
      </div>

      <div className="flex flex-col gap-2">
        {value.params.options?.yAxisKeys?.map((key, index) => {
          const color = value.params.options?.yAxisKeyColors
            ? value.params.options?.yAxisKeyColors[key]
            : undefined;
          return (
            <ChartSeriesCombobox
              color={color}
              key={index}
              values={
                columns.map((s) => {
                  return {
                    value: s,
                    label: s,
                  };
                }) ?? []
              }
              selected={key ?? ""}
              placeholder="Select axis key..."
              onChange={function (v: string): void {
                onChange((prev) => {
                  return produce(prev, (draft) => {
                    draft.params.options.yAxisKeys[index] = v;
                  });
                });
              }}
              onRemove={(series) => {
                onChange((prev) => {
                  return produce(prev, (draft) => {
                    if (!series) {
                      draft.params.options.yAxisKeys = [];
                    } else {
                      draft.params.options.yAxisKeys =
                        draft.params.options.yAxisKeys.filter(
                          (k) => k !== series
                        );
                    }
                  });
                });
              }}
              onChangeColor={function (color: string): void {
                onChange((prev) => {
                  return produce(prev, (draft) => {
                    draft.params.options.yAxisKeyColors = {
                      ...draft.params.options.yAxisKeyColors,
                      [key]: color,
                    };
                  });
                });
              }}
            ></ChartSeriesCombobox>
          );
        })}
      </div>
    </div>
  );
}
