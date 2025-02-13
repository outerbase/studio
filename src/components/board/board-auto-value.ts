import { DatabaseResultSet } from "@/drivers/base-driver";
import { produce } from "immer";
import { ChartValue, DEFAULT_THEME, THEMES } from "../chart/chart-type";
import { generateGradientColors } from "../chart/echart-options-builder";

export function createAutoBoardChartValue(
  prev: ChartValue,
  newResult: DatabaseResultSet,
  sql: string,
  theme: string,
  suggestChartType: boolean
): ChartValue {
  return produce(prev, (draft) => {
    draft.params.layers[0].sql = sql;
    if (newResult.headers?.length > 0) {
      const columns = newResult.headers.map((header) => header.name);

      if (newResult.rows.length > 0) {
        const xAxisKeys = [];
        const yAxisKeys = [];
        const firstRecord = newResult.rows[0];
        const columnType = getColumnType(firstRecord);
        // study each column value and try to guess the type
        if (columnType) {
          for (const column of columns) {
            if (columnType[column] === "number") {
              yAxisKeys.push(column);
            } else {
              xAxisKeys.push(column);
            }
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

        draft.params.options.xAxisKey =
          xAxisKeys.length > 0 ? xAxisKeys[0] : "";
        draft.params.options.yAxisKeys = yAxisKeys;

        if (suggestChartType) {
          // recommend chart type
          if (
            newResult.rows.length === 1 &&
            newResult.headers.length === 1 &&
            xAxisKeys.length === 0 &&
            yAxisKeys.length === 1
          ) {
            draft.type = "single_value";
            draft.params.type = "single_value";
          } else if (
            (xAxisKeys.length === 0 && yAxisKeys.length > 1) ||
            newResult.rows.length > 100
          ) {
            draft.type = "table";
            draft.params.type = "table";
          } else if (xAxisKeys.length > 0 && yAxisKeys.length > 1) {
            if (newResult.rows.length > 10) {
              draft.type = "line";
              draft.params.type = "line";
            } else {
              draft.type = "column";
              draft.params.type = "column";
            }
          } else if (
            xAxisKeys.length > 0 &&
            yAxisKeys.length === 1 &&
            newResult.rows.length < 10
          ) {
            draft.type = "pie";
            draft.params.type = "pie";
          } else if (
            xAxisKeys.length === 1 &&
            yAxisKeys.length === 0 &&
            newResult.rows.length === 1
          ) {
            draft.type = "text";
            draft.params.type = "text";
            draft.params.options.text = newResult.rows[0][
              xAxisKeys[0]
            ] as string;
          } else {
            draft.type = "line";
            draft.params.type = "line";
          }
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
