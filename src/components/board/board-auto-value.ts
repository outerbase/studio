import { DatabaseResultSet } from "@/drivers/base-driver";
import { produce } from "immer";
import { isDate } from "lodash";
import {
  ChartType,
  ChartValue,
  DEFAULT_THEME,
  THEMES,
} from "../chart/chart-type";
import { generateGradientColors } from "../chart/echart-options-builder";

export function createAutoBoardChartValue(
  prev: ChartValue,
  newResult: DatabaseResultSet,
  sql: string,
  theme: string
): ChartValue {
  return produce(prev, (draft) => {
    draft.params.layers[0].sql = sql;
    if (newResult.headers?.length > 0) {
      const columns = newResult.headers.map((header) => header.name);

      if (newResult.rows.length > 0) {
        const xAxisKeys: string[] = [];
        const yAxisKeys: string[] = [];
        const firstRecord = newResult.rows[0];
        const columnType = getColumnType(firstRecord);

        // remove the previous xAxisKey and yAxisKeys

        // study each column value and try to guess the type
        if (columnType) {
          for (const column of columns) {
            if (columnType[column] === "number") {
              yAxisKeys.push(column);
            } else {
              xAxisKeys.push(column);
            }
          }
          if (xAxisKeys.length === 0 && yAxisKeys.length > 1) {
            xAxisKeys.push(yAxisKeys.shift() as string);
          }
        } else {
          // if there is no column type, we will just use the first column as xAxisKey
          for (let i = 0; i < newResult.headers.length; i++) {
            if (i === 0) {
              xAxisKeys.push(newResult.headers[i].name);
            } else {
              yAxisKeys.push(newResult.headers[i].name);
            }
          }
        }

        if (draft.params.options.xAxisKey === "") {
          draft.params.options.xAxisKey =
            xAxisKeys.length > 0 ? xAxisKeys[0] : "";
        }

        if (draft.params.options.yAxisKeys.length === 0) {
          draft.params.options.yAxisKeys = yAxisKeys;
        }

        const suggestedChartTypes = suggestChartType(
          xAxisKeys,
          yAxisKeys,
          newResult.rows
        );

        draft.suggestedChartType = suggestedChartTypes;
        if (draft.type === undefined) {
          draft.type = suggestedChartTypes[0];
          draft.params.type = suggestedChartTypes[0];
        }
      }

      // initial yAxisKeyColors
      const axisColors = Object.keys(draft.params.options.yAxisKeyColors ?? {});
      const appTheme: "light" | "dark" = theme as "light" | "dark";
      const themeColor = THEMES[DEFAULT_THEME].colors?.[appTheme ?? "light"];
      if (axisColors.length === 0 && columns.length > 0) {
        // Add default yAxisKeyColors
        const colors = generateGradientColors(
          themeColor[0],
          themeColor[1],
          columns.length
        );
        const newColors = columns.reduce(
          (acc, col, i) => {
            acc[col] = colors[i];
            return acc;
          },
          {} as Record<string, string>
        );

        draft.params.options.theme = DEFAULT_THEME;
        draft.params.options.yAxisKeyColors = newColors;
      } else if (axisColors.length > 0 && columns.length > axisColors.length) {
        // Add new yAxisKeyColors
        const colors = generateGradientColors(
          themeColor[0],
          themeColor[1],
          columns.length + 5
        );

        for (let i = 0; i < columns.length; i++) {
          if (
            draft.params.options.yAxisKeyColors &&
            !draft.params.options.yAxisKeyColors[columns[i]]
          ) {
            draft.params.options.yAxisKeyColors[columns[i]] = colors[
              i
            ] as string;
          }
        }
      }
    }
  });
}

function getColumnType(firstRecord: any): Record<string, string> {
  const columnTypes: Record<string, string> = {};
  const keys = Object.keys(firstRecord);
  for (const key of keys) {
    columnTypes[key] = typeof firstRecord[key];
  }
  return columnTypes;
}

