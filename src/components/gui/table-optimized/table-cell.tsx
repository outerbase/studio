import { cn } from "@/lib/utils";
import { ReactElement, useMemo } from "react";
import {
  OptimizeTableCellRenderProps,
  OptimizeTableHeaderWithIndexProps,
} from ".";
import OptimizeTableState from "./optimize-table-state";

export default function OptimizeTableCell<HeaderMetadata = unknown>({
  state,
  header,
  rowIndex,
  colIndex,
  renderCell,
}: {
  state: OptimizeTableState;
  rowIndex: number;
  colIndex: number;
  header: OptimizeTableHeaderWithIndexProps<HeaderMetadata>;
  renderCell: (
    props: OptimizeTableCellRenderProps<HeaderMetadata>
  ) => ReactElement;
}) {
  const { isFocus, isSelected, isBorderBottom, isBorderRight } =
    state.getCellStatus(rowIndex, colIndex);

  const isRemoved = state.isRemovedRow(rowIndex);
  const isNew = state.isNewRow(rowIndex);
  const isChanged = state.hasCellChange(rowIndex, colIndex);
  const isSticky = header.sticky;

  const additionalStyles = useMemo(() => {
    if (!isSticky) return undefined;
    return { zIndex: 15, left: state.gutterColumnWidth + "px" };
  }, [state.gutterColumnWidth, isSticky]);

  let cellBackgroundColor = "bg-background";

  if (isSelected) {
    if (isRemoved) {
      cellBackgroundColor = "bg-red-200 dark:bg-red-800";
    } else if (isChanged) {
      cellBackgroundColor = "bg-yellow-200 dark:bg-yellow-600";
    } else if (isNew) {
      cellBackgroundColor = "bg-green-200 dark:bg-green-700";
    } else {
      cellBackgroundColor = "";
    }
  } else if (isChanged) {
    cellBackgroundColor = "bg-[#ffe693] dark:bg-[#916b20]";
  } else if (isNew) {
    cellBackgroundColor = "bg-green-100 dark:bg-green-900";
  } else if (isRemoved) {
    cellBackgroundColor = "bg-red-100 dark:bg-red-900";
  }

  const cellClassName = cn(
    "overflow-hidden border-r border-b box-border hover:bg-neutral-100 dark:hover:bg-neutral-800",
    isSelected && "border-neutral-950 dark:border-neutral-50",
    isBorderBottom && "border-b border-b-neutral-950 dark:border-b-neutral-50",
    isBorderRight && "border-r border-r-neutral-950 dark:border-r-neutral-50",
    isFocus &&
      "shadow-[0_0_0_1px_rgba(0,0,0,0.5)_inset] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.5)_inset]",
    isSticky && "sticky",
    cellBackgroundColor
  );

  return (
    <td
      className={cellClassName}
      style={additionalStyles}
      onMouseDown={(e) => {
        // const ctrlKey = e.ctrlKey || e.metaKey;
        const shiftKey = e.shiftKey;
        const focusedCell = state.getFocus();

        if (e.button === 2) {
          if (state.getCellStatus(rowIndex, colIndex).isSelected) {
            return;
          }
        }

        if (shiftKey && focusedCell) {
          state.selectCellRange(
            focusedCell.y,
            focusedCell.x,
            rowIndex,
            colIndex
          );
        } else if (e.ctrlKey) {
          state.addSelectionRange(rowIndex, colIndex, rowIndex, colIndex);
        } else {
          state.selectCell(rowIndex, colIndex);
        }
      }}
    >
      <div className={"flex-1 overflow-hidden whitespace-nowrap"}>
        {renderCell({
          x: colIndex,
          y: rowIndex,
          state: state,
          header: header,
          isFocus,
        })}
      </div>
    </td>
  );
}
