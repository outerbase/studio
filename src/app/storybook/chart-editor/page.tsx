/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Chart from "@/components/chart";
import { ChartData, ChartValue } from "@/components/chart/chart-type";
import EditChartMenu from "@/components/chart/edit-chart-menu";
import { useState } from "react";

const data: ChartData[] = [
  {
    seller: 49,
    seller2: 1049,
    seller3: 2049,
    seller4: 3049,
    _year: 2019,
  },
  {
    seller: 590,
    seller2: 1590,
    seller3: 2590,
    seller4: 3590,
    _year: 2020,
  },
  {
    seller: 7908,
    seller2: 8908,
    seller3: 9908,
    seller4: 10908,
    _year: 2021,
  },
  {
    seller: 4985,
    seller2: 5985,
    seller3: 6985,
    seller4: 7985,
    _year: 2022,
  },
  {
    seller: 2638,
    seller2: 3638,
    seller3: 4638,
    seller4: 5638,
    _year: 2023,
  },
  {
    seller: 4,
    seller2: 1004,
    seller3: 2004,
    seller4: 3004,
    _year: 2024,
  },
];

const lineChartValue: ChartValue = {
  suggestedChartType: [],
  connection_id: null,
  id: "94019f17-a1e0-4db2-b89e-4457cbed3ce4",
  model: "chart",
  name: "New Chart",
  params: {
    id: "94019f17-a1e0-4db2-b89e-4457cbed3ce4",
    name: "New Chart",
    type: "line",
    model: "chart",
    apiKey: "",
    layers: [
      {
        sql: "select \n    count(*) as seller,\n    count(*) + 1000 as seller2, \n    count(*) + 2000 as seller3, \n    count(*) + 3000 as seller4,\n    year(l192_new.supplier.registered_date) as _year\nFROM\n    supplier\nGROUP BY _year\nhaving _year is not null\nORDER BY _year\n",
        type: "table",
      },
    ],
    options: {
      xAxisKey: undefined,
      yAxisKeys: [],
      xAxisLabel: undefined,
      yAxisLabel: "cust sellers",
      backgroundType: "none",
      xAxisLabelHidden: true,
      yAxisLabelHidden: true,
      yAxisLabelDisplay: "right",
    },
    source_id: "856a1855-2bee-4d87-9756-a783088c0568",
    created_at: "2025-01-31T08:44:04.868Z",
    updated_at: "2025-01-31T08:44:04.868Z",
    workspace_id: "3db2e96f-ee43-412d-be09-25fc02d3a463",
    connection_id: null,
  },
  source_id: "856a1855-2bee-4d87-9756-a783088c0568",
  type: "line",
  workspace_id: "3db2e96f-ee43-412d-be09-25fc02d3a463",
};

export default function StorybookChartEditorPage() {
  const [chartValue, setChartValue] = useState(lineChartValue);

  return (
    <div className="flex h-full space-x-4">
      <div className="w-full flex-1 border-r p-4">
        <Chart value={chartValue} data={data} />
      </div>
      <div className="w-[400px] flex-shrink-0 p-4">
        {/* render chart editor menu here */}
        <EditChartMenu
          value={chartValue}
          onChange={setChartValue}
          columns={data?.length > 0 ? Object.keys(data[0]) : []}
        />
      </div>
    </div>
  );
}