function suggestChartType(
  xAxisKeys: string[],
  yAxisKeys: string[],
  rows: any[]
): ChartType[] {
  const suggestedChartTypes: ChartType[] = [];

  if (isSuitableForSingleValue(rows)) {
    suggestedChartTypes.push("single_value");
  }
  if (isSuitableForPieChart(xAxisKeys, yAxisKeys, rows)) {
    suggestedChartTypes.push("pie");
  }
  if (isSuitableForLineChart(xAxisKeys, yAxisKeys, rows)) {
    suggestedChartTypes.push("line");
  }
  if (isSuitableForColumnChart(xAxisKeys, yAxisKeys, rows)) {
    suggestedChartTypes.push("column");
  }
  if (isSuitableForBarChart(xAxisKeys, yAxisKeys, rows)) {
    suggestedChartTypes.push("bar");
  }
  if (isSuitableForFunnelChart(xAxisKeys, yAxisKeys, rows)) {
    suggestedChartTypes.push("funnel");
  }
  if (isSuitableForScatterChart(xAxisKeys, yAxisKeys, rows)) {
    suggestedChartTypes.push("scatter");
  }
  if (isSuitableForTable(xAxisKeys, yAxisKeys, rows)) {
    suggestedChartTypes.push("table");
  }
  if (isSuitTableForRadarChart(xAxisKeys, yAxisKeys, rows)) {
    suggestedChartTypes.push("radar");
  }
  if (suggestedChartTypes.length === 0) {
    suggestedChartTypes.push("line");
  }
  return suggestedChartTypes;
}

function isSuitableForLineChart(
  xAxisKeys: string[],
  yAxisKeys: string[],
  rows: any[]
): boolean {
  if (rows.length < 20) return false;
  const hasTimeSeries = xAxisKeys.some((key) => isDate(rows[0][key]));
  return hasTimeSeries && yAxisKeys.length > 0;
}

function isSuitableForColumnChart(
  xAxisKeys: string[],
  yAxisKeys: string[],
  rows: any[]
): boolean {
  if (rows.length >= 20) return false;
  return xAxisKeys.length > 0 && yAxisKeys.length > 0 && rows.length > 1;
}

function isSuitableForBarChart(
  xAxisKeys: string[],
  yAxisKeys: string[],
  rows: any[]
): boolean {
  if (rows.length >= 20) return false;
  return xAxisKeys.length === 1 && yAxisKeys.length === 1 && rows.length > 1;
}

function isSuitableForPieChart(
  xAxisKeys: string[],
  yAxisKeys: string[],
  rows: any[]
): boolean {
  return xAxisKeys.length === 1 && yAxisKeys.length === 1 && rows.length > 1;
}

function isSuitableForFunnelChart(
  xAxisKeys: string[],
  yAxisKeys: string[],
  rows: any[]
): boolean {
  return isSuitableForPieChart(xAxisKeys, yAxisKeys, rows);
}

function isSuitableForScatterChart(
  xAxisKeys: string[],
  yAxisKeys: string[],
  rows: any[]
): boolean {
  if (xAxisKeys.length === 1 && yAxisKeys.length === 1 && rows.length > 1) {
    if (
      typeof rows[0][xAxisKeys[0]] === "number" &&
      typeof rows[0][yAxisKeys[0]] === "number"
    ) {
      return true;
    }
  }
  return false;
}

function isSuitableForTable(
  xAxisKeys: string[],
  yAxisKeys: string[],
  rows: any[]
): boolean {
  if (rows.length >= 20 || xAxisKeys.length + yAxisKeys.length > 2) return true;
  return false;
}

function isSuitableForSingleValue(rows: any[]): boolean {
  return rows.length === 1;
}

function isSuitTableForRadarChart(
  xAxisKeys: string[],
  yAxisKeys: string[],
  rows: any[]
): boolean {
  if (yAxisKeys.length > 2 && rows.length > 1) {
    return true;
  }
  return false;
}
