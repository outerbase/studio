import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
import * as hrana from "@libsql/hrana-client";
import { useEffect, useMemo, useRef, useState } from "react";
import ResultTable from "@/components/result/ResultTable";
import { Button } from "@/components/ui/button";
import { LucidePlusCircle, LucideRefreshCcw, LucideSave } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TableDataContentProps {
  tableName: string;
}

export default function TableDataContent({ tableName }: TableDataContentProps) {
  const { databaseDriver } = useDatabaseDriver();
  const [data, setData] = useState<hrana.RowsResult | null>(null);

  useEffect(() => {
    databaseDriver
      .selectFromTable(tableName, {
        limit: 50,
        offset: 0,
      })
      .then(setData)
      .catch(console.error);
  }, [databaseDriver, tableName]);

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
        </div>
        <Separator />
      </div>
      <div className="flex-grow overflow-hidden">
        {data ? <ResultTable data={data} /> : null}
      </div>
    </div>
  );
}
