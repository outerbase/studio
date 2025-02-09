import { useCallback } from "react";
import { buttonVariants } from "../../ui/button";
import { useBoardContext } from "../board-provider";
import { BoardButtonMenu } from "./board-button-menu";

interface Props {
  show: boolean;
  interval: number;
  onChange: (interval: number) => void;
  onChangeShow: (show: boolean) => void;
  onRefresh?: () => void;
  mode?: "ADD_CHART" | "REARRANGING_CHART" | null;
  onSave: () => void;
  onCancel: () => void;
}

export function BoardToolbar(props: Props) {
  const { setting } = useBoardContext();

  const toggleShow = useCallback(() => {
    props.onChangeShow(!props.show);
  }, [props]);

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
      <BoardButtonMenu
        interval={props.interval}
        mode={props.mode}
        onChangeInterval={props.onChange}
        onRefresh={props.onRefresh}
        onCancel={props.onCancel}
        onSave={props.onSave}
      />
    </div>
  );
}
