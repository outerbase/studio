import { useCallback, useEffect, useState } from "react";
import ResultTable from "@/components/gui/query-result-table";
import { Button } from "@/components/ui/button";
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucideDelete,
  LucideFilter,
  LucideLoader,
  LucidePlus,
  LucideRefreshCcw,
  LucideSaveAll,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { commitChange } from "@/components/lib/sql-execute-helper";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  ColumnSortOption,
  DatabaseResultStat,
  DatabaseTableSchema,
} from "@/drivers/base-driver";
import { useAutoComplete } from "@/context/auto-complete-provider";
import OpacityLoading from "../loading-opacity";
import OptimizeTableState from "../table-optimized/OptimizeTableState";
import { useDatabaseDriver } from "@/context/driver-provider";
import ResultStats from "../result-stat";
import isEmptyResultStats from "@/components/lib/empty-stats";

interface TableDataContentProps {
  tableName: string;
}

export default function TableDataWindow({ tableName }: TableDataContentProps) {
  const { updateTableSchema } = useAutoComplete();
  const { databaseDriver } = useDatabaseDriver();
  const [error, setError] = useState<string>();
  const [executeError, setExecuteError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OptimizeTableState>();
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const { data: dataResult, schema: schemaResult } =
          await databaseDriver.selectTable(tableName, {
            whereRaw: where,
            limit: finalLimit,
            offset: finalOffset,
            orderBy: sortColumns,
          });

        console.log(dataResult);

        setData(OptimizeTableState.createFromResult(dataResult, schemaResult));
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
    sortColumns,
    updateTableSchema,
    setStat,
    where,
    finalOffset,
    finalLimit,
    revision,
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
      data.disardAllChange();
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

  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
      {executeError && (
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogDescription>{executeError} </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setExecuteError(null)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <div className="shrink-0 grow-0">
        <div className="flex p-1 gap-1 pb-2">
          <Button
            variant={"ghost"}
            size={"sm"}
            disabled={!changeNumber || isExecuting}
            onClick={onCommit}
          >
            {isExecuting ? (
              <LucideLoader className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <LucideSaveAll className="w-4 h-4 mr-2 text-green-600" />
            )}
            Commit
            {!!changeNumber && (
              <span
                className="ml-2 bg-red-500 text-white leading-5 w-5 h-5 rounded-full"
                style={{ fontSize: 9 }}
              >
                {changeNumber}
              </span>
            )}
          </Button>

          <Button
            variant={"ghost"}
            size={"sm"}
            disabled={!changeNumber}
            onClick={onDiscard}
          >
            <span className="text-red-500">Discard Change</span>
          </Button>

          <div className="mr-2">
            <Separator orientation="vertical" />
          </div>

          <Button variant={"ghost"} size={"sm"} onClick={onNewRow}>
            <LucidePlus className="w-4 h-4 text-green-600" />
          </Button>

          <Button variant={"ghost"} size={"sm"} onClick={onRemoveRow}>
            <LucideDelete className="w-4 h-4 text-red-600" />
          </Button>

          <Button
            variant={"ghost"}
            size={"sm"}
            onClick={() => setRevision((prev) => prev + 1)}
            disabled={loading}
          >
            <LucideRefreshCcw className="w-4 h-4 text-green-600" />
          </Button>

          <div className="flex grow mx-2">
            <div className="bg-secondary rounded overflow-hidden flex items-center w-full">
              <div className="text-sm px-2 text-gray-500 bg-gray-200 dark:bg-gray-700 h-full flex items-center">
                <LucideFilter className="h-4 w-4 text-black dark:text-white" />
              </div>
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
                className="bg-inherit p-1 pl-2 pr-2 outline-none text-sm font-mono h-full grow"
              />
            </div>
          </div>

          <div>
            <Separator orientation="vertical" />
          </div>

          <Button
            variant={"ghost"}
            size={"sm"}
            disabled={finalOffset === 0 || loading}
            onClick={() => {
              setFinalOffset(finalOffset - finalLimit);
              setOffset((finalOffset - finalLimit).toString());
            }}
          >
            <LucideArrowLeft className="w-4 h-4" />
          </Button>

          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger>
                <input
                  value={limit}
                  onChange={(e) => setLimit(e.currentTarget.value)}
                  onBlur={(e) => {
                    try {
                      const finalValue = parseInt(e.currentTarget.value);
                      if (finalValue !== finalLimit) {
                        setFinalLimit(finalValue);
                      }
                    } catch (e) {
                      setLimit(finalLimit.toString());
                    }
                  }}
                  style={{ width: 50 }}
                  className="p-1 pl-2 pr-2 bg-gray-100 dark:bg-gray-800 rounded text-xs h-full"
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
                      const finalValue = parseInt(e.currentTarget.value);
                      if (finalValue !== finalOffset) {
                        setFinalOffset(finalValue);
                      }
                    } catch (e) {
                      setOffset(finalOffset.toString());
                    }
                  }}
                  style={{ width: 50 }}
                  className="p-1 pl-2 pr-2 bg-gray-100 dark:bg-gray-800 rounded text-xs h-full"
                  alt="Offset"
                />
              </TooltipTrigger>
              <TooltipContent>Offset</TooltipContent>
            </Tooltip>
          </div>

          <Button variant={"ghost"} size={"sm"} disabled={loading}>
            <LucideArrowRight
              className="w-4 h-4"
              onClick={() => {
                setFinalOffset(finalOffset + finalLimit);
                setOffset((finalOffset + finalLimit).toString());
              }}
            />
          </Button>
        </div>
        <Separator />
      </div>
      <div className="grow overflow-hidden relative">
        {loading && <OpacityLoading />}
        {error && (
          <div className="text-red-500 p-5">
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
          />
        ) : null}
      </div>
      {stat && !isEmptyResultStats(stat) && (
        <div className="shrink-0 grow-0">
          <Separator />
          <ResultStats stats={stat} />
        </div>
      )}
    </div>
  );
}
