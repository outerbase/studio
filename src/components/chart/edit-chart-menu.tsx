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
import { ButtonGroupItem } from "../button-group";
import { ChartSeriesCombobox } from "./chart-series-combobox";
import {
  ChartData,
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
  data: ChartData[];
  setValue: (value: ChartValue) => void;
}

export default function EditChartMenu({
  value,
  setValue,
  data,
}: EditChartMenuProps) {
  const isNotChartComponent = ["text", "single_value", "table"].includes(
    value.type
  );

  const allAxisKeys = Object.keys(data[0] ?? {});

  const seriesList = useMemo(() => {
    if (isNotChartComponent) return null;

    return (
      <div className="pt-4">
        <div className="flex items-center justify-between pb-2">
          <p className="mb-1.5 text-sm font-bold opacity-70">Series</p>
          <ButtonGroupItem
            onClick={() => {
              if (value.params.options?.yAxisKeys.length === allAxisKeys.length)
                return;
              setValue({
                ...value,
                params: {
                  ...value.params,
                  options: {
                    ...value.params.options,
                    yAxisKeys: [
                      ...(value.params.options?.yAxisKeys ?? []),
                      allAxisKeys.filter(
                        (key) => !value.params.options?.yAxisKeys?.includes(key)
                      )[0],
                    ],
                  },
                },
              });
            }}
          >
            <p className="text-xs">Add Series</p>
          </ButtonGroupItem>
        </div>

        <div className="flex flex-col gap-2">
          {value.params.options?.yAxisKeys?.map((key, index) => {
            return (
              <ChartSeriesCombobox
                key={index}
                values={
                  allAxisKeys.map((s) => {
                    return {
                      value: s,
                      label: s,
                    };
                  }) ?? []
                }
                selected={key ?? ""}
                placeholder="Select axis key..."
                onChange={function (v: string): void {
                  setValue({
                    ...value,
                    params: {
                      ...value.params,
                      options: {
                        ...value.params.options,
                        yAxisKeys: (() => {
                          const yAxisKeys =
                            value.params.options?.yAxisKeys ?? [];
                          yAxisKeys[index] = v;
                          return yAxisKeys;
                        })(),
                      },
                    },
                  });
                }}
                onRemove={(series) => {
                  setValue({
                    ...value,
                    params: {
                      ...value.params,
                      options: {
                        ...value.params.options,
                        yAxisKeys: (() => {
                          if (series === null) return [];
                          return (value.params.options?.yAxisKeys ?? []).filter(
                            (k) => k !== series
                          );
                        })(),
                      },
                    },
                  });
                }}
              ></ChartSeriesCombobox>
            );
          })}
        </div>
      </div>
    );
  }, [allAxisKeys, isNotChartComponent, setValue, value]);

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

    return (
      <div>
        <p className="mb-1.5 text-sm font-bold opacity-70">X Axis Value</p>
        <SimpleCombobox
          values={
            allAxisKeys.map((key) => {
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
                },
              },
            });
          }}
        ></SimpleCombobox>
      </div>
    );
  }, [allAxisKeys, isNotChartComponent, setValue, value]);

  const yAxisLabelSection = useMemo(() => {
    if (isNotChartComponent) return null;
    return (
      <div>
        <p className="mb-1.5 text-sm font-bold opacity-70">Y Axis</p>
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
          {selectYAxisDisplay}

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
        </div>
        {seriesList}
      </div>
    );
  }, [isNotChartComponent, selectYAxisDisplay, seriesList, setValue, value]);

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
    const textColorValues = [
      {
        value: "Automatic",
        label: "Automatic",
      },
      {
        value: "#ffffff",
        label: "White",
      },
      {
        value: "#000000",
        label: "Black",
      },
    ];

    console.log(value.params.options?.foreground);
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
                options: {
                  ...value.params.options,
                  foreground: v === "Automatic" ? undefined : v,
                },
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
      {dataFormatSection}
      {xAxisLabelSection}
      {selectAxisKey}
      {yAxisLabelSection}
      {textColorSection}
    </div>
  );
}
