"use client";

import Chart from "@/components/chart";
import { ChartData, ChartValue } from "@/components/chart/chartTypes";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const data: ChartData[] = [
  {
    package_year: 2021,
    package_count: 33,
  },
  {
    package_year: 2020,
    package_count: 62103,
  },
  {
    package_year: 2021,
    package_count: 360881,
  },
  {
    package_year: 2022,
    package_count: 426727,
  },
  {
    package_year: 2023,
    package_count: 370008,
  },
  {
    package_year: 2024,
    package_count: 1074,
  },
  {
    package_year: 2025,
    package_count: 43,
  },
];

const lineChartValue: ChartValue = {
  connection_id: null,
  created_at: "2025-01-30T02:57:34.579Z",
  id: "2bdc1dc4-21de-4b5f-90d2-384e40288769",
  model: "chart",
  name: "Line Chart",
  params: {
    id: "2bdc1dc4-21de-4b5f-90d2-384e40288769",
    name: "Line Chart",
    type: "scatter",
    model: "chart",
    apiKey: "",
    layers: [
      {
        sql: "SELECT YEAR(created_at) AS package_year, COUNT(*) AS package_count FROM package GROUP BY package_year",
        type: "line",
      },
    ],
    options: {
      xAxisKey: "package_year",
      yAxisKeys: ["package_count"],
      yAxisKeyColors: {
        "1 + 1": "#fafafa",
        package_year: "#fafafa",
      },
    },
    source_id: "856a1855-2bee-4d87-9756-a783088c0568",
    created_at: "2025-01-30T02:57:34.579Z",
    updated_at: "2025-01-30T02:57:34.579Z",
    workspace_id: "3db2e96f-ee43-412d-be09-25fc02d3a463",
    connection_id: null,
  },
  source_id: "856a1855-2bee-4d87-9756-a783088c0568",
  type: "line",
  updated_at: "2025-01-30T09:06:35.249Z",
  workspace_id: "3db2e96f-ee43-412d-be09-25fc02d3a463",
};

const barChartValue: ChartValue = {
  connection_id: null,
  created_at: "2025-01-30T02:56:40.851Z",
  id: "fed7cd59-6be9-4f43-af6d-b730d14be984",
  model: "chart",
  name: "Bar chart",
  params: {
    id: "fed7cd59-6be9-4f43-af6d-b730d14be984",
    name: "Bar chart",
    type: "column",
    model: "chart",
    apiKey: "",
    layers: [
      {
        sql: "SELECT YEAR(created_at) AS package_year, COUNT(*) AS package_count FROM package GROUP BY package_year",
        type: "bar",
      },
    ],
    options: {
      xAxisKey: "package_year",
      yAxisKeys: ["package_count"],
      yAxisKeyColors: {
        avg_value: "#e5e5e5",
        sum_value: "#a3a3a3",
        ValueGroup: "#fafafa",
        PackageCount: "#fafafa",
        package_count: "#525252",
      },
    },
    source_id: "856a1855-2bee-4d87-9756-a783088c0568",
    created_at: "2025-01-30T02:56:40.851Z",
    updated_at: "2025-01-30T02:56:40.851Z",
    workspace_id: "3db2e96f-ee43-412d-be09-25fc02d3a463",
    connection_id: null,
  },
  source_id: "856a1855-2bee-4d87-9756-a783088c0568",
  type: "bar",
  updated_at: "2025-01-30T09:25:05.373Z",
  workspace_id: "3db2e96f-ee43-412d-be09-25fc02d3a463",
};

const pieChartValue: ChartValue = {
  connection_id: null,
  created_at: "2025-01-30T03:00:40.963Z",
  id: "602f5960-e2db-4359-8008-c87629c1d169",
  model: "chart",
  name: "Pie chart teset",
  params: {
    id: "602f5960-e2db-4359-8008-c87629c1d169",
    name: "Pie chart teset",
    type: "line",
    model: "chart",
    apiKey: "",
    layers: [
      {
        sql: "SELECT YEAR(created_at) AS package_year, COUNT(*) AS package_count FROM package GROUP BY package_year",
        type: "pie",
      },
    ],
    options: {
      theme: "afterburn",
      xAxisKey: "package_year",
      yAxisKeys: ["package_count"],
      yAxisKeyColors: {
        package_count: "#E75F98",
      },
    },
    source_id: "856a1855-2bee-4d87-9756-a783088c0568",
    created_at: "2025-01-30T03:00:40.963Z",
    updated_at: "2025-01-30T03:00:40.963Z",
    workspace_id: "3db2e96f-ee43-412d-be09-25fc02d3a463",
    connection_id: null,
  },
  source_id: "856a1855-2bee-4d87-9756-a783088c0568",
  type: "pie",
  updated_at: "2025-01-30T07:19:15.167Z",
  workspace_id: "3db2e96f-ee43-412d-be09-25fc02d3a463",
};

export default function StorybookChartPage() {
  const [chartValue, setChartValue] = useState(lineChartValue);
  const [items, setItems] = useState(data);
  const [modifier, setModifier] = useState({});

  return (
    <div className="flex h-full w-full flex-col">
      <div>
        <Button
          onClick={() => {
            setChartValue(lineChartValue);
            setItems(items);
            setModifier({
              title: {
                text: "Line Chart",
                left: "center",
              },
              tooltip: {
                trigger: "item",
              },
            });
          }}
        >
          Line
        </Button>
        <Button
          className="ml-2"
          onClick={() => {
            setChartValue(barChartValue);
            setItems(items);
            setModifier({
              title: {
                text: "Bar Chart",
                left: "center",
              },
              tooltip: {
                trigger: "item",
              },
            });
          }}
        >
          Bar
        </Button>
        <Button
          className="ml-2"
          onClick={() => {
            setChartValue(pieChartValue);
            setItems(items);
            setModifier({
              title: {
                text: "Pie Chart",
                left: "center",
              },
              tooltip: {
                trigger: "item",
              },
            });
          }}
        >
          Pie
        </Button>
      </div>
      <div className="flex h-full w-full p-4">
        <Chart value={chartValue} data={items} modifier={modifier} />
      </div>
    </div>
  );
}
