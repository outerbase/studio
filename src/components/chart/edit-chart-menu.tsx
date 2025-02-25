"use client";
import { produce } from "immer";
import { useTheme } from "next-themes";
import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { Label } from "../orbit/label";
import { MenuBar } from "../orbit/menu-bar";
import { Select } from "../orbit/select";
import ChartBackgroundSelection, {
  capitalizeFirstChar,
} from "./chart-background-selection";
import { ChartValue, SingleValueFormat, THEMES } from "./chart-type";
import ChartTypeSelection from "./chart-type-selection";
import ChartYAxisSection from "./chart-y-axis-section";
import { generateGradientColors } from "./echart-options-builder";
import SimpleInput from "./simple-input";

interface EditChartMenuProps {
  value: ChartValue;
  columns: string[];
  onChange: Dispatch<SetStateAction<ChartValue>>;
}

export default function EditChartMenu({
  value,
  onChange,
  columns,
}: EditChartMenuProps) {
  const { forcedTheme, resolvedTheme } = useTheme();
  const isNotChartComponent = ["text", "single_value", "table"].includes(
    value.type ?? "line"
  );

  // Add default yAxisKeyColors
  useEffect(() => {
    if (!value.params.options.yAxisKeyColors && columns?.length > 0) {
      const appTheme: "light" | "dark" = (forcedTheme || resolvedTheme) as
        | "light"
        | "dark";
      const themeColor = THEMES.neonPunk.colors?.[appTheme ?? "light"];
      const colors = generateGradientColors(
        themeColor[0],
        themeColor[1],
        columns.length
      );

      onChange((prev) => {
        const newColors = columns.reduce(
          (acc, col, i) => {
            acc[col] = colors[i];
            return acc;
          },
          {} as Record<string, string>
        );
        return produce(prev, (draft) => {
          draft.params.options.yAxisKeyColors = newColors;
        });
      });
    }
  }, [
    columns,
    forcedTheme,
    onChange,
    resolvedTheme,
    value.params.options.yAxisKeyColors,
  ]);

  // add default yAxisKeys and xAxisKey
  useEffect(() => {
    const allColumns = columns ?? [];
    if (!value.params.options.xAxisKey && columns?.length > 0) {
      onChange((prev) => {
        return produce(prev, (draft) => {
          draft.params.options.xAxisKey = allColumns.pop();
        });
      });
    }

    if (!value.params.options.yAxisKeys && columns?.length > 0) {
      onChange((prev) => {
        return produce(prev, (draft) => {
          draft.params.options.yAxisKeys = allColumns;
        });
      });
    }
  }, [
    columns,
    onChange,
    value.params.options.xAxisKey,
    value.params.options.yAxisKeys,
  ]);

  const selectAxisKey = useMemo(() => {
    if (isNotChartComponent) return null;

    return (
      <div>
        <p className="mb-1.5 text-sm font-bold opacity-70">X Axis Value</p>
        <Select
          size="lg"
          className="w-full"
          options={columns.map((col) => ({
            value: col,
            label: col,
          }))}
          value={value.params.options?.xAxisKey ?? ""}
          setValue={function (value: string): void {
            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.params.options.xAxisKey = value;
              });
            });
          }}
        />
      </div>
    );
  }, [columns, isNotChartComponent, onChange, value.params.options?.xAxisKey]);

  const xAxisLabelSection = useMemo(() => {
    if (isNotChartComponent) return null;
    return (
      <div>
        <p className="mb-1.5 text-sm font-bold opacity-70">X Axis Label</p>
        <div className="flex items-center justify-between gap-2">
          <SimpleInput
            value={value.params.options?.xAxisLabel}
            placeholder={value.params.options?.xAxisKey ?? "X Axis Label"}
            onSumit={(v) => {
              onChange((prev) => {
                return produce(prev, (draft) => {
                  draft.params.options.xAxisLabel = v === "" ? undefined : v;
                });
              });
            }}
          />

          <MenuBar
            size="lg"
            value={value.params.options?.xAxisLabelHidden ? "hide" : "show"}
            onChange={(v) => {
              onChange((prev) => {
                return produce(prev, (draft) => {
                  draft.params.options.xAxisLabelHidden = v === "hide";
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
      </div>
    );
  }, [
    isNotChartComponent,
    onChange,
    value.params.options?.xAxisKey,
    value.params.options?.xAxisLabel,
    value.params.options?.xAxisLabelHidden,
  ]);

  const dataFormatSection = useMemo(() => {
    if (value.type !== "single_value") return null;

    return (
      <div>
        <p className="mb-1.5 text-sm font-bold opacity-70">Data Format</p>
        <Select
          className="w-full"
          size="lg"
          options={[
            { value: "None", label: "None" },
            { value: "Percent", label: "Percent" },
            { value: "Number", label: "Number" },
            { value: "Decimal", label: "Decimal" },
            { value: "Date", label: "Date" },
            { value: "Time", label: "Time" },
            { value: "Dollar", label: "Dollar" },
            { value: "Euro", label: "Euro" },
            { value: "Pound", label: "Pound" },
            { value: "Yen", label: "Yen" },
          ]}
          setValue={function (value: string): void {
            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.params.options.format =
                  value.toLowerCase() as SingleValueFormat;
              });
            });
          }}
          value={capitalizeFirstChar(value.params.options?.format ?? "none")}
        />
      </div>
    );
  }, [onChange, value.params.options?.format, value.type]);

  const textSection = useMemo(() => {
    if (value.type !== "text") return null;
    return (
      <div>
        <p className="mb-1.5 text-sm font-bold opacity-70">Text</p>
        <textarea
          className="h-[200px] w-full rounded-md border p-2"
          value={value.params.options.text}
          onChange={(v) =>
            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.params.options.text = v.target.value;
              });
            })
          }
        />
      </div>
    );
  }, [onChange, value.params.options.text, value.type]);

  const textColorSection = useMemo(() => {
    return (
      <div>
        <p className="mb-1.5 pt-2 text-sm font-bold opacity-70">Text Color</p>
        <Select
          className="w-full"
          size="lg"
          options={[
            { value: "Automatic", label: "Automatic" },
            { value: "White", label: "White" },
            { value: "Black", label: "Black" },
          ]}
          setValue={function (value: string): void {
            onChange((prev) => {
              return produce(prev, (draft) => {
                if (value === "Automatic") {
                  delete draft.params.options.foreground;
                } else if (value === "White") {
                  draft.params.options.foreground = "#ffffff";
                } else if (value === "Black") {
                  draft.params.options.foreground = "#000000";
                }
              });
            });
          }}
          value={
            value.params.options?.foreground === "#000000"
              ? "Black"
              : value.params.options?.foreground === "#ffffff"
                ? "White"
                : "Automatic"
          }
        />
      </div>
    );
  }, [onChange, value.params.options?.foreground]);

  return (
    <div className="flex w-full flex-col gap-4 p-1 pb-4">
      <Label title="Chart Title">
        <SimpleInput
          value={value.name}
          onSumit={function (v: string): void {
            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.name = v;
                draft.params.name = v;
              });
            });
          }}
        />
      </Label>

      <ChartTypeSelection
        value={value}
        onChange={function (value: SetStateAction<ChartValue>): void {
          onChange(value);
        }}
      />
      {textSection}
      {dataFormatSection}
      {xAxisLabelSection}
      {selectAxisKey}
      {!isNotChartComponent && (
        <ChartYAxisSection
          value={value}
          onChange={function (value: SetStateAction<ChartValue>): void {
            onChange(value);
          }}
          isNotChartComponent={false}
          columns={columns}
        />
      )}

      {textColorSection}
      <ChartBackgroundSelection value={value} setValue={onChange} />
    </div>
  );
}
