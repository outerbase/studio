import { Button, buttonVariants } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import OptimizeTableState, {
  TableSelectionRange,
} from "../table-optimized/OptimizeTableState";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getFormatHandlers } from "@/components/lib/export-helper";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ExportTarget = "clipboard" | "file";
type ExportFormat = "csv" | "delimited" | "json" | "sql" | "xlsx";
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
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <SelectTrigger className="border-none shadow-none h-[20px] w-[200px]">
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
    <div ref={popoverRef}>
      <Popover open={open}>
        <PopoverTrigger>
          <div
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            onClick={() => setOpen(!open)}
          >
            Export
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 min-w[550px] w-[550px]">
          <div className="p-4">
            <div className="mb-2 font-bold">Export</div>
            <div className="p-2 rounded-md mb-1 border-solid border border-gray-200">
              <small>Export target</small>
              <div className="p-2">
                <RadioGroup
                  defaultValue={exportTarget}
                  onValueChange={(e) => {
                    setExportTarget(e as ExportTarget);
                  }}
                >
                  <div className="flex items-center  space-x-16">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="clipboard" />
                      <small>Copy to clipboard</small>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="file" />
                      <small>Export to file</small>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="rounded-md  flex flex-grow">
              <div className="rounded-md mb-2 flex flex-col flex-grow p-2 w-9 border-solid border border-gray-200">
                <small>Output format</small>
                <div>
                  <RadioGroup
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
                    <div className="p-2">
                      <div className="flex items-center space-x-2 pb-2">
                        <RadioGroupItem value="csv" />
                        <small>CSV</small>
                      </div>
                      <div className="flex items-center space-x-2 pb-2">
                        <RadioGroupItem value="delimited" />
                        <small>DELIMITED TEXT</small>
                      </div>
                      <div className="flex items-center space-x-2 pb-2">
                        <RadioGroupItem value="json" />
                        <small>JSON</small>
                      </div>
                      <div className="flex items-center space-x-2 pb-2">
                        <RadioGroupItem value="sql" />
                        <small>SQL</small>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="xlsx" />
                        <small>EXCEL</small>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div>
                <div className="rounded-md mb-2 flex flex-grow ml-2 p-2 flex-col border-solid border border-gray-200">
                  <small>Selection</small>
                  <div>
                    <RadioGroup
                      defaultValue={exportSelection}
                      onValueChange={(e) => {
                        setExportSelection(e as ExportSelection);
                      }}
                    >
                      <div className="p-2">
                        <div className="flex items-center space-x-2 pb-2">
                          <RadioGroupItem value="complete" />
                          <small>
                            Complete ({data.getAllRows().length} rows)
                          </small>
                        </div>
                        <div className="flex items-center space-x-2 pb-2">
                          <RadioGroupItem
                            value="selected_row"
                            disabled={selectionCount.rows === 0}
                          />
                          <small>Rows ({selectionCount.rows} rows)</small>
                        </div>
                        <div className="flex items-center space-x-2 pb-2">
                          <RadioGroupItem
                            value="selected_col"
                            disabled={selectionCount.cols === 0}
                          />
                          <small>Columns ({selectionCount.cols} cols)</small>
                        </div>
                        <div className="flex items-center space-x-2 pb-2">
                          <RadioGroupItem
                            value="selected_range"
                            disabled={selectionCount.ranges.length === 0}
                          />
                          <small>Ranges</small>
                          <div>
                            {selectionCount.ranges.length > 0 &&
                              SelectedRange({
                                ranges: selectionCount.ranges,
                                value:
                                  selectedRangeIndex >= 0
                                    ? selectedRangeIndex.toString()
                                    : "0",
                                onChange: (value) => {
                                  setSelectedRangeIndex(parseInt(value));
                                },
                              })}
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                <div className="rounded-md mb-2 flex flex-grow ml-2 p-2 flex-col border-solid border border-gray-200">
                  <small>Options</small>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-4">
                      <small className="w-[120px] text-right">
                        Field separator:
                      </small>
                      <div className="flex items-center rounded-md bg-white px-3 py-2.5 text-base text-neutral-900 outline outline-1 outline-neutral-200 focus:outline-neutral-400/70 dark:bg-neutral-900 dark:text-white dark:outline-neutral-800 dark:focus:outline-neutral-600 h-[28px] w-[120px]">
                        <input
                          disabled={format !== "delimited"}
                          type="text"
                          className="bg-transparent flex-1 outline-none text-sm font-light"
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
                      <small className="w-[120px] text-right">
                        Line terminator:
                      </small>
                      <div className="flex items-center rounded-md bg-white px-3 py-2.5 text-base text-neutral-900 outline outline-1 outline-neutral-200 focus:outline-neutral-400/70 dark:bg-neutral-900 dark:text-white dark:outline-neutral-800 dark:focus:outline-neutral-600 h-[28px] w-[120px]">
                        <input
                          disabled={format !== "delimited"}
                          type="text"
                          className="bg-transparent flex-1 outline-none text-sm font-light"
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
                      <small className="w-[120px] text-right">Encloser:</small>
                      <div className="flex items-center rounded-md bg-white px-3 py-2.5 text-base text-neutral-900 outline outline-1 outline-neutral-200 focus:outline-neutral-400/70 dark:bg-neutral-900 dark:text-white dark:outline-neutral-800 dark:focus:outline-neutral-600 h-[28px] w-[120px]">
                        <input
                          disabled={format !== "delimited"}
                          type="text"
                          className="bg-transparent flex-1 outline-none text-sm font-light"
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
          <div className="p-2 pt-0 px-4">
            <Button size="sm" onClick={onExportClicked}>
              Export
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
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
