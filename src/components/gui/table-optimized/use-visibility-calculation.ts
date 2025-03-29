import useElementResize from "@/components/hooks/useElementResize";
import { useCallback, useEffect, useState } from "react";
import { OptimizeTableHeaderWithIndexProps } from ".";
import OptimizeTableState from "./optimize-table-state";

/**
 * Giving the container, we calculate visible rows and column
 *
 * @param e container elements
 * @param headerSizes size of each headers
 * @param totalRowCount total number of rows
 * @param rowHeight fixed height of each row
 * @param renderAhead number of rows that we need to pre-render ahead
 * @returns
 */
export function getVisibleCellRange(
  e: HTMLDivElement,
  headerSizes: number[],
  totalRowCount: number,
  rowHeight: number,
  renderAhead: number,
  gutterWidth: number
) {
  const currentRowStart = Math.max(
    0,
    Math.floor(e.scrollTop / rowHeight) - 1 - renderAhead
  );
  const currentRowEnd = Math.min(
    totalRowCount,
    currentRowStart +
      Math.ceil(e.getBoundingClientRect().height / rowHeight) +
      renderAhead
  );

  let currentColStart = -1;
  let currentColAccumulateSize = gutterWidth;
  let currentColEnd = -1;

  const visibleXStart = e.scrollLeft;
  const visibleXEnd = visibleXStart + e.getBoundingClientRect().width;

  for (let i = 0; i < headerSizes.length; i++) {
    if (currentColAccumulateSize >= visibleXStart && currentColStart < 0) {
      currentColStart = i - 1;
    }

    currentColAccumulateSize += headerSizes[i] ?? 0;

    if (currentColAccumulateSize >= visibleXEnd && currentColEnd < 0) {
      currentColEnd = i;
      break;
    }
  }

  if (currentColEnd < 0) currentColEnd = headerSizes.length - 1;
  if (currentColStart < 0) currentColStart = 0;
  if (currentColEnd >= headerSizes.length)
    currentColEnd = headerSizes.length - 1;

  return {
    colStart: currentColStart,
    colEnd: currentColEnd,
    rowStart: currentRowStart,
    rowEnd: currentRowEnd,
  };
}

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
