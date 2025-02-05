"use client";
import { ChartBar } from "@phosphor-icons/react/dist/icons/ChartBar";
import { ChartLine } from "@phosphor-icons/react/dist/icons/ChartLine";
import { ChartPieSlice } from "@phosphor-icons/react/dist/icons/ChartPieSlice";
import { ChartPolar } from "@phosphor-icons/react/dist/icons/ChartPolar";
import { ChartScatter } from "@phosphor-icons/react/dist/icons/ChartScatter";
import { Funnel } from "@phosphor-icons/react/dist/icons/Funnel";
import { NumberCircleOne } from "@phosphor-icons/react/dist/icons/NumberCircleOne";
import { Table } from "@phosphor-icons/react/dist/icons/Table";
import { TextT } from "@phosphor-icons/react/dist/icons/TextT";
import { ChartBarHorizontal } from "@phosphor-icons/react/dist/ssr";
import { useMemo } from "react";
import {
  ChartLabelDisplayY,
  ChartValue,
  SingleValueFormat,
} from "./chart-type";
import { ChartTypeButton } from "./chart-type-button";
import { SimpleCombobox } from "./simple-combobox";
import SimpleInput from "./simple-input";
import SimpleToggle from "./simple-toggle";

interface EditChartMenuProps {
  value: ChartValue;
  setValue: (value: ChartValue) => void;
}

