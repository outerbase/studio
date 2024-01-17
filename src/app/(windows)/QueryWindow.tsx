import * as hrana from "@libsql/hrana-client";
import { useState } from "react";
import { splitQuery } from "dbgate-query-splitter";
import { LucidePlay } from "lucide-react";
import SqlEditor from "@/components/SqlEditor";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
import ResultTable from "@/components/result/ResultTable";

export default function QueryWindow() {
  const { databaseDriver } = useDatabaseDriver();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<hrana.RowsResult | null>(null);

  const onRunClicked = () => {
    const statements = splitQuery(code).map((statement) =>
      statement.toString()
    );

    databaseDriver
      .multipleQuery(statements)
      .then(setResult)
      .catch(console.error);
  };

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel style={{ position: "relative" }}>
        <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col">
          <div className="flex-grow overflow-hidden">
            <SqlEditor value={code} onChange={setCode} />
          </div>
          <div className="flex-grow-0 flex-shrink-0">
            <Separator />
            <div className="flex gap-2 p-2">
              <Button variant={"ghost"} onClick={onRunClicked}>
                <LucidePlay className="w-4 h-4 mr-2" />
                Run
              </Button>
            </div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80}>
        {result ? <ResultTable data={result} /> : null}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
