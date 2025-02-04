interface ChartLayer {
  sql: string;
  type: string;
}

export type ChartLegend = "none" | "top" | "bottom" | "left" | "right";
export type ChartLabelDisplayX = "auto" | "0" | "45" | "90" | "hidden";
export type ChartLabelDisplayY = "left" | "right" | "hidden";
export type ChartSortOrder = "default" | "asc" | "desc";

interface ChartOptions {
  foreground?: string;
  gradientStop?: string;
  gradientStart?: string;
  backgroundType?: string;
  xAxisLabelHidden?: boolean;
  yAxisLabelHidden?: boolean;
  legend?: ChartLegend;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisKey: string;
  yAxisKeys: string[];
  yAxisKeyColors?: Record<string, string>;
  xAxisLabelDisplay?: ChartLabelDisplayX;
  yAxisLabelDisplay?: ChartLabelDisplayY;
  sortOrder?: ChartSortOrder;
  groupBy?: string;
  percentage?: boolean;
  text?: string;
  format?:
    | "percent"
    | "number"
    | "decimal"
    | "date"
    | "time"
    | "dollar"
    | "euro"
    | "pound"
    | "yen";
  theme?: string;
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
  description?: string;
}

export interface ChartData {
  [key: string]: any;
}

export type ChartType =
  | "line"
  | "bar"
  | "pie"
  | "radar"
  | "funnel"
  | "area"
  | "column"
  | "scatter"
  | "text"
  | "table"
  | "single_value";
