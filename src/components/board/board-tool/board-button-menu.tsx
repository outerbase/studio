import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { convertTimeToMilliseconds } from "@/lib/convertNumber";
import { ChevronDown, RefreshCcw } from "lucide-react";
import { useBoardContext } from "../board-provider";

interface Props {
  mode?: "ADD_CHART" | "REARRANGING_CHART" | null;
  interval: number;
  onChangeInterval: (interval: number) => void;
  onRefresh?: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function BoardButtonMenu(props: Props) {
  const { setting, setBoardMode } = useBoardContext();

  if (props.mode === "REARRANGING_CHART") {
    return (
      <div className="flex items-center gap-2">
        <Button variant={"secondary"} size={"sm"} onClick={props.onCancel}>
          Cancel
        </Button>
        <Button variant={"default"} size={"sm"} onClick={props.onSave}>
          Save
        </Button>
      </div>
    );
  }

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
          <div>{props.interval === 0 ? "" : `${props.interval / 1000}s`}</div>
        </div>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={buttonVariants({ size: "sm", variant: "ghost" })}>
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
              props.onChangeInterval(convertTimeToMilliseconds("5m"));
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
          variant={"default"}
          size="sm"
          onClick={() => {
            setBoardMode("ADD_CHART");
          }}
        >
          Add Chart
        </Button>
      </div>
    </div>
  );
}
