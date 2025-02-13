import { useCallback } from "react";
import { DashboardProps } from "..";
import { buttonVariants } from "../../ui/button";
import { BoardButtonMenu } from "./board-button-menu";
import { BoardTitleMenu } from "./board-title-menu";

interface Props {
  show: boolean;
  interval: number;
  onChange: (interval: number) => void;
  onChangeShow: (show: boolean) => void;
  onRefresh?: () => void;
  mode?: "ADD_CHART" | "REARRANGING_CHART" | null;
  onSave: () => void;
  onCancel: () => void;
  value: DashboardProps;
  onChangeValue: (v: DashboardProps) => void;
}

export function BoardToolbar(props: Props) {
  const toggleShow = useCallback(() => {
    props.onChangeShow(!props.show);
  }, [props]);

  return (
    <div className="flex items-center justify-between border border-x-0 px-1 py-2">
      <div className="w-1/3">
        <button
          className={buttonVariants({ size: "sm", variant: "ghost" })}
          onClick={toggleShow}
        >
          {props.show ? "Hide" : "Show"} Filter
        </button>
      </div>
      <div className="flex w-1/3 justify-center">
        <BoardTitleMenu
          value={props.value}
          onChange={props.onChangeValue}
          onSave={props.onSave}
        />
      </div>
      <div className="flex w-1/3 items-end justify-end">
        <BoardButtonMenu
          interval={props.interval}
          onChangeInterval={props.onChange}
          onRefresh={props.onRefresh}
          onCancel={props.onCancel}
          onSave={props.onSave}
        />
      </div>
    </div>
  );
}
