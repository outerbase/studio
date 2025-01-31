"use client";
import { cn } from "@/lib/utils";
import { RectangleHorizontal, Square } from "lucide-react";
import { useCallback } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import { buttonVariants } from "../ui/button";
import "./board-style.css";

export interface BoardChartLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  i: number;
}

interface BoardProps {
  layout: ReactGridLayout.Layout[];
  onChange: (v: ReactGridLayout.Layout[]) => void;
  editMode?: "ADD_CHART" | "REARRANGING_CHART" | null;
}

const ReactGridLayout = WidthProvider(RGL);

export default function Board(props: BoardProps) {
  const sizes = [
    { w: 1, h: 1, name: "1", icon: <Square className="h-3 w-3" /> },
    {
      w: 2,
      h: 1,
      name: "2",
      icon: <RectangleHorizontal className="h-4 w-4" />,
    },
    { w: 2, h: 2, name: "3", icon: <Square className="h-4 w-4" /> },
    {
      w: 4,
      h: 2,
      name: "4",
      icon: <RectangleHorizontal className="h-4 w-4" />,
    },
  ];

  const handleClickResize = useCallback(
    (w: number, h: number, index: number) => {
      const dummy = structuredClone(props.layout);
      dummy[index].w = w;
      dummy[index].h = h;
      props.onChange(dummy);
    },
    [props]
  );

  const mapItem: JSX.Element[] = [...Array(props.layout.length)].map((_, i) => {
    return (
      <div
        key={i}
        className="group dark:bg-secondary relative flex items-center justify-center rounded-md bg-white shadow hover:bg-gray-50 dark:text-white"
        data-grid={_}
      >
        {props.editMode === "REARRANGING_CHART" && (
          <div className="absolute top-4 right-4 z-40 hidden gap-2 group-hover:flex">
            {sizes.map((x, index) => {
              return (
                <button
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "icon" }),
                    "cancelSelectorName h-6 w-6 p-0"
                  )}
                  onClick={() =>
                    handleClickResize(x.w as number, x.h as number, i)
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  key={index}
                >
                  {x.icon}
                </button>
              );
            })}
          </div>
        )}
        <div>{i}</div>
      </div>
    );
  });

  return (
    <div>
      <ReactGridLayout
        cols={4}
        rowHeight={220}
        draggableCancel=".cancelSelectorName"
        className="layout overflow-x-hidden"
        layout={props.layout}
        onLayoutChange={props.onChange}
        isDraggable={props.editMode === "REARRANGING_CHART"}
        isResizable={props.editMode === "REARRANGING_CHART"}
        compactType={"vertical"}
      >
        {mapItem}
      </ReactGridLayout>
    </div>
  );
}
