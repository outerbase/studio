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
import { useCallback, useEffect, useState } from "react";
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

const csvDelimeter = {
  fieldSeparator: ",",
  lineTerminator: "\\n",
  encloser: '"',
  nullValue: "NULL",
};
const excelDelimeter = {
  fieldSeparator: "\\t",
  lineTerminator: "\\r\\n",
  encloser: '"',
  nullValue: "NULL",
};

const textDelimeter = {
  fieldSeparator: "\\t",
  lineTerminator: "\\n",
  encloser: '"',
  nullValue: "NULL",
};
export interface ExportOptions {
  fieldSeparator?: string;
  lineTerminator?: string;
  encloser?: string;
  nullValue?: string;
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
  formatTemplate?: Record<string, ExportOptions>;
}

export default function ExportResultButton({
  data,
}: {
  data: OptimizeTableState;
}) {
  const getDefaultOption = useCallback((format: ExportFormat) => {
    switch (format) {
      case "csv":
        return csvDelimeter;
      case "xlsx":
        return excelDelimeter;
      case "delimited":
        return textDelimeter;
      default:
        return null;
    }
  }, []);
  const saveSettingToStorage = (settings: ExportSettings) => {
    settings.formatTemplate = {
      ...settings.formatTemplate,
      ...(settings.options ? { [settings.format]: settings.options } : {}),
    };
    localStorage.setItem("export_settings", JSON.stringify(settings));
  };

  const getSettingFromStorage = useCallback(() => {
    const settings = localStorage.getItem("export_settings");
    if (settings) {
      const settingValue = JSON.parse(settings) as ExportSettings;
      return {
        ...settingValue,
        options:
          settingValue.formatTemplate?.[settingValue.format] || csvDelimeter,
      };
    }
    return {
      format: "csv",
      target: "clipboard",
      selection: "complete",
      options: getDefaultOption("csv"),
    } as ExportSettings;
  }, [getDefaultOption]);

  const [exportSetting, setExportSetting] = useState<ExportSettings>(
    getSettingFromStorage()
  );

  const [selectionCount, setSelectionCount] = useState<selectionCount>({
    rows: 0,
    cols: 0,
    ranges: [],
  });
  const [exportSelection, setExportSelection] = useState<ExportSelection>(
    () => {
      const savedSelection = exportSetting.selection;
      return validateExportSelection(savedSelection, selectionCount);
    }
  );

  const [selectedRangeIndex, setSelectedRangeIndex] = useState<number>(
    selectionCount.ranges.length > 0 ? 0 : -1
  );
  const [open, setOpen] = useState(false);

  const onExportClicked = useCallback(() => {
    if (!exportSetting.format) return;

    let content = "";

    const formatHandlers = getFormatHandlers(
      data,
      exportSetting.target,
      exportSelection,
      exportSetting.options!,
      selectedRangeIndex
    );

    const handler = formatHandlers[exportSetting.format];
    if (handler) {
      content = handler();
    }
    setOpen(false);

    if (!content) return;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export.${exportSetting.format === "delimited" ? "csv" : exportSetting.format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [
    exportSetting.format,
    exportSetting.target,
    exportSetting.options,
    data,
    exportSelection,
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
      validateExportSelection(exportSetting.selection, selectionCount)
    );
  }, [exportSetting, selectionCount]);

  useEffect(() => {
    saveSettingToStorage(exportSetting);
  }, [exportSelection, exportSetting]);

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
              defaultValue={exportSetting.target}
              onValueChange={(e) => {
                setExportSetting((prev) => ({
                  ...prev,
                  target: e as ExportTarget,
                }));
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
                defaultValue={exportSetting.format}
                onValueChange={(e) => {
                  setExportSetting((prev) => ({
                    ...prev,
                    format: e as ExportFormat,
                    options: exportSetting.formatTemplate?.[
                      e as ExportFormat
                    ] || {
                      ...getDefaultOption(e as ExportFormat),
                    },
                  }));
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
                        disabled={exportSetting.format !== "delimited"}
                        type="text"
                        className="flex-1 bg-transparent text-sm font-light outline-hidden"
                        value={exportSetting.options?.fieldSeparator || ""}
                        onChange={(e) => {
                          setExportSetting({
                            ...exportSetting,
                            options: {
                              ...exportSetting.options,
                              fieldSeparator: e.target.value,
                            },
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="w-[120px] text-sm">Line terminator:</span>
                    <div className="flex h-[28px] w-[120px] items-center rounded-md bg-white px-3 py-2.5 text-base text-neutral-900 outline outline-1 outline-neutral-200 focus:outline-neutral-400/70 dark:bg-neutral-900 dark:text-white dark:outline-neutral-800 dark:focus:outline-neutral-600">
                      <input
                        disabled={exportSetting.format !== "delimited"}
                        type="text"
                        className="flex-1 bg-transparent text-sm font-light outline-hidden"
                        value={exportSetting.options?.lineTerminator || ""}
                        onChange={(e) => {
                          setExportSetting({
                            ...exportSetting,
                            options: {
                              ...exportSetting.options,
                              lineTerminator: e.target.value,
                            },
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="w-[120px] text-sm">Encloser:</span>
                    <div className="flex h-[28px] w-[120px] items-center rounded-md bg-white px-3 py-2.5 text-base text-neutral-900 outline outline-1 outline-neutral-200 focus:outline-neutral-400/70 dark:bg-neutral-900 dark:text-white dark:outline-neutral-800 dark:focus:outline-neutral-600">
                      <input
                        disabled={exportSetting.format !== "delimited"}
                        type="text"
                        className="flex-1 bg-transparent text-sm font-light outline-hidden"
                        value={exportSetting.options?.encloser || ""}
                        onChange={(e) => {
                          setExportSetting({
                            ...exportSetting,
                            options: {
                              ...exportSetting.options,
                              encloser: e.target.value,
                            },
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="w-[120px] text-sm">NULL Value:</span>
                    <div className="flex h-[28px] w-[120px] items-center rounded-md bg-white px-3 py-2.5 text-base text-neutral-900 outline outline-1 outline-neutral-200 focus:outline-neutral-400/70 dark:bg-neutral-900 dark:text-white dark:outline-neutral-800 dark:focus:outline-neutral-600">
                      <input
                        type="text"
                        className="flex-1 bg-transparent text-sm font-light outline-hidden"
                        value={exportSetting.options?.nullValue || ""}
                        onChange={(e) => {
                          setExportSetting({
                            ...exportSetting,
                            options: {
                              ...exportSetting.options,
                              nullValue: e.target.value,
                            },
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
