"use client";
import { Button } from "@/components/orbit/button";
import { ChartLine, ImageUpscale } from "lucide-react";
import { useBoardContext } from "../board-provider";

export function BoardTool() {
  const { boardMode, setBoardMode } = useBoardContext();

  if (boardMode?.mode === "ADD_CHART") {
    return null;
  }

  return (
    <div className="reveal animate-revealMenu sticky bottom-6 mx-auto flex w-[75px] gap-1 rounded-xl bg-neutral-800 p-1 text-neutral-100 shadow-lg dark:bg-white dark:text-neutral-900">
      <Button
        variant="primary"
        shape="square"
        onClick={() => setBoardMode({ mode: "ADD_CHART" })}
      >
        <ChartLine className="h-4 w-4" />
      </Button>

      <Button
        shape="square"
        variant="primary"
        onClick={() =>
          setBoardMode(boardMode?.mode ? null : { mode: "REARRANGING_CHART" })
        }
        toggled={boardMode?.mode === "REARRANGING_CHART"}
      >
        <ImageUpscale className="h-4 w-4" />
      </Button>
    </div>
  );
}
