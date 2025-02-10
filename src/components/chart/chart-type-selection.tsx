import {
  ChartBarHorizontal,
  ChartPieSlice,
  NumberCircleOne,
  TextT,
} from "@phosphor-icons/react";
import { ChartBar } from "@phosphor-icons/react/dist/icons/ChartBar";
import { ChartPolar } from "@phosphor-icons/react/dist/icons/ChartPolar";
import { Funnel } from "@phosphor-icons/react/dist/icons/Funnel";
import { produce } from "immer";
import { ChartLine, ChartScatter, Table } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { ChartValue } from "./chart-type";
import { ChartTypeButton } from "./chart-type-button";

interface ChartTypeSelectionProps {
  value: ChartValue;
  onChange: Dispatch<SetStateAction<ChartValue>>;
}

export default function ChartTypeSelection({
  value,
  onChange,
}: ChartTypeSelectionProps) {
  return (
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
  );
}
