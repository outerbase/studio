import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
import * as hrana from "@libsql/hrana-client";
import { useEffect, useState } from "react";
import ResultTable from "@/components/result/ResultTable";
import { Button } from "@/components/ui/button";
import {
  LucideArrowLeft,
  LucideArrowRight,
  LucidePlusCircle,
  LucideRefreshCcw,
  LucideSave,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DatabaseTableSchema } from "@/drivers/DatabaseDriver";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAutoComplete } from "@/context/AutoCompleteProvider";
import OpacityLoading from "../(components)/OpacityLoading";

interface TableDataContentProps {
  tableName: string;
}

export default function TableDataWindow({ tableName }: TableDataContentProps) {
  const { updateTableSchema } = useAutoComplete();
  const { databaseDriver } = useDatabaseDriver();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<hrana.RowsResult>();
  const [tableSchema, setTableSchema] = useState<DatabaseTableSchema>();

  const [offset, setOffset] = useState("0");
  const [limit, setLimit] = useState("50");

  const [finalOffset, setFinalOffset] = useState(0);
  const [finalLimit, setFinalLimit] = useState(50);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData(
        await databaseDriver.selectFromTable(tableName, {
          limit: finalLimit,
          offset: finalOffset,
        })
      );

      const schema = await databaseDriver.getTableSchema(tableName);
      setLoading(false);

      setTableSchema(schema);
      updateTableSchema(tableName, schema.columns);
    };

    fetchData().then().catch(console.error);
  }, [databaseDriver, tableName, updateTableSchema, finalOffset, finalLimit]);

  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
      <div className="flex-shrink-0 flex-grow-0">
        <div className="flex p-1 gap-1">
          <Button variant={"ghost"} size={"sm"}>
            <LucideSave className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Button
            variant={"ghost"}
            size={"sm"}
            className="text-red-500 hover:text-red-500"
          >
            Discard Change
          </Button>

          <div>
            <Separator orientation="vertical" />
          </div>

          <Button variant={"ghost"} size={"sm"}>
            <LucideRefreshCcw className="w-4 h-4 mr-2 text-green-600" />
            Refresh
          </Button>

          <div>
            <Separator orientation="vertical" />
          </div>

          <Button variant={"ghost"} size={"sm"}>
            <LucidePlusCircle className="w-4 h-4 mr-2 text-green-600" />
            Add
          </Button>

          <div className="flex-grow"></div>

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
                  className="p-1 bg-gray-100 rounded text-xs"
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
                  className="p-1 bg-gray-100 rounded text-xs"
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
      <div className="flex-grow overflow-hidden relative">
        {loading && <OpacityLoading />}
        {data ? <ResultTable data={data} primaryKey={tableSchema?.pk} /> : null}
      </div>
    </div>
  );
}
