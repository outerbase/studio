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
import { ChartTypeButton } from "./chart-type-button";
import { ChartValue } from "./chartTypes";

interface EditChartMenuProps {
  value: ChartValue;
  setValue: (value: ChartValue) => void;
}

export default function EditChartMenu({ value, setValue }: EditChartMenuProps) {
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

      {value.type === "text" && (
        <div>
          <p className="mb-1.5 text-sm font-bold opacity-70">Text</p>
          <textarea className="h-[200px] w-full rounded-md border p-2" />
        </div>
      )}
    </div>
  );
}
