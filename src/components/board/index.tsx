import { BoardSourceDriver } from "@/drivers/board-source/base-source";
import { useState } from "react";
import { BoardCanvas } from "./board-canvas";
import { BoardFilter } from "./board-filter";
import { BoardFilterProps } from "./board-filter-dialog";
import { BoardProvider } from "./board-provider";

interface DashboardProps {
  layout: ReactGridLayout.Layout[];
  data: {
    filters: BoardFilterProps[];
  };
}

interface Props {
  value: DashboardProps;
  sources?: BoardSourceDriver;
  setValue: (value: DashboardProps) => void;
}

export default function Board({ value, setValue, sources }: Props) {
  const [editMode, setEditMode] = useState<
    "ADD_CHART" | "REARRANGING_CHART" | null
  >(null);

  return (
    <BoardProvider sources={sources}>
      <div>
        <BoardFilter
          filters={value.data.filters}
          onFilters={(v) =>
            setValue({
              ...value,
              data: {
                ...value.data,
                filters: v,
              },
            })
          }
          editMode={editMode}
          setEditMode={setEditMode}
        />
        <BoardCanvas
          layout={value.layout}
          onChange={(v) => {
            setValue({
              ...value,
              layout: v,
            });
          }}
          editMode={editMode}
        />
      </div>
    </BoardProvider>
  );
}
