"use client";
import * as echarts from "echarts";
import { EChartsOption } from "echarts";
import { useEffect, useRef } from "react";

interface ChartLayer {
  sql: string;
  type: string;
}

interface ChartOptions {
  theme?: string;
  xAxisKey: string;
  yAxisKeys: string[];
  yAxisKeyColors: {
    [key: string]: string;
  };
}

interface ChartParams {
  id: string;
  name: string;
  type: ChartType;
  model: string;
  apiKey: string;
  layers: ChartLayer[];
  options: ChartOptions;
  source_id: string;
  created_at: string;
  updated_at: string;
  workspace_id: string;
  connection_id: string | null;
}

export interface ChartValue {
  connection_id: string | null;
  created_at: string;
  id: string;
  model: string;
  name: string;
  params: ChartParams;
  source_id: string;
  type: ChartType;
  updated_at: string;
  workspace_id: string;
}

export interface ChartData {
  [key: string]: any;
}

export type ChartType = "line" | "bar" | "pie" | "column" | "scatter";

interface OuterbaseChartProps {
  data: ChartData[];
  value: ChartValue;
  modifier?: EChartsOption;
  className?: string;
}

export default function Chart({
  value,
  data,
  modifier,
  className,
}: OuterbaseChartProps) {
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const props = transfromOutbaseChartData({
      value,
      data,
      modifier,
    });
    if (domRef.current) {
      let chartInstance = echarts.getInstanceByDom(domRef.current);
      if (chartInstance) {
        chartInstance.dispose();
      }
      chartInstance = echarts.init(domRef.current);
      chartInstance.clear();
      chartInstance.setOption(props);
    }
  }, [domRef, value, data, modifier]);

  return (
    <div ref={domRef} className={className ?? "h-[400px] w-[500px]"}></div>
  );
}

export function transfromOutbaseChartData({
  value,
  data,
  modifier,
}: OuterbaseChartProps) {
  const xAxisData = data.map(
    (item) => item[value?.params?.options?.xAxisKey] ?? ""
  );
  const seriesData = value?.params?.options?.yAxisKeys.map((key) => {
    const color = value?.params?.options?.yAxisKeyColors?.[key] ?? "";
    const chartType = value?.type;
    const baseSeries = {
      name: key,
      type: value.type,
      data: data.map((item) => {
        if (chartType === "pie") {
          return {
            value: item[key],
            name: item[value?.params?.options?.xAxisKey] ?? "",
          };
        } else {
          return item[key];
        }
      }),
      itemStyle: {
        color: color,
      },
    };
    if (chartType === "pie") {
      return pieChartDecoration(baseSeries);
    }
    return baseSeries;
  });

  if (value.type === "pie") {
    return {
      series: seriesData,
      ...modifier,
    };
  }

  return {
    xAxis: {
      type: "category",
      data: xAxisData,
    },
    yAxis: {
      type: "value",
    },
    series: seriesData,
    ...modifier,
  };
}

function pieChartDecoration(baseSeries: any) {
  return {
    ...baseSeries,
    type: "pie",
    radius: ["40%", "70%"],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 10,
      borderColor: "#fff",
      borderWidth: 2,
    },
    label: {
      show: false,
      position: "center",
    },
    emphasis: {
      label: {
        show: true,
        fontSize: 40,
        fontWeight: "bold",
      },
    },
    labelLine: {
      show: false,
    },
  };
}
