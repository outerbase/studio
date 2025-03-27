// import { Button, buttonVariants } from "../../ui/button";
import { Button } from "@/components/orbit/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFormatHandlers } from "@/lib/export-helper";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import OptimizeTableState, {
  TableSelectionRange,
} from "../table-optimized/optimize-table-state";

export type ExportTarget = "clipboard" | "file";
export type ExportFormat = "csv" | "delimited" | "json" | "sql" | "xlsx";
export type ExportSelection =
  | "complete"
  | "selected_row"
  | "selected_col"
  | "selected_range";
export interface ExportOptions {
  fieldSeparator?: string;
  lineTerminator?: string;
  encloser?: string;
}

interface selectionCount {
  rows: number;
  cols: number;
  ranges: TableSelectionRange[];
}

interface ExportSettings {
  format: ExportFormat;
  target: ExportTarget;
  selection: ExportSelection;
  options?: ExportOptions;
}

export default function ExportResultButton({
  data,
}: {
  data: OptimizeTableState;
}) {
  const csvDelimeter = useMemo(
    () => ({
      fieldSeparator: ",",
      lineTerminator: "\\n",
      encloser: '"',
    }),
    []
  );
  const excelDiliemter = {
    fieldSeparator: "\\t",
    lineTerminator: "\\r\\n",
    encloser: '"',
  };

  const saveSetting = (settings: ExportSettings) => {
    localStorage.setItem("export_settings", JSON.stringify(settings));
  };

  const exportSettings = useCallback(() => {
    const settings = localStorage.getItem("export_settings");
    if (settings) {
      return JSON.parse(settings) as ExportSettings;
    }
    return {
      format: "csv",
      target: "clipboard",
      selection: "complete",
      options: csvDelimeter,
    } as ExportSettings;
  }, [csvDelimeter]);

  const [format, setFormat] = useState<ExportFormat>(exportSettings().format);
  const [exportTarget, setExportTarget] = useState<ExportTarget>(
    exportSettings().target
  );
  const [selectionCount, setSelectionCount] = useState<selectionCount>({
    rows: 0,
    cols: 0,
    ranges: [],
  });
  const [exportSelection, setExportSelection] = useState<ExportSelection>(
    () => {
      const savedSelection = exportSettings().selection;
      return validateExportSelection(savedSelection, selectionCount);
    }
  );
  const [delimitedOptions, setDelimitedOptions] = useState<ExportOptions>(
    exportSettings().options || {
      fieldSeparator: ",",
      lineTerminator: "\\n",
      encloser: '"',
    }
  );
  const [exportOptions, setExportOptions] = useState<ExportOptions | null>(
    () => {
      if (format === "csv") {
        return csvDelimeter;
      } else if (format === "xlsx") {
        return excelDiliemter;
      } else if (format === "delimited") {
        return delimitedOptions;
      } else {
        return null;
      }
    }
  );

  const [selectedRangeIndex, setSelectedRangeIndex] = useState<number>(
    selectionCount.ranges.length > 0 ? 0 : -1
  );
  const [open, setOpen] = useState(false);

  const onExportClicked = useCallback(() => {
    if (!format) return;

    let content = "";

    const formatHandlers = getFormatHandlers(
      data,
      exportTarget,
      exportSelection,
      exportOptions,
      selectedRangeIndex
    );

    const handler = formatHandlers[format];
    if (handler) {
      content = handler();
    }
    setOpen(false);

    if (!content) return;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export.${format === "delimited" ? "csv" : format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    format,
    data,
    exportTarget,
    exportSelection,
    exportOptions,
    selectedRangeIndex,
  ]);

  useEffect(() => {
    const changeCallback = () => {
      setSelectionCount({
        rows: data.getFullSelectionRowsIndex().length,
        cols: data.getFullSelectionColsIndex().length,
        ranges: data.getSelectionRanges(),
      } as selectionCount);
      if (data.getSelectionRanges().length > 0) {
        setSelectedRangeIndex(0);
      }
    };
    data.addChangeListener(changeCallback);
    return () => data.removeChangeListener(changeCallback);
  }, [data]);

  useEffect(() => {
    setExportSelection(
      validateExportSelection(exportSettings().selection, selectionCount)
    );
  }, [exportSettings, selectionCount]);

  useEffect(() => {
    saveSetting({
      ...exportSettings(),
      format,
      selection: exportSelection,
      target: exportTarget,
    });
    if (format === "delimited") {
      saveSetting({
        ...exportSettings(),
        options: exportOptions ?? csvDelimeter,
      });
      if (exportOptions) setDelimitedOptions(exportOptions);
    }
  }, [
    csvDelimeter,
    exportOptions,
    exportSelection,
    exportSettings,
    exportTarget,
    format,
  ]);

  const SelectedRange = ({
    ranges,
    value,
    onChange,
  }: {
    ranges: TableSelectionRange[];
    value?: string;
    onChange: (value: string) => void;
  }) => {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="ml-5 w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ranges.map((range, index) => {
            const value = buildSelectionRangeLabel(range);
            return (
              <SelectItem key={index} value={index.toString()}>
                <small>{value}</small>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={"secondary"} onClick={() => setOpen(!open)}>
          <div className="text-sm">Export</div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w[550px] w-[550px] p-0">
        <div>
          <div className="flex flex-col gap-2 border-b p-4">
            <h1 className="text-lg font-bold">Export</h1>

            <small>Export target</small>

            <RadioGroup
              className="flex gap-4"
              defaultValue={exportTarget}
              onValueChange={(e) => {
                setExportTarget(e as ExportTarget);
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="clipboard" id="export-clipboard" />
                <Label htmlFor="export-clipboard">Copy to clipboard</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="file" id="export-file" />
                <Label htmlFor="export-file">Export to file</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="mb-2 flex grow border-b">
            <div className="flex flex-col border-r p-2 px-4">
              <small>Output format</small>
              <RadioGroup
                className="mt-2 flex flex-col gap-3"
                defaultValue={format}
                onValueChange={(e) => {
                  setFormat(e as ExportFormat);
                  if (e === "csv") {
                    setExportOptions(csvDelimeter);
                  } else if (e === "xlsx") {
                    setExportOptions(excelDiliemter);
                  } else if (e === "delimited") {
                    setExportOptions(delimitedOptions);
                  } else {
                    setExportOptions(null);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="export-format-csv" />
                  <Label
                    htmlFor="export-format-csv"
                    className="flex-1 font-normal"
                  >
                    CSV
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="delimited"
                    id="export-format-delimit"
                  />
                  <Label
                    htmlFor="export-format-delimit"
                    className="flex-1 font-normal"
                  >
                    Delimited Text
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="export-format-json" />
                  <Label
                    htmlFor="export-format-json"
                    className="flex-1 font-normal"
                  >
                    JSON
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sql" id="export-format-sql" />
                  <Label
                    htmlFor="export-format-sql"
                    className="flex-1 font-normal"
                  >
                    SQL
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="xlsx" id="export-format-xlsx" />
                  <Label
                    htmlFor="export-format-xlsx"
                    className="flex-1 font-normal"
                  >
                    Excel
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grow">
              <div className="flex grow flex-col border-b p-2 px-4">
                <small>Selection</small>
                <div>
                  <RadioGroup
                    className="my-2 gap-3"
                    defaultValue={exportSelection}
                    onValueChange={(e) => {
                      setExportSelection(e as ExportSelection);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="complete"
                        id="export-selection-complete"
                      />
                      <Label
                        htmlFor="export-selection-complete"
                        className="flex-1 font-normal"
                      >
                        Complete ({data.getAllRows().length} rows)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="selected_row"
                        id="export-selection-rows"
                        disabled={selectionCount.rows === 0}
                      />
                      <Label
                        htmlFor="export-selection-rows"
                        className="flex-1 font-normal"
                      >
                        Rows ({selectionCount.rows} rows)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="selected_col"
                        id="export-selection-cols"
                        disabled={selectionCount.cols === 0}
                      />
                      <Label
                        htmlFor="export-selection-cols"
                        className="flex-1 font-normal"
                      >
                        Columns ({selectionCount.cols} cols)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="selected_range"
                        id="export-selection-range"
                        disabled={selectionCount.ranges.length === 0}
                      />
                      <Label
                        htmlFor="export-selection-range"
                        className="flex-1 font-normal"
                      >
                        Ranges
                      </Label>
                    </div>

                    {selectionCount.ranges.length > 0 && (
                      <SelectedRange
                        ranges={selectionCount.ranges}
                        value={
                          selectedRangeIndex > 0
                            ? selectedRangeIndex.toString()
                            : "0"
                        }
                        onChange={(value) => {
                          setSelectedRangeIndex(parseInt(value));
                        }}
                      />
                    )}
                  </RadioGroup>
                </div>
              </div>
              <div className="ml-2 flex grow flex-col p-2">
                <small>Options</small>
                <div className="mt-2 flex flex-col space-y-2">
                  <div className="flex items-center space-x-4">
                    <span className="w-[120px] text-sm">Field separator:</span>
                    <div className="flex h-[28px] w-[120px] items-center rounded-md bg-white px-3 py-2.5 text-base text-neutral-900 outline outline-1 outline-neutral-200 focus:outline-neutral-400/70 dark:bg-neutral-900 dark:text-white dark:outline-neutral-800 dark:focus:outline-neutral-600">
                      <input
                        disabled={format !== "delimited"}
                        type="text"
                        className="flex-1 bg-transparent text-sm font-light outline-hidden"
                        value={exportOptions?.fieldSeparator || ""}
                        onChange={(e) => {
                          setExportOptions({
                            ...exportOptions,
                            fieldSeparator: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="w-[120px] text-sm">Line terminator:</span>
                    <div className="flex h-[28px] w-[120px] items-center rounded-md bg-white px-3 py-2.5 text-base text-neutral-900 outline outline-1 outline-neutral-200 focus:outline-neutral-400/70 dark:bg-neutral-900 dark:text-white dark:outline-neutral-800 dark:focus:outline-neutral-600">
                      <input
                        disabled={format !== "delimited"}
                        type="text"
                        className="flex-1 bg-transparent text-sm font-light outline-hidden"
                        value={exportOptions?.lineTerminator || ""}
                        onChange={(e) => {
                          setExportOptions({
                            ...exportOptions,
                            lineTerminator: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="w-[120px] text-sm">Encloser:</span>
                    <div className="flex h-[28px] w-[120px] items-center rounded-md bg-white px-3 py-2.5 text-base text-neutral-900 outline outline-1 outline-neutral-200 focus:outline-neutral-400/70 dark:bg-neutral-900 dark:text-white dark:outline-neutral-800 dark:focus:outline-neutral-600">
                      <input
                        disabled={format !== "delimited"}
                        type="text"
                        className="flex-1 bg-transparent text-sm font-light outline-hidden"
                        value={exportOptions?.encloser || ""}
                        onChange={(e) => {
                          setExportOptions({
                            ...exportOptions,
                            encloser: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-2 px-4 pt-0">
          <Button size="sm" onClick={onExportClicked}>
            Export
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function buildSelectionRangeLabel(range: TableSelectionRange): string {
  if (!range) return "";
  return `Col(${range.x1 + 1}, ${range.x2 + 1}) - Row(${range.y1 + 1}, ${range.y2 + 1})`;
}

function validateExportSelection(
  savedSelection: string | null,
  selectionCount: selectionCount
): ExportSelection {
  if (!savedSelection) {
    return "complete";
  }
  if (savedSelection === "selected_row" && selectionCount.rows === 0) {
    return "complete";
  } else if (savedSelection === "selected_col" && selectionCount.cols === 0) {
    return "complete";
  } else if (
    savedSelection === "selected_range" &&
    selectionCount.ranges.length === 0
  ) {
    return "complete";
  }
  return savedSelection as ExportSelection;
}
