import { LucideCheck, LucideChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { buttonVariants } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import ListButtonItem from "../list-button-item";
import OptimizeTableState, {
  AggregateFunction,
} from "../table-optimized/optimize-table-state";
export interface AggregateResult {
  sum: number | string | undefined;
  avg: number | string | undefined;
  min: number | string | undefined;
  max: number | string | undefined;
  count: number | string | undefined;
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

  const [defaultFunction, setDefaultFunction] = useState<AggregateFunction>(
    data.getDefaultAggregateFunction()
  );
  useEffect(() => {
    const changeCallback = () => {
      setResult({
        ...(data.getSelectionAggregatedResult() as AggregateResult),
      });
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
      data.setDefaultAggregateFunction(functionName);
    },
    [data]
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