export default function EditChartMenu({ value, setValue }: EditChartMenuProps) {
  const isNotChartComponent = ["text", "single_value", "table"].includes(
    value.type
  );

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
            setValue({
              ...value,
              params: {
                ...value.params,
                options: {
                  ...value.params.options,
                  yAxisLabelDisplay: v as ChartLabelDisplayY,
                },
              },
            });
          }}
        ></SimpleCombobox>
      </div>
    );
  }, [isNotChartComponent, setValue, value]);

  const selectAxisKey = useMemo(() => {
    if (isNotChartComponent) return null;
    const allKeys = [
      value.params.options?.xAxisKey,
      ...(value.params.options?.yAxisKeys ?? []),
    ];
    return (
      <div>
        <p className="mb-1.5 text-sm font-bold opacity-70">Select X Axis</p>
        <SimpleCombobox
          values={
            allKeys.map((key) => {
              return {
                value: key,
                label: key,
              };
            }) ?? []
          }
          selected={value.params.options?.xAxisKey ?? ""}
          placeholder="Select axis key..."
          onChange={function (v: string): void {
            setValue({
              ...value,
              params: {
                ...value.params,
                options: {
                  ...value.params.options,
                  xAxisKey: v,
                  yAxisKeys: allKeys.filter((key) => key !== v),
                },
              },
            });
          }}
        ></SimpleCombobox>
      </div>
    );
  }, [isNotChartComponent, setValue, value]);

  const yAxisLabelSection = useMemo(() => {
    if (isNotChartComponent) return null;
    return (
      <div>
        <p className="mb-1.5 text-sm font-bold opacity-70">Y Axis Label</p>
        <div className="flex items-center justify-between gap-2">
          <SimpleInput
            value={value.params.options?.yAxisLabel}
            placeholder={value.params.options?.yAxisKeys[0] ?? "Y Axis Label"}
            onSumit={(v) => {
              setValue({
                ...value,
                params: {
                  ...value.params,
                  options: {
                    ...value.params.options,
                    yAxisLabel: v,
                  },
                },
              });
            }}
          />

          <SimpleToggle
            values={["Show", "Hide"]}
            onChange={(v) => {
              setValue({
                ...value,
                params: {
                  ...value.params,
                  options: {
                    ...value.params.options,
                    yAxisLabelHidden: v === "Hide",
                  },
                },
              });
            }}
            selectedValue={
              value.params.options?.yAxisLabelHidden ? "Hide" : "Show"
            }
          />
          {selectYAxisDisplay}
        </div>
      </div>
    );
  }, [isNotChartComponent, selectYAxisDisplay, setValue, value]);

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
              setValue({
                ...value,
                params: {
                  ...value.params,
                  options: {
                    ...value.params.options,
                    xAxisLabel: v,
                  },
                },
              });
            }}
          />

          <SimpleToggle
            values={["Show", "Hide"]}
            onChange={(v) => {
              setValue({
                ...value,
                params: {
                  ...value.params,
                  options: {
                    ...value.params.options,
                    xAxisLabelHidden: v === "Hide",
                  },
                },
              });
            }}
            selectedValue={
              value.params.options?.xAxisLabelHidden ? "Hide" : "Show"
            }
          />
        </div>
      </div>
    );
  }, [isNotChartComponent, setValue, value]);

  const dataFormatSection = useMemo(() => {
    if (value.type !== "single_value") return null;
    const dataFormatValues = [
      {
        value: "none",
        label: "None",
      },
      {
        value: "percent",
        label: "Percent",
      },
      {
        value: "number",
        label: "Number",
      },
      {
        value: "decimal",
        label: "Decimal",
      },
      {
        value: "date",
        label: "Date",
      },
      {
        value: "time",
        label: "Time",
      },
      {
        value: "dollar",
        label: "Dollar",
      },
      {
        value: "euro",
        label: "Euro",
      },
      {
        value: "pound",
        label: "Pound",
      },
      {
        value: "yen",
        label: "Yen",
      },
    ];
    return (
      <div>
        <p className="mb-1.5 text-sm font-bold opacity-70">Data Format</p>
        <SimpleCombobox
          values={dataFormatValues}
          selected={value.params.options?.format ?? "none"}
          placeholder="Select format..."
          onChange={function (v: string): void {
            setValue({
              ...value,
              params: {
                ...value.params,
                options: {
                  ...value.params.options,
                  format: v === "none" ? undefined : (v as SingleValueFormat),
                },
              },
            });
          }}
        ></SimpleCombobox>
      </div>
    );
  }, [setValue, value]);

  const textSection = useMemo(() => {
    if (value.type !== "text") return null;
    return (
      <div>
        <p className="mb-1.5 text-sm font-bold opacity-70">Text</p>
        <textarea
          className="h-[200px] w-full rounded-md border p-2"
          onChange={(v) =>
            setValue({
              ...value,
              params: {
                ...value.params,
                options: { ...value.params.options, text: v.target.value },
              },
            })
          }
        />
      </div>
    );
  }, [setValue, value]);

  const textColorSection = useMemo(() => {
    if (value.type !== "text") return null;
    const textColorValues = [
      {
        value: "Automatic",
        label: "Automatic",
      },
      {
        value: "White",
        label: "White",
      },
      {
        value: "Black",
        label: "Black",
      },
    ];
    return (
      <div>
        <p className="mb-1.5 pt-2 text-sm font-bold opacity-70">Text Color</p>
        <SimpleCombobox
          values={textColorValues}
          selected={value.params.options?.foreground ?? "Automatic"}
          placeholder="Select color..."
          onChange={function (v: string): void {
            setValue({
              ...value,
              params: {
                ...value.params,
                options: { ...value.params.options, foreground: v },
              },
            });
          }}
        ></SimpleCombobox>
      </div>
    );
  }, [setValue, value]);

  return (
    <div className="flex w-full flex-col gap-5 p-1 pb-4">
      <section key={1}>
        <p className="mb-1.5 text-sm font-bold opacity-70">Type</p>
        <div className="grid grid-cols-6 gap-2">
          <ChartTypeButton
            icon={<ChartLine />}
            isActive={value.type === "line"}
            onClick={() => {
              setValue({ ...value, type: "line" });
            }}
            tooltipText="Line"
          />
          <ChartTypeButton
            icon={<ChartBar />}
            isActive={value.type === "column"}
            onClick={() => {
              setValue({ ...value, type: "column" });
            }}
            tooltipText="Column"
          />
          <ChartTypeButton
            icon={<ChartBarHorizontal />}
            isActive={value.type === "bar"}
            onClick={() => {
              setValue({ ...value, type: "bar" });
            }}
            tooltipText="Bar"
          />
          <ChartTypeButton
            icon={<ChartScatter />}
            isActive={value.type === "scatter"}
            onClick={() => {
              setValue({ ...value, type: "scatter" });
            }}
            tooltipText="scatter"
          />
          <ChartTypeButton
            icon={<TextT />}
            isActive={value.type === "text"}
            onClick={() => {
              setValue({ ...value, type: "text" });
            }}
            tooltipText="Text"
          />
          <ChartTypeButton
            icon={<NumberCircleOne weight="bold" />}
            isActive={value.type === "single_value"}
            onClick={() => {
              setValue({ ...value, type: "single_value" });
            }}
            tooltipText="Single Value"
          />
          <ChartTypeButton
            icon={<Table />}
            isActive={value.type === "table"}
            onClick={() => {
              setValue({ ...value, type: "table" });
            }}
            tooltipText="Table"
          />
          <ChartTypeButton
            icon={<ChartPieSlice weight="bold" />}
            isActive={value.type === "pie"}
            onClick={() => {
              setValue({ ...value, type: "pie" });
            }}
            tooltipText="Pie"
          />
          <ChartTypeButton
            icon={<ChartPolar />}
            isActive={value.type === "radar"}
            onClick={() => {
              setValue({ ...value, type: "radar" });
            }}
            tooltipText="Radar"
          />
          <ChartTypeButton
            icon={<Funnel />}
            isActive={value.type === "funnel"}
            onClick={() => {
              setValue({ ...value, type: "funnel" });
            }}
            tooltipText="Funnel"
          />
        </div>
      </section>

      {textSection}
      {textColorSection}
      {dataFormatSection}
      {xAxisLabelSection}
      {selectAxisKey}
      {yAxisLabelSection}
    </div>
  );
}
