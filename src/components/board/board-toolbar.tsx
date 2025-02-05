import { convertTimeToMilliseconds } from "@/lib/convertNumber";
import { ChevronDown, RefreshCcw } from "lucide-react";
import { useCallback } from "react";
import { buttonVariants } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useBoardContext } from "./board-provider";

interface Props {
  show: boolean;
  interval: number;
  onChange: (interval: number) => void;
  onChangeShow: (show: boolean) => void;
  onRefresh?: () => void;
}

export function BoardToolbar(props: Props) {
  const { setting } = useBoardContext();

  const toggleShow = useCallback(() => {
    props.onChangeShow(!props.show);
  }, [props]);

  console.log(setting);

  return (
    <div className="flex items-center justify-between border border-x-0 px-1 py-2">
      <div>
        <button
          className={buttonVariants({ size: "sm", variant: "ghost" })}
          onClick={toggleShow}
        >
          {props.show ? "Hide" : "Show"} Filter
        </button>
      </div>
      <div>{setting?.name}</div>
      <div>
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
            <button
              className={buttonVariants({ size: "sm", variant: "ghost" })}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={props.interval === 0}
              onClick={() => {
                props.onChange(0);
              }}
            >
              Off
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={props.interval === convertTimeToMilliseconds("5m")}
              onClick={() => {
                props.onChange(convertTimeToMilliseconds("5m"));
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
                    props.onChange(ms);
                  }}
                >
                  {interval}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
