import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import OptimizeTableState from "../table-optimized/OptimizeTableState";
import { useCallback } from "react";

export default function ExportResultButton({
  data,
}: {
  data: OptimizeTableState;
}) {
  const onExportClicked = useCallback(() => {
    // do something here
    // data has all the information you need to do.
  }, []);

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost" size={"sm"}>
          Export
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <div className="p-4">
          <div className="mb-2 font-bold">Export</div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select export format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="sql">SQL</SelectItem>
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
