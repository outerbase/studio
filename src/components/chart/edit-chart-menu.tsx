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
import { produce } from "immer";
import { Dispatch, SetStateAction, useMemo } from "react";
import ChartBackgroundSelection from "./chart-background-selection";
import {
  ChartData,
  ChartLabelDisplayY,
  ChartValue,
  SingleValueFormat,
} from "./chart-type";
import { ChartTypeButton } from "./chart-type-button";
import ChartYAxisSection from "./chart-y-axis-section";
import { SimpleCombobox } from "./simple-combobox";
import SimpleInput from "./simple-input";
import SimpleToggle from "./simple-toggle";

interface EditChartMenuProps {
  value: ChartValue;
  data: ChartData[];
  onChange: Dispatch<SetStateAction<ChartValue>>;
}

export default function EditChartMenu({
  value,
  onChange,
  data,
}: EditChartMenuProps) {
  const isNotChartComponent = ["text", "single_value", "table"].includes(
    value.type
  );

  const allAxisKeys = Object.keys(data[0] ?? {});

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
            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.params.options.xAxisKey = v;
              });
            });
          }}
        ></SimpleCombobox>
      </div>
    );
  }, [
    allAxisKeys,
    isNotChartComponent,
    onChange,
    value.params.options?.xAxisKey,
  ]);

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
                  draft.params.options.xAxisLabel = v;
                });
              });
            }}
          />

          <SimpleToggle
            values={["Show", "Hide"]}
            onChange={(v) => {
              onChange((prev) => {
                return produce(prev, (draft) => {
                  draft.params.options.xAxisLabelHidden = v === "Hide";
                });
              });
            }}
            selectedValue={
              value.params.options?.xAxisLabelHidden ? "Hide" : "Show"
            }
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
            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.params.options.format = v as SingleValueFormat;
              });
            });
          }}
        ></SimpleCombobox>
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
  }, [onChange, value.type]);

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

    return (
      <div>
        <p className="mb-1.5 pt-2 text-sm font-bold opacity-70">Text Color</p>
        <SimpleCombobox
          values={textColorValues}
          selected={value.params.options?.foreground ?? "Automatic"}
          placeholder="Select color..."
          onChange={function (v: string): void {
            onChange((prev) => {
              return produce(prev, (draft) => {
                draft.params.options.foreground =
                  v === "Automatic" ? undefined : v;
              });
            });
          }}
        ></SimpleCombobox>
      </div>
    );
  }, [onChange, value.params.options?.foreground]);

  return (
    <div className="flex w-full flex-col gap-5 p-1 pb-4">
      <section key={1}>
        <p className="mb-1.5 text-sm font-bold opacity-70">Chart Type</p>
        <div className="grid grid-cols-6 gap-2">
          <ChartTypeButton
            icon={<ChartLine />}
            isActive={value.type === "line"}
            onClick={() => {
              onChange((prev) => {
                return produce(prev, (draft) => {
                  draft.type = "line";
                });
              });
            }}
            tooltipText="Line"
          />
          <ChartTypeButton
            icon={<ChartBar />}
            isActive={value.type === "column"}
            onClick={() => {
              onChange((prev) => {
                return produce(prev, (draft) => {
                  draft.type = "column";
                });
              });
            }}
            tooltipText="Column"
          />
          <ChartTypeButton
            icon={<ChartBarHorizontal />}
            isActive={value.type === "bar"}
            onClick={() => {
              onChange((prev) => {
                return produce(prev, (draft) => {
                  draft.type = "bar";
                });
              });
            }}
            tooltipText="Bar"
          />
          <ChartTypeButton
            icon={<ChartScatter />}
            isActive={value.type === "scatter"}
            onClick={() => {
              onChange((prev) => {
                return produce(prev, (draft) => {
                  draft.type = "scatter";
                });
              });
            }}
            tooltipText="scatter"
          />
          <ChartTypeButton
            icon={<TextT />}
            isActive={value.type === "text"}
            onClick={() => {
              onChange((prev) => {
                return produce(prev, (draft) => {
                  draft.type = "text";
                });
              });
            }}
            tooltipText="Text"
          />
          <ChartTypeButton
            icon={<NumberCircleOne weight="bold" />}
            isActive={value.type === "single_value"}
            onClick={() => {
              onChange((prev) => {
                return produce(prev, (draft) => {
                  draft.type = "single_value";
                });
              });
            }}
            tooltipText="Single Value"
          />
          <ChartTypeButton
            icon={<Table />}
            isActive={value.type === "table"}
            onClick={() => {
              onChange((prev) => {
                return produce(prev, (draft) => {
                  draft.type = "table";
                });
              });
            }}
            tooltipText="Table"
          />
          <ChartTypeButton
            icon={<ChartPieSlice weight="bold" />}
            isActive={value.type === "pie"}
            onClick={() => {
              onChange((prev) => {
                return produce(prev, (draft) => {
                  draft.type = "pie";
                });
              });
            }}
            tooltipText="Pie"
          />
          <ChartTypeButton
            icon={<ChartPolar />}
            isActive={value.type === "radar"}
            onClick={() => {
              onChange((prev) => {
                return produce(prev, (draft) => {
                  draft.type = "radar";
                });
              });
            }}
            tooltipText="Radar"
          />
          <ChartTypeButton
            icon={<Funnel />}
            isActive={value.type === "funnel"}
            onClick={() => {
              onChange((prev) => {
                return produce(prev, (draft) => {
                  draft.type = "funnel";
                });
              });
            }}
            tooltipText="Funnel"
          />
        </div>
      </section>

      {textSection}
      {dataFormatSection}
      {xAxisLabelSection}
      {selectAxisKey}
      <ChartYAxisSection
        value={value}
        onChange={function (value: SetStateAction<ChartValue>): void {
          onChange(value);
        }}
        isNotChartComponent={false}
        columns={allAxisKeys}
      ></ChartYAxisSection>
      {textColorSection}
      <ChartBackgroundSelection value={value} setValue={onChange} />
    </div>
  );
}
