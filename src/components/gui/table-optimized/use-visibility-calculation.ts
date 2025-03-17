import useElementResize from "@/components/hooks/useElementResize";
import { useCallback, useEffect, useState } from "react";
import { OptimizeTableHeaderWithIndexProps } from ".";
import { getVisibleCellRange } from "./helper";
import OptimizeTableState from "./optimize-table-state";

export default function useTableVisibilityRecalculation({
  containerRef,
  totalRowCount,
  rowHeight,
  renderAhead,
  headers,
  state,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  totalRowCount: number;
  rowHeight: number;
  renderAhead: number;
  headers: OptimizeTableHeaderWithIndexProps[];
  state: OptimizeTableState;
}) {
  const [visibleDebounce, setVisibleDebounce] = useState<{
    rowStart: number;
    rowEnd: number;
    colStart: number;
    colEnd: number;
  }>({
    rowStart: 0,
    rowEnd: 0,
    colStart: 0,
    colEnd: 0,
  });

  const recalculateVisible = useCallback(
    (e: HTMLDivElement) => {
      const headerSizes = state.getHeaderWidth();
      setVisibleDebounce(
        getVisibleCellRange(
          e,
          headers.map((header) => headerSizes[header.index]) as number[],
          totalRowCount,
          rowHeight,
          renderAhead,
          state.gutterColumnWidth
        )
      );
    },
    [setVisibleDebounce, totalRowCount, rowHeight, renderAhead, headers, state]
  );

  const onHeaderResize = useCallback(
    (idx: number, newWidth: number) => {
      if (containerRef.current) {
        state.setHeaderWidth(idx, newWidth);
        recalculateVisible(containerRef.current);
      }
    },
    [state, recalculateVisible, containerRef]
  );

  // Recalculate the visibility again when we scroll the container
  useEffect(() => {
    const ref = containerRef.current;
    if (ref) {
      const onContainerScroll = (e: Event) => {
        recalculateVisible(e.currentTarget as HTMLDivElement);
        e.preventDefault();
        e.stopPropagation();
      };

      containerRef.current.addEventListener("scroll", onContainerScroll);
      return () => ref.removeEventListener("scroll", onContainerScroll);
    }
  }, [containerRef, recalculateVisible]);

  useElementResize<HTMLDivElement>(recalculateVisible, containerRef);

  return { visibileRange: visibleDebounce, onHeaderResize };
}
