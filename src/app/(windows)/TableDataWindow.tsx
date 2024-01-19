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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAutoComplete } from "@/context/AutoCompleteProvider";

interface TableDataContentProps {
  tableName: string;
}

export default function TableDataWindow({ tableName }: TableDataContentProps) {
  const { updateTableSchema } = useAutoComplete();
  const { databaseDriver } = useDatabaseDriver();
  const [data, setData] = useState<hrana.RowsResult>();
  const [tableSchema, setTableSchema] = useState<DatabaseTableSchema>();

  const [offset, setOffset] = useState();
  const [limit, setLimit] = useState();

  useEffect(() => {
    const fetchData = async () => {
      setData(
        await databaseDriver.selectFromTable(tableName, {
          limit: 50,
          offset: 0,
        })
      );

      const schema = await databaseDriver.getTableSchema(tableName);
      setTableSchema(schema);
      updateTableSchema(tableName, schema.columns);
    };

    fetchData().then().catch(console.error);
  }, [databaseDriver, tableName, updateTableSchema]);

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

          <Button variant={"ghost"} size={"sm"}>
            <LucideArrowLeft className="w-4 h-4  text-green-600" />
          </Button>

          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger>
                <input
                  style={{ width: 50 }}
                  className="p-1 bg-gray-100 rounded"
                  alt="Limit"
                />
              </TooltipTrigger>
              <TooltipContent>Limit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <input
                  style={{ width: 50 }}
                  className="p-1 bg-gray-100 rounded"
                  alt="Limit"
                />
              </TooltipTrigger>
              <TooltipContent>Offset</TooltipContent>
            </Tooltip>
          </div>

          <Button variant={"ghost"} size={"sm"}>
            <LucideArrowRight className="w-4 h-4 text-green-600" />
          </Button>
        </div>
        <Separator />
      </div>
      <div className="flex-grow overflow-hidden">
        {data ? <ResultTable data={data} primaryKey={tableSchema?.pk} /> : null}
      </div>
    </div>
  );
}
