import { produce } from "immer";
import { DashboardProps } from "..";

interface Props {
  value: DashboardProps;
  onChange: (v: DashboardProps) => void;
  onSave: () => void;
}

export function BoardTitleMenu(props: Props) {
  return (
    <div className="flex items-center">
      <input
        value={props.value.name}
        className="truncate bg-inherit text-center outline-0"
        onChange={(e) =>
          props.onChange(
            produce(props.value, (draft) => {
              draft.name = e.target.value;
            })
          )
        }
        onBlur={props.onSave}
      />
    </div>
  );
}
