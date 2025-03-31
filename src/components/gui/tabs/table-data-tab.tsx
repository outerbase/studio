import ResultTable from "@/components/gui/query-result-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/orbit/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAutoComplete } from "@/context/auto-complete-provider";
import { useStudioContext } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import {
  ColumnSortOption,
  DatabaseResultStat,
  DatabaseTableSchema,
} from "@/drivers/base-driver";
import { KEY_BINDING } from "@/lib/key-matcher";
import { commitChange } from "@/lib/sql/sql-execute-helper";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideRefreshCcw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AggregateResultButton from "../aggregate-result/aggregate-result-button";
import ExportResultButton from "../export/export-result-button";
import OpacityLoading from "../loading-opacity";
import ResultStats from "../result-stat";
import OptimizeTableState from "../table-optimized/optimize-table-state";
import useTableResultColumnFilter from "../table-result/filter-column";
import { createTableStateFromResult } from "../table-result/helper";
import { TableHeaderMetadata } from "../table-result/type";
import { Toolbar } from "../toolbar";
import { useCurrentTab } from "../windows-tab";

interface TableDataContentProps {
  tableName: string;
  schemaName: string;
}

export default function TableDataWindow({
  schemaName,
  tableName,
}: TableDataContentProps) {
  const { updateTableSchema } = useAutoComplete();
  const { schema } = useSchema();
  const { databaseDriver } = useStudioContext();
  const [error, setError] = useState<string>();
  const [executeError, setExecuteError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OptimizeTableState<TableHeaderMetadata>>();
  const [tableSchema, setTableSchema] = useState<DatabaseTableSchema>();
  const [stat, setStat] = useState<DatabaseResultStat>();
  const [sortColumns, setSortColumns] = useState<ColumnSortOption[]>([]);
  const [changeNumber, setChangeNumber] = useState(0);

  const [where, setWhere] = useState("");
  const [whereInput, setWhereInput] = useState("");

  const [offset, setOffset] = useState("0");
  const [limit, setLimit] = useState("50");

  const [finalOffset, setFinalOffset] = useState(0);
  const [finalLimit, setFinalLimit] = useState(50);
  const [isExecuting, setIsExecuting] = useState(false);

  const [revision, setRevision] = useState(1);
  const [lastQueryTimestamp, setLastQueryTimestamp] = useState(0);

  // We cache the schema to prevent re-initial
  // the state when schema changes and lost all the
  // changes in the table
  const [cachedSchema] = useState(() => schema);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const { data: dataResult, schema: schemaResult } =
          await databaseDriver.selectTable(schemaName, tableName, {
            whereRaw: where,
            limit: finalLimit,
            offset: finalOffset,
            orderBy: sortColumns,
          });

        const tableState = createTableStateFromResult({
          driver: databaseDriver,
          result: dataResult,
          tableSchema: schemaResult,
          schemas: cachedSchema,
        });

        tableState.setSql("SELECT * FROM " + tableName + ";");

        setData(tableState);

        setStat(dataResult.stat);
        setTableSchema(schemaResult);
        updateTableSchema(tableName, schemaResult.columns);
        setLastQueryTimestamp(Date.now());
        setChangeNumber(0);
        setError(undefined);
      } catch (e) {
        setError((e as Error).toString());
      } finally {
        setLoading(false);
      }
    };

    fetchData().then().catch(console.error);
  }, [
    databaseDriver,
    tableName,
    schemaName,
    sortColumns,
    updateTableSchema,
    setStat,
    where,
    finalOffset,
    finalLimit,
    revision,
    cachedSchema,
  ]);

  useEffect(() => {
    if (data) {
      const callback = (state: OptimizeTableState) => {
        setChangeNumber(state.getChangedRows().length);
      };
      data.addChangeListener(callback);
      return () => data.removeChangeListener(callback);
    }
  }, [data]);

  const { columnIndexList, filterColumnButton } = useTableResultColumnFilter({
    state: data,
  });

  const onCommit = useCallback(() => {
    if (!tableSchema) return;
    if (!data) return;

    setIsExecuting(true);

    commitChange({ driver: databaseDriver, tableName, tableSchema, data })
      .then(({ errorMessage }) => {
        if (errorMessage) setExecuteError(errorMessage);
      })
      .catch(console.error)
      .finally(() => setIsExecuting(false));
  }, [databaseDriver, tableName, tableSchema, data, setExecuteError]);

  const onDiscard = useCallback(() => {
    if (data) {
      data.discardAllChange();
    }
  }, [data]);

  const onNewRow = useCallback(() => {
    if (data) {
      data.insertNewRow();
    }
  }, [data]);

  const onRemoveRow = useCallback(() => {
    if (data) {
      data.getSelectedRowIndex().forEach((index) => {
        data.removeRow(index);
      });
    }
  }, [data]);

  const { isActiveTab } = useCurrentTab();

  useEffect(() => {
    if (isActiveTab) {
      const handleGlobalKeyBinding = (e: KeyboardEvent) => {
        if (KEY_BINDING.commit.match(e)) {
          onCommit();
          e.preventDefault();
          e.stopPropagation();
        } else if (KEY_BINDING.discard.match(e)) {
          onDiscard();
          e.preventDefault();
          e.stopPropagation();
        }
      };

      document.addEventListener("keydown", handleGlobalKeyBinding);
      return () =>
        document.removeEventListener("keydown", handleGlobalKeyBinding);
    }
  }, [isActiveTab, onCommit, onDiscard]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {executeError && (
        <AlertDialog open={true}>
          <AlertDialogContent title="Error">
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{executeError} </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setExecuteError(null)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <div className="shrink-0 grow-0 border-b border-neutral-200 py-2 dark:border-neutral-800">
        <Toolbar>
          <div className="ml-2 flex flex-1 items-center gap-2">
            <Button
              variant={"secondary"}
              onClick={() => setRevision((prev) => prev + 1)}
              disabled={loading}
            >
              <LucideRefreshCcw className="h-4 w-4" />
            </Button>

            <Button
              variant={"secondary"}
              onClick={onNewRow}
              className="flex items-center gap-1"
            >
              <div className="text-sm">Add row</div>
            </Button>

            <Button variant={"secondary"} onClick={onRemoveRow}>
              <div className="text-sm">Delete row</div>
            </Button>
          </div>

          <div className="mx-2 flex max-w-1/3 grow">
            <div className="flex w-full items-center overflow-hidden rounded border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
              {filterColumnButton}
              <input
                type="text"
                placeholder="eg: id=5"
                value={whereInput}
                onChange={(e) => setWhereInput(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setWhere(e.currentTarget.value);
                  }
                }}
                className="h-full grow p-2 pr-2 pl-3 font-mono text-sm outline-hidden"
              />
            </div>
          </div>

          <div className="mr-2 flex flex-1 flex-row-reverse items-center gap-2">
            {/* <ToolbarButton
              text="Save"
              // icon={<LucideSaveAll className="h-4 w-4" />}
              tooltip={`Commit your changes (${KEY_BINDING.commit.toString()})`}
              disabled={!changeNumber || isExecuting}
              loading={isExecuting}
              onClick={onCommit}
              badge={changeNumber ? changeNumber.toString() : ""}
            />

            <ToolbarButton
              text="Discard"
              tooltip={`Dicard all changes (${KEY_BINDING.discard.toString()})`}
              destructive
              disabled={!changeNumber}
              onClick={onDiscard}
            /> */}

            {changeNumber ? (
              <>
                <Button
                  variant={"primary"}
                  onClick={onCommit}
                  loading={isExecuting}
                  disabled={!changeNumber || isExecuting}
                >
                  <div className="text-sm">
                    Save {changeNumber ? changeNumber.toString() : ""} changes
                  </div>
                </Button>

                <Button variant={"destructive"} onClick={onDiscard}>
                  <div className="text-sm">Discard</div>
                </Button>
              </>
            ) : (
              <></>
            )}
          </div>
        </Toolbar>
      </div>
      <div className="relative grow overflow-hidden">
        {loading && <OpacityLoading />}
        {error && (
          <div className="p-5 text-red-500">
            <pre>{error}</pre>
          </div>
        )}
        {data && !error ? (
          <ResultTable
            data={data}
            tableName={tableName}
            key={lastQueryTimestamp}
            sortColumns={sortColumns}
            onSortColumnChange={setSortColumns}
            visibleColumnIndexList={columnIndexList}
          />
        ) : null}
      </div>
      {stat && data && (
        <div className="flex h-12 shrink-0 justify-between border-t">
          <div className="flex items-center p-1 px-2">
            <div>
              <ExportResultButton data={data} />
            </div>
            <ResultStats stats={stat} />
          </div>
          <div className="p-1 pr-3">
            <AggregateResultButton data={data} />
          </div>

          <div className="mr-3 flex items-center gap-2">
            <Button
              variant={"secondary"}
              size={"sm"}
              disabled={finalOffset === 0 || loading}
              onClick={() => {
                setFinalOffset(finalOffset - finalLimit);
                setOffset((finalOffset - finalLimit).toString());
              }}
              style={{ width: 32, height: 32 }}
            >
              <LucideArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <input
                    value={limit}
                    onChange={(e) => setLimit(e.currentTarget.value)}
                    onBlur={(e) => {
                      try {
                        const finalValue = Math.max(
                          0,
                          parseInt(e.currentTarget.value)
                        );
                        if (finalValue !== finalLimit) {
                          setFinalLimit(finalValue);
                        }
                      } catch (e) {
                        setLimit(finalLimit.toString());
                      }
                    }}
                    style={{ width: 50 }}
                    className="h-8 rounded bg-neutral-200 p-1 pr-2 pl-2 text-xs dark:bg-neutral-900"
                    alt="Limit"
                  />
                </TooltipTrigger>
                <TooltipContent>Limit</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger>
                  <input
                    value={offset}
                    onChange={(e) => setOffset(e.currentTarget.value)}
                    onBlur={(e) => {
                      try {
                        const finalValue = Math.max(
                          0,
                          parseInt(e.currentTarget.value)
                        );
                        if (finalValue !== finalOffset) {
                          setFinalOffset(finalValue);
                        }
                        setOffset(finalValue.toString());
                      } catch (e) {
                        setOffset(finalOffset.toString());
                      }
                    }}
                    style={{ width: 50 }}
                    className="h-full rounded bg-neutral-200 p-1 pr-2 pl-2 text-xs dark:bg-neutral-900"
                    alt="Offset"
                  />
                </TooltipTrigger>
                <TooltipContent>Offset</TooltipContent>
              </Tooltip>
            </div>

            <Button
              variant={"secondary"}
              size={"sm"}
              disabled={loading}
              style={{ width: 32, height: 32 }}
            >
              <LucideArrowRight
                className="h-4 w-4"
                onClick={() => {
                  setFinalOffset(finalOffset + finalLimit);
                  setOffset((finalOffset + finalLimit).toString());
                }}
              />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
