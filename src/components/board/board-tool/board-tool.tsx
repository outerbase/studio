import { Button } from "@/components/orbit/button";
import { ChartLine, ImageUpscale } from "lucide-react";
import { useBoardContext } from "../board-provider";

export function BoardTool() {
  const { boardMode, setBoardMode, refMainBoard } = useBoardContext();

  if (boardMode?.mode === "ADD_CHART") {
    return null;
  }

  if (!refMainBoard.current) {
    return null;
  }

  const rect = refMainBoard.current.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;

  return (
    <div
      style={{ left: centerX }}
      className="reveal animate-revealMenu fixed bottom-6 z-100 flex -translate-x-[50%] gap-1 rounded-xl bg-neutral-800 p-1 text-neutral-100 shadow-lg dark:bg-white dark:text-neutral-900"
    >
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
