"use client";
import { cn } from "@/lib/utils";
import { RectangleHorizontal, Square } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
  onChangeLayout: (v: ReactGridLayout.Layout[]) => void;
}

const ReactGridLayout = WidthProvider(RGL);

export default function Board({ value }: { value: BoardProps }) {
  const [layout, setLayout] = useState<ReactGridLayout.Layout[]>([]);

  useEffect(() => {
    if (value.layout) {
      setLayout(value.layout);
    }
  }, [value]);

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
      const dummy = [...value.layout];
      dummy[index].w = w;
      dummy[index].h = h;
      value.onChangeLayout(dummy);
    },
    [value]
  );

  const mapItem: JSX.Element[] = [...Array(value.layout.length)].map((_, i) => {
    return (
      <div
        key={i}
        className="group dark:bg-background relative flex items-center justify-center bg-white hover:bg-gray-50 dark:text-white"
        data-grid={_}
      >
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
        <div>{i}</div>
      </div>
    );
  });

  return (
    <div>
      <div className="p-4">
        <div>Display as [x, y, w, h]:</div>
        <div style={{ display: "flex", gap: 7 }}>
          {value.layout.map((l) => {
            return (
              <div className="layoutItem" key={l.i}>
                <b>{l.i}</b>
                {`: [${l.x}, ${l.y}, ${l.w}, ${l.h}]`}
              </div>
            );
          })}
        </div>
      </div>
      <ReactGridLayout
        cols={4}
        rowHeight={220}
        draggableCancel=".cancelSelectorName"
        className="layout"
        layout={layout}
        onLayoutChange={setLayout}
        isDraggable
        isResizable
        compactType={"horizontal"}
      >
        {mapItem}
      </ReactGridLayout>
    </div>
  );
}
