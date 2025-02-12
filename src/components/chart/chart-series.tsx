import { produce } from "immer";
import { useTheme } from "next-themes";
import { Dispatch, SetStateAction } from "react";
import { ButtonGroupItem } from "../button-group";
import { ChartSeriesCombobox } from "./chart-series-combobox";
import { ChartValue, ThemeColors, THEMES } from "./chart-type";
import { generateGradientColors } from "./echart-options-builder";

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
  const { forcedTheme, resolvedTheme } = useTheme();
  if (isNotChartComponent) return null;

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between pb-2">
        <p className="mb-1.5 text-sm font-bold opacity-70">Series</p>
        <ButtonGroupItem
          onClick={() => {
            if (!value.params.options?.yAxisKeys) return;
            if (value.params.options?.yAxisKeys.length === columns.length)
              return;

            onChange((prev) => {
              return produce(prev, (draft) => {
                if (!draft.params.options.yAxisKeys) return;
                draft.params.options.yAxisKeys.push(
                  columns.filter(
                    (key) => !draft.params.options.yAxisKeys?.includes(key)
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
                    if (!draft.params.options.yAxisKeys) return;
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
                        draft.params.options.yAxisKeys?.filter(
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
                    draft.params.options.theme = undefined;
                  });
                });
              }}
              onThemeChange={function (theme: ThemeColors): void {
                onChange((prev) => {
                  const appTheme: "light" | "dark" = (forcedTheme ||
                    resolvedTheme) as "light" | "dark";
                  const themeColor =
                    THEMES[theme].colors?.[appTheme ?? "light"];
                  const colors = generateGradientColors(
                    themeColor[0],
                    themeColor[1],
                    columns.length
                  );
                  const newColors = columns?.reduce(
                    (acc, col, i) => {
                      acc[col] = colors[i];
                      return acc;
                    },
                    {} as Record<string, string>
                  );
                  return produce(prev, (draft) => {
                    draft.params.options.theme = theme;
                    draft.params.options.yAxisKeyColors = newColors;
                  });
                });
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
