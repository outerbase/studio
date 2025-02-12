import { generateAutoComplete } from "@/context/schema-provider";
import { DatabaseResultSet, DatabaseSchemas } from "@/drivers/base-driver";
import { ChartBar, Play, Table } from "@phosphor-icons/react";
import { produce } from "immer";
import { useTheme } from "next-themes";
import { useCallback, useMemo, useState } from "react";
import { DashboardProps } from ".";
import Chart from "../chart";
import { ChartValue, DEFAULT_THEME, THEMES } from "../chart/chart-type";
import { generateGradientColors } from "../chart/echart-options-builder";
import EditChartMenu from "../chart/edit-chart-menu";
import ResultTable from "../gui/query-result-table";
import SqlEditor from "../gui/sql-editor";
import OptimizeTableState from "../gui/table-optimized/OptimizeTableState";
import { Button } from "../orbit/button";
import { MenuBar } from "../orbit/menu-bar";
import { useBoardContext } from "./board-provider";
import BoardSourcePicker from "./board-source-picker";

export default function BoardChartEditor({
  onChange,
}: {
  onChange: (value: DashboardProps) => void;
}) {
  const [value, setValue] = useState<ChartValue>({
    model: "chart",
    type: "line",
    connection_id: "",
    created_at: "",
    id: "",
    source_id: "",
    updated_at: "",
    workspace_id: "",
    name: "New Chart",
    params: {
      type: "line",
      id: "",
      name: "New Chart",
      model: "chart",
      apiKey: "",
      layers: [
        {
          type: "sql",
          sql: "",
        },
      ],
      options: {
        yAxisKeys: [],
        xAxisKey: "",
      },
      source_id: "",
      created_at: "",
      updated_at: "",
      workspace_id: "",
      connection_id: "",
    },
  });

  const [schema, setSchema] = useState<DatabaseSchemas>({});
  const [selectedSchema, setSelectedSchema] = useState("");
  const [displayType, setDisplayType] = useState("chart");
  const [loading, setLoading] = useState(false);
  const { forcedTheme, resolvedTheme } = useTheme();
  const autoCompletion = useMemo(() => {
    return generateAutoComplete(selectedSchema, schema);
  }, [schema, selectedSchema]);

  const {
    sources: sourceDriver,
    setBoardMode,
    value: chartList,
    storage,
  } = useBoardContext();
  const [result, setResult] = useState<OptimizeTableState>();

  const initialChartValue = useCallback(
    (newResult: DatabaseResultSet, sql: string) => {
      setValue((prev) => {
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
            }

            // initial yAxisKeyColors
            const axisColors = Object.keys(
              draft.params.options.yAxisKeyColors ?? {}
            );
            const appTheme: "light" | "dark" = (forcedTheme ||
              resolvedTheme) as "light" | "dark";
            const themeColor =
              THEMES[DEFAULT_THEME].colors?.[appTheme ?? "light"];
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
            } else if (
              axisColors.length > 0 &&
              columns.length > axisColors.length
            ) {
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
      });
    },
    [forcedTheme, resolvedTheme]
  );

  const onRunClicked = useCallback(() => {
    const sql = value?.params.layers[0].sql ?? "";
    const sourceId = value?.source_id ?? "";

    if (sourceDriver && sourceId) {
      setLoading(true);
      sourceDriver
        .query(sourceId, sql)
        .then((newResult) => {
          setResult(
            OptimizeTableState.createFromResult({
              result: newResult,
              driver: sourceDriver.getDriver(sourceId),
              schemas: schema,
            })
          );
          initialChartValue(newResult, sql);
        })
        .catch(() => {
          console.log("error");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [
    value?.params.layers,
    value?.source_id,
    sourceDriver,
    schema,
    initialChartValue,
  ]);

  const onAddChart = useCallback(async () => {
    if (storage) {
      setLoading(true);
      const newChart = await storage.add(value);
      if (newChart) {
        const newValue = produce(chartList!, (draft) => {
          if (!draft?.charts) draft.charts = [];
          draft?.charts.push(newChart);

          if (!draft?.layout) draft.layout = [];

          let y = 0;
          for (const layout of draft.layout)
            y = Math.max(y, layout.y + layout.h);

          draft.layout.push({
            x: 0,
            y,
            w: 2,
            h: 2,
            i: newChart.id!,
          });
        });
        await storage.save(newValue);
        onChange(newValue);
        setBoardMode(null);
        setLoading(false);
      }
    }
  }, [chartList, onChange, setBoardMode, storage, value]);

  return (
    <div className="flex flex-1 overflow-hidden border-t">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="h-1/2 overflow-x-hidden border-b">
          {result && displayType === "table" && <ResultTable data={result} />}
          {result && displayType === "chart" && (
            <Chart data={result.getAllRows().map((r) => r.raw)} value={value} />
          )}
        </div>
        <div className="h-1/2 overflow-x-hidden">
          <div className="flex gap-2 border-b px-4 py-2">
            <BoardSourcePicker
              value={value?.source_id}
              usedSourceId={(chartList?.charts ?? []).map(
                (c) => c.source_id || ""
              )}
              onChange={(newSourceId) => {
                setValue((prev) =>
                  produce(prev, (draft) => {
                    draft.source_id = newSourceId;
                  })
                );
              }}
              onSchemaLoad={(loadedSchema) => {
                setSchema(loadedSchema.schema);
                setSelectedSchema(loadedSchema.selectedSchema ?? "");
                console.log(loadedSchema);
              }}
            />

            <div>
              <MenuBar
                size="lg"
                value={displayType}
                onChange={setDisplayType}
                items={[
                  {
                    value: "chart",
                    content: (
                      <span>
                        <ChartBar className="inline" /> Chart
                      </span>
                    ),
                  },
                  {
                    value: "table",
                    content: (
                      <span>
                        <Table className="inline" /> Table
                      </span>
                    ),
                  },
                ]}
              />
            </div>

            <div className="flex-1"></div>

            <div>
              <Button size="lg" onClick={onRunClicked} loading={loading}>
                <Play />
                Run
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <SqlEditor
              dialect="sqlite"
              value={value.params.layers[0].sql}
              schema={autoCompletion}
              onChange={(e) => {
                setValue(
                  produce(value, (draft) => {
                    draft.params.layers[0].sql = e;
                  })
                );
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex w-[370px] shrink-0 flex-col overflow-x-hidden overflow-y-auto border-l">
        <div className="overflow-y-auto p-4">
          <EditChartMenu
            value={value}
            onChange={setValue}
            columns={result?.getHeaders().map((header) => header.name) ?? []}
          />
        </div>
        <div className="flex justify-end gap-2 border-t p-4">
          <Button variant="primary" onClick={onAddChart}>
            Save Changes
          </Button>
          <Button
            onClick={() => {
              setBoardMode(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function getColumnType(firstRecord: any): Record<string, string> {
  const columnTypes: Record<string, string> = {};
  const keys = Object.keys(firstRecord);
  for (const key of keys) {
    columnTypes[key] = typeof firstRecord[key];
  }
  return columnTypes;
}
