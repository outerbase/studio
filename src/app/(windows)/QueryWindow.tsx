import { useState } from "react";
import { splitQuery, sqliteSplitterOptions } from "dbgate-query-splitter";
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
import { useAutoComplete } from "@/context/AutoCompleteProvider";
import { MultipleQueryProgress, multipleQuery } from "@/lib/multiple-query";
import QueryProgressLog from "../(components)/QueryProgressLog";
import OptimizeTableState from "../(components)/OptimizeTable/OptimizeTableState";

export default function QueryWindow() {
  const { schema } = useAutoComplete();
  const { databaseDriver } = useDatabaseDriver();
  const [code, setCode] = useState("");
  const [data, setData] = useState<OptimizeTableState>();
  const [progress, setProgress] = useState<MultipleQueryProgress>();

  const onRunClicked = () => {
    const statements = splitQuery(code, {
      ...sqliteSplitterOptions,
      adaptiveGoSplit: true,
    }).map((statement) => statement.toString());

    // Reset the result and make a new query
    setData(undefined);
    setProgress(undefined);

    multipleQuery(databaseDriver, statements, (currentProgrss) => {
      setProgress(currentProgrss);
    })
      .then(({ last }) => {
        if (last) {
          setData(OptimizeTableState.createFromResult(last));
        }
      })
      .catch(console.error);
  };

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel style={{ position: "relative" }}>
        <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col">
          <div className="flex-grow overflow-hidden">
            <SqlEditor value={code} onChange={setCode} schema={schema} />
          </div>
          <div className="flex-grow-0 flex-shrink-0">
            <Separator />
            <div className="flex gap-2 p-1">
              <Button variant={"ghost"} onClick={onRunClicked}>
                <LucidePlay className="w-4 h-4 mr-2" />
                Run
              </Button>
            </div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} style={{ position: "relative" }}>
        {data && <ResultTable data={data} />}
        {!data && progress && (
          <div className="w-full h-full overflow-y-auto overflow-x-hidden">
            <QueryProgressLog progress={progress} />
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
