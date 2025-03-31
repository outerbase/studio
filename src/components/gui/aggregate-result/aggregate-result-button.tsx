import { formatNumber } from "@/lib/convertNumber";
import { LucideCheck, LucideChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { buttonVariants } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import ListButtonItem from "../list-button-item";
import OptimizeTableState from "../table-optimized/optimize-table-state";

export type AggregateFunction = "sum" | "avg" | "min" | "max" | "count";
export interface AggregateResult {
  sum: number | string | undefined;
  avg: number | string | undefined;
  min: number | string | undefined;
  max: number | string | undefined;
  count: number | string | undefined;
}

function isValidDate(value: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) return false;

  const parsedDate = new Date(value);
  return !isNaN(parsedDate.getTime());
}

function isValidDateTime(value: string): boolean {
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (!dateTimeRegex.test(value)) return false;

  const parsedDate = new Date(value);
  return !isNaN(parsedDate.getTime());
}

function calculateAggregateResult(data: OptimizeTableState): AggregateResult {
  let sum: number | string | undefined = undefined;
  let avg: number | string | undefined = undefined;
  let min: number | string | undefined = undefined;
  let max: number | string | undefined = undefined;
  let detectedDataType: undefined | "date" | "number" | "string" = undefined;

  const ranges = data.getSelectionRanges();

  // Process selected cells across all ranges, avoiding duplicates
  // by tracking cell coordinates in a Set before collecting values
  const selectedCell = new Set<string>();
  const values: unknown[] = [];
  for (const range of ranges) {
    for (let x = range.x1; x <= range.x2; x++) {
      for (let y = range.y1; y <= range.y2; y++) {
        const key = `${x}-${y}`;

        if (selectedCell.has(key)) {
          continue;
        }

        const value = data.getValue(y, x);

        // We don't have to aggregate empty cells
        if (value === undefined || value === null || value === "") {
          continue;
        }

        selectedCell.add(key);
        values.push(value);
      }
    }
  }

  if (values.length === 0) {
    return {
      sum: undefined,
      avg: undefined,
      min: undefined,
      max: undefined,
      count: selectedCell.size,
    };
  }

  // Sampling the values to detect the data type
  if (!isNaN(Number(values[0]))) {
    detectedDataType = "number";
  } else if (typeof values[0] === "string" && !isNaN(Date.parse(values[0]))) {
    detectedDataType = "date";
  }

  // Aggregate the values based on the detected data type
  if (detectedDataType === "number") {
    for (const value of values) {
      const parsed = Number(value);
      if (!isNaN(parsed)) {
        sum = sum !== undefined ? sum + parsed : parsed;
        min =
          min !== undefined
            ? (min as number) < parsed
              ? min
              : parsed
            : parsed;
        max =
          max !== undefined
            ? (max as number) > parsed
              ? max
              : parsed
            : parsed;
      }
    }
  } else if (detectedDataType === "date") {
    for (const value of values) {
      if (typeof value !== "string") continue;

      if (isValidDate(value) || isValidDateTime(value)) {
        const parsed = Date.parse(value as string);
        if (!isNaN(parsed)) {
          min =
            min !== undefined
              ? Date.parse(min as string) < parsed
                ? min
                : value
              : value;
          max =
            max !== undefined
              ? Date.parse(max as string) > parsed
                ? max
                : value
              : value;
        }
      }
    }
  }

  if (sum !== undefined && values.length > 0) {
    avg = sum / values.length;
  }

  if (detectedDataType === "number") {
    return {
      sum: formatNumber(sum),
      avg: formatNumber(avg),
      min: formatNumber(min as number),
      max: formatNumber(max as number),
      count: selectedCell.size,
    };
  }

  return {
    sum,
    avg,
    min,
    max,
    count: selectedCell.size,
  };
}

export default function AggregateResultButton({
  data,
}: {
  data: OptimizeTableState;
}) {
  const [result, setResult] = useState<AggregateResult>({
    sum: undefined,
    avg: undefined,
    min: undefined,
    max: undefined,
    count: undefined,
  });

  const [defaultFunction, setDefaultFunction] =
    useState<AggregateFunction>("sum");

  useEffect(() => {
    const changeCallback = () => {
      try {
        setResult(calculateAggregateResult(data));
      } catch {
        // It is better to show no result than to crash the application
        setResult({
          sum: undefined,
          avg: undefined,
          min: undefined,
          max: undefined,
          count: undefined,
        });
      }
    };

    data.addChangeListener(changeCallback);
    return () => data.removeChangeListener(changeCallback);
  }, [data]);

  let displayResult = "";

  if (defaultFunction && result[defaultFunction]) {
    displayResult = `${defaultFunction.toUpperCase()}: ${result[defaultFunction]}`;
  } else {
    if (result.sum !== undefined) {
      displayResult = `SUM: ${result.sum}`;
    } else if (result.avg !== undefined) {
      displayResult = `AVG: ${result.avg}`;
    } else if (result.min !== undefined) {
      displayResult = `MIN: ${result.min}`;
    } else if (result.max !== undefined) {
      displayResult = `MAX: ${result.max}`;
    } else if (result.count != undefined) {
      displayResult = `COUNT: ${result.count}`;
    }
  }

  const handleSetDefaultFunction = useCallback(
    (functionName: AggregateFunction) => {
      setDefaultFunction(functionName);
    },
    []
  );

  if (result.count && Number(result.count) <= 1) return null;

  return (
    <Popover>
      <PopoverTrigger>
        <div className={buttonVariants({ variant: "ghost", size: "sm" })}>
          {displayResult}{" "}
          {!!displayResult && <LucideChevronDown className="ml-2 h-4 w-4" />}
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <div className="flex flex-col p-4">
          {!!result.sum && (
            <ListButtonItem
              text={"SUM: " + result.sum}
              icon={defaultFunction === "sum" ? LucideCheck : undefined}
              onClick={function (): void {
                handleSetDefaultFunction("sum");
              }}
            />
          )}
          {!!result.avg && (
            <ListButtonItem
              text={"AVG: " + result.avg}
              icon={defaultFunction === "avg" ? LucideCheck : undefined}
              onClick={function (): void {
                handleSetDefaultFunction("avg");
              }}
            />
          )}
          {!!result.max && (
            <ListButtonItem
              text={"MAX: " + result.max}
              icon={defaultFunction === "max" ? LucideCheck : undefined}
              onClick={function (): void {
                handleSetDefaultFunction("max");
              }}
            />
          )}
          {!!result.min && (
            <ListButtonItem
              text={"MIN: " + result.min}
              icon={defaultFunction === "min" ? LucideCheck : undefined}
              onClick={function (): void {
                handleSetDefaultFunction("min");
              }}
            />
          )}
          {!!result.count && (
            <ListButtonItem
              text={"COUNT: " + result.count}
              icon={defaultFunction === "count" ? LucideCheck : undefined}
              onClick={function (): void {
                handleSetDefaultFunction("count");
              }}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
