import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
import * as hrana from "@libsql/hrana-client";
import { useEffect, useMemo, useRef, useState } from "react";
import ResultTable from "@/components/result/ResultTable";
import { Button } from "@/components/ui/button";
import { LucidePlusCircle, LucideRefreshCcw } from "lucide-react";
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
    <div className="flex flex-col">
      <div className="flex-shrink-0 flex-grow-0">
        <div className="flex p-1">
          <Button variant={"ghost"}>
            <LucidePlusCircle className="w-4 h-4 mr-2 text-green-600" />
            Add
          </Button>

          <Button variant={"ghost"}>
            <LucideRefreshCcw className="w-4 h-4 mr-2 text-green-600" />
            Refresh
          </Button>
        </div>
        <Separator />
      </div>
      <div className="flex-grow">
        {data ? <ResultTable data={data} /> : null}
      </div>
    </div>
  );
}
