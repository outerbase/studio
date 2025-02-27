import { CircularProgressBar } from "@/components/circular-progress-bar";
import { Button } from "@/components/orbit/button";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { convertTimeToMilliseconds } from "@/lib/convertNumber";
import { cn } from "@/lib/utils";
import { ChevronDown, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useBoardContext } from "../board-provider";

interface Props {
  interval: number;
  onChangeInterval: (interval: number) => void;
  onRefresh?: () => void;
  onSave: () => void;
  onCancel: () => void;
}

function useAutoRefresh(interval: number) {
  const [isActive, setIsActive] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [timeLeft, setTimeLeft] = useState(interval / 1000);

  useEffect(() => {
    setIsReset(true);
    setTimeLeft(0);
  }, [interval]);

  useEffect(() => {
    if (interval > 0 && isReset) {
      setTimeLeft(interval / 1000);
      setIsActive(true);
      setIsReset(false);
    }
  }, [interval, isReset]);

  useEffect(() => {
    if (timeLeft > 0 && isActive) {
      const run = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsReset(true);
            clearInterval(run);
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);

      return () => clearInterval(run);
    }
  }, [interval, isActive, timeLeft]);

  return timeLeft;
}

export function BoardButtonMenu(props: Props) {
  const { setting, setBoardMode, boardMode } = useBoardContext();
  const timeleft = useAutoRefresh(props.interval);

  if (boardMode?.mode === "REARRANGING_CHART") {
    return (
      <div className="flex items-center gap-2">
        <Button variant={"secondary"} onClick={props.onCancel}>
          Cancel
        </Button>
        <Button variant={"primary"} onClick={props.onSave}>
          Save
        </Button>
      </div>
    );
  }

  const autoIntervalSelected = setting?.autoRefresh.find(
    (f) => convertTimeToMilliseconds(f) === props.interval
  );

  const progress = (timeleft * 100000) / props.interval;

  return (
    <div className="flex gap-2">
      <button
        className={buttonVariants({ size: "sm", variant: "ghost" })}
        onClick={() => {
          props.onRefresh && props.onRefresh();
        }}
      >
        <div className="flex items-center gap-2">
          <div>
            <RefreshCcw className="h-4 w-4" />
          </div>
        </div>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              buttonVariants({ size: "sm", variant: "ghost" }),
              "gap-2"
            )}
          >
            {props.interval > 0 && (
              <div className="relative h-4 w-4 pt-[3%]">
                <CircularProgressBar
                  value={progress}
                  size={15}
                  strokeWidth={3}
                />
              </div>
            )}
            {props.interval > 0 && <div>{autoIntervalSelected}</div>}
            <ChevronDown className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem
            checked={props.interval === 0}
            onClick={() => {
              props.onChangeInterval(0);
            }}
          >
            Off
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={props.interval === convertTimeToMilliseconds("5m")}
            onClick={() => {
              const time = convertTimeToMilliseconds("5m");
              props.onChangeInterval(time);
            }}
          >
            Auto
          </DropdownMenuCheckboxItem>
          {setting?.autoRefresh.map((interval) => {
            const ms = convertTimeToMilliseconds(interval);
            return (
              <DropdownMenuCheckboxItem
                key={interval}
                checked={props.interval === ms}
                onClick={() => {
                  props.onChangeInterval(ms);
                }}
              >
                {interval}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      <div>
        <Button
          variant={"primary"}
          onClick={() => {
            setBoardMode({
              mode: "ADD_CHART",
            });
          }}
        >
          Add Chart
        </Button>
      </div>
    </div>
  );
}
