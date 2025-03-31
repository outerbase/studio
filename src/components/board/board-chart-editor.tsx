import { generateAutoComplete } from "@/context/schema-provider";
import { DatabaseResultSet, DatabaseSchemas } from "@/drivers/base-driver";

import { fillVariables, SupportedDialect } from "@outerbase/sdk-transform";
import { ChartBar, Play, Table } from "@phosphor-icons/react";
import { produce } from "immer";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardProps } from ".";
import Chart from "../chart";
import { ChartValue } from "../chart/chart-type";
import EditChartMenu from "../chart/edit-chart-menu";
import ResultTable from "../gui/query-result-table";
import SqlEditor from "../gui/sql-editor";
import OptimizeTableState from "../gui/table-optimized/optimize-table-state";
import { createTableStateFromResult } from "../gui/table-result/helper";
import { TableHeaderMetadata } from "../gui/table-result/type";
import { Button } from "../orbit/button";
import { MenuBar } from "../orbit/menu-bar";
import { createAutoBoardChartValue } from "./board-auto-value";
import { useBoardContext } from "./board-provider";
import BoardSourcePicker from "./board-source-picker";
import BoardSqlErrorLog from "./board-sql-error-log";

export default function BoardChartEditor({
  onChange,
  initialValue,
}: {
  onChange: (value: DashboardProps) => void;
  initialValue?: ChartValue;
}) {
  const {
    sources: sourceDriver,
    setBoardMode,
    value: boardValue,
    storage,
    resolvedFilterValue,
  } = useBoardContext();
  const [result, setResult] =
    useState<OptimizeTableState<TableHeaderMetadata>>();

  const [value, setValue] = useState<ChartValue>(() => {
    if (initialValue) return initialValue;

    if (boardValue?.charts && boardValue.charts.length) {
      return {
        ...NEW_CHART_EMPTY_VALUE,
        source_id: boardValue?.charts[0].source_id,
      };
    }

    const sourceList = sourceDriver?.sourceList() ?? [];
    if (sourceList.length) {
      return {
        ...NEW_CHART_EMPTY_VALUE,
        source_id: sourceList[0].id,
      };
    }

    return NEW_CHART_EMPTY_VALUE;
  });

  const [schema, setSchema] = useState<DatabaseSchemas>({});
  const [selectedSchema, setSelectedSchema] = useState("");
  const [displayType, setDisplayType] = useState("chart");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const { forcedTheme, resolvedTheme } = useTheme();
  const autoCompletion = useMemo(() => {
    return generateAutoComplete(selectedSchema, schema);
  }, [schema, selectedSchema]);

  const initialChartValue = useCallback(
    (newResult: DatabaseResultSet, sql: string) => {
      setValue((prev) => {
        try {
          return createAutoBoardChartValue(
            prev,
            newResult,
            sql,
            forcedTheme || resolvedTheme || ""
          );
        } catch {
          return prev;
        }
      });
    },
    [forcedTheme, resolvedTheme]
  );

  const onRunClicked = useCallback(() => {
    const sql = value?.params.layers[0].sql ?? "";
    const sourceId = value?.source_id ?? "";
    if (sourceDriver && sourceId) {
      const dialect = (sourceDriver.sourceList().find((s) => s.id === sourceId)
        ?.type ?? "sqlite") as SupportedDialect;

      const sqlWithVariables = fillVariables(sql, resolvedFilterValue, dialect);

      setLoading(true);
      sourceDriver
        .query(sourceId, sqlWithVariables)
        .then((newResult) => {
          setResult(
            createTableStateFromResult({
              result: newResult,
              driver: sourceDriver.getDriver(sourceId),
              schemas: schema,
            })
          );
          setErrorMessage(null);
          initialChartValue(newResult, sql);
        })
        .catch((e) => {
          setErrorMessage(e.toString());
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
    resolvedFilterValue,
  ]);

  // Ensure that we will run the query when we
  // try to edit an existing chart
  const runOnce = useRef(false);
  useEffect(() => {
    if (runOnce.current) return;

    runOnce.current = true;
    if (initialValue) {
      onRunClicked();
    }
  }, [onRunClicked, initialValue]);

  const onAddChart = useCallback(async () => {
    if (storage) {
      setSaveLoading(true);

      // Decide if we are updating or creating a new chart
      if (value.id) {
        const newValue = produce(boardValue!, (draft) => {
          const index = draft?.charts.findIndex((c) => c.id === value.id);
          if (index === -1) return;

          draft.charts[index] = value;
        });

        await storage.update(value.id, value);
        await storage.save(newValue);

        onChange(newValue);
        setBoardMode(null);
        setSaveLoading(false);
      } else {
        const newChart = await storage.add(value);
        if (newChart) {
          const newValue = produce(boardValue!, (draft) => {
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
          setSaveLoading(false);
        }
      }
    }
  }, [boardValue, onChange, setBoardMode, storage, value]);

  return (
    <div className="flex flex-1 overflow-hidden border-t">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="h-1/2 overflow-x-hidden border-b">
          {result && displayType === "table" && !errorMessage && (
            <ResultTable data={result} />
          )}
          {result && displayType === "chart" && !errorMessage && (
            <Chart data={result.getAllRows().map((r) => r.raw)} value={value} />
          )}
          {errorMessage && <BoardSqlErrorLog value={errorMessage} />}
        </div>
        <div className="h-1/2 overflow-x-hidden">
          <div className="flex gap-2 border-b px-4 py-2">
            <BoardSourcePicker
              value={value?.source_id}
              usedSourceId={(boardValue?.charts ?? []).map(
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
              highlightVariable
              variableList={(boardValue?.data.filters ?? [])
                .map((f) => f.name)
                .join(",")}
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
          <Button variant="primary" onClick={onAddChart} loading={saveLoading}>
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

const NEW_CHART_EMPTY_VALUE: ChartValue = {
  model: "chart",
  type: undefined,
  suggestedChartType: [],
  name: "New Chart",
  params: {
    type: "line",
    name: "New Chart",
    model: "chart",
    layers: [
      {
        type: "line",
        sql: "",
      },
    ],
    options: {
      yAxisKeys: [],
      xAxisKey: "",
    },
  },
};
