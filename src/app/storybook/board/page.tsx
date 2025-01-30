"use client";
import Board from "@/components/board";
import { useState } from "react";
import ReactGridLayout from "react-grid-layout";

export default function StorybookBoardPage() {
  const [layout, setLayout] = useState<ReactGridLayout.Layout[]>([
    { x: 0, y: 0, w: 1, h: 1, i: "0" },
    { x: 1, y: 0, w: 1, h: 1, i: "1" },
    { x: 2, y: 0, w: 1, h: 1, i: "2" },
    { x: 3, y: 0, w: 1, h: 1, i: "3" },
  ]);

  return (
    <div className="bg-secondary min-h-full w-full flex-1">
      <Board layout={layout} onChange={setLayout} />
    </div>
  );
}
