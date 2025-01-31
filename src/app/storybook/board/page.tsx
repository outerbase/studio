"use client";
import Board from "@/components/board";
import { BoardFilter } from "@/components/board/board-filter";
import { BoardFilterProps } from "@/components/board/board-filter-dialog";
import { BoardTool } from "@/components/board/board-tool";
import { useState } from "react";
import ReactGridLayout from "react-grid-layout";

interface DashboardProps {
  layout: ReactGridLayout.Layout[];
  data: {
    filters: BoardFilterProps[];
  };
}

export default function StorybookBoardPage() {
  const [editMode, setEditMode] = useState<
    "ADD_CHART" | "REARRANGING_CHART" | null
  >(null);
  const [value, setValue] = useState<DashboardProps>({
    layout: [
      { x: 0, y: 0, w: 1, h: 1, i: "0" },
      { x: 1, y: 0, w: 1, h: 1, i: "1" },
      { x: 2, y: 0, w: 1, h: 1, i: "2" },
      { x: 3, y: 0, w: 1, h: 1, i: "3" },
    ],
    data: { filters: [] },
  });

  console.log(value);

  return (
    <div className="min-h-full w-full flex-1">
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
      />
      <BoardTool editMode={editMode} setEditMode={setEditMode} />
      <Board
        layout={value.layout}
        onChange={(v) =>
          setValue({
            ...value,
            layout: v,
          })
        }
        editMode={editMode}
      />
    </div>
  );
}
