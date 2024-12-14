import { Button, buttonVariants } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import OptimizeTableState from "../table-optimized/OptimizeTableState";
import { useCallback, useState } from "react";
import { getFormatHandlers } from "@/components/lib/export-helper";

export default function ExportResultButton({
  data,
}: {
  data: OptimizeTableState;
}) {
  const [format, setFormat] = useState<string | null>(null);

  const onExportClicked = useCallback(() => {
    if (!format) return;

    let content = "";
    const headers = data.getHeaders().map((header) => header.name);
    const records = data
      .getAllRows()
      .map((row) => headers.map((header) => row.raw[header]));

    const tableName = "UnknownTable"; //TODO: replace with actual table name

    const formatHandlers = getFormatHandlers(records, headers, tableName);

    const handler = formatHandlers[format];
    if (handler) {
      content = handler();
    }

    if (!content) return;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [format, data]);

  return (
    <Popover>
      <PopoverTrigger>
        <div className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Export
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <div className="p-4">
          <div className="mb-2 font-bold">Export</div>
          <Select onValueChange={setFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Select export format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="sql">SQL</SelectItem>
              <SelectItem value="xlsx">EXCEL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="p-2 pt-0 px-4">
          <Button size="sm" onClick={onExportClicked}>
            Export
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
