import { Button, buttonVariants } from "../../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import type OptimizeTableState from "../table-optimized/OptimizeTableState";
import { useCallback, useState } from "react";
import { getFormatHandlers } from "@/components/lib/export-helper";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function ExportResultButton({
  data,
}: {
  data: OptimizeTableState;
}) {
  const [format, setFormat] = useState<string>("sql");

  const ExportSelectionType = {
    Complete: "complete",
    Selected: "selected",
  } as const;

  type ExportSelectionType =
    (typeof ExportSelectionType)[keyof typeof ExportSelectionType];

  const [exportSelection, setExportSelection] = useState<ExportSelectionType>(
    ExportSelectionType.Complete
  );

  const [tableName, setTableName] = useState<string>("UnknownTable");

  const onExportClicked = useCallback(() => {
    if (!format) return;

    let content = "";
    const headers = data.getHeaders().map((header) => header.name);

    let records;
    if (exportSelection === ExportSelectionType.Complete) {
      records = data
        .getAllRows()
        .map((row) => headers.map((header) => row.raw[header]));
    } else {
      records = data
        .getSelectedRows()
        .map((row) => headers.map((header) => row.raw[header]));
    }

    const exportTableName = tableName.trim() || "UnknownTable";

    const formatHandlers = getFormatHandlers(records, headers, exportTableName);

    const handler = formatHandlers[format];
    if (handler) {
      content = handler();
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [format, data, exportSelection, ExportSelectionType.Complete, tableName]);

  return (
    <Dialog open>
      <DialogTrigger>
        <div className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Export
        </div>
      </DialogTrigger>
      <DialogContent className="p-0">
        <DialogTitle className="p-4">Export</DialogTitle>

        <div className="flex flex-col gap-4">
          <div className="px-4 flex flex-col gap-4">
            <Label>Output Format</Label>
            <Select onValueChange={setFormat} value={format}>
              <SelectTrigger>
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sql">SQL</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectSeparator />
                <SelectItem value="markdown">Markdown Table</SelectItem>
                <SelectItem value="ascii">Ascii Table</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <div
                className={cn(
                  buttonVariants({
                    variant:
                      exportSelection === ExportSelectionType.Complete
                        ? "default"
                        : "outline",
                  }),
                  "h-auto items-start cursor-pointer"
                )}
                onClick={() => setExportSelection(ExportSelectionType.Complete)}
              >
                <div>
                  <div>Complete</div>
                  <div className="text-xs">{data.getAllRows().length} rows</div>
                </div>
              </div>

              <div
                className={cn(
                  buttonVariants({
                    variant:
                      exportSelection === ExportSelectionType.Selected
                        ? "default"
                        : "outline",
                  }),
                  "h-auto items-start cursor-pointer"
                )}
                onClick={() => setExportSelection(ExportSelectionType.Selected)}
              >
                <div>
                  <div>Selected</div>
                  <div className="text-xs">
                    {data.getSelectedRows().length} rows
                  </div>
                </div>
              </div>
            </div>
          </div>

          {format === "sql" && (
            <div className="px-4 flex flex-col gap-2 border-t pt-3">
              <Label>Additional Parameters</Label>

              <div className="flex gap-2 mt-2">
                <div className="flex flex-col gap-1 flex-grow">
                  <span className="text-xs">Table Name</span>
                  <Input
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="UnknownTable"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs">Batch Size</span>
                  <Input value="1" />
                </div>
              </div>
            </div>
          )}

          {format === "markdown" && (
            <div className="px-4 flex flex-col gap-2 border-t pt-3">
              <Label>Additional Parameters</Label>

              <div className="flex gap-2 mt-2">
                <div className="flex flex-col gap-1 flex-grow">
                  <span className="text-xs">Cell Text Limit</span>
                  <Input value="50" />
                </div>
              </div>
            </div>
          )}

          {format === "ascii" && (
            <div className="px-4 flex flex-col gap-2 border-t pt-3">
              <Label>Additional Parameters</Label>

              <div className="flex gap-2 mt-2">
                <div className="flex flex-col gap-1 flex-grow">
                  <span className="text-xs">Cell Text Limit</span>
                  <Input value="50" />
                </div>
              </div>
            </div>
          )}

          <div className="px-4 flex flex-col gap-4 border-t pt-3">
            <Label>Output Target</Label>
            <div className="flex gap-2">
              <Button>File</Button>
              <Button variant={"outline"}>Clipboard</Button>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t">
          <Button onClick={onExportClicked}>Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
