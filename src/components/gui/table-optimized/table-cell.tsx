import OptimizeTableState from "./OptimizeTableState";
import { OptimizeTableHeaderWithIndexProps } from ".";
import tableResultCellRenderer from "../table-result/render-cell";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export default function OptimizeTableCell({
  state,
  header,
  rowIndex,
  colIndex,
}: {
  state: OptimizeTableState;
  rowIndex: number;
  colIndex: number;
  header: OptimizeTableHeaderWithIndexProps;
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
      cellBackgroundColor = "bg-yellow-200 dark:bg-orange-600";
    } else if (isNew) {
      cellBackgroundColor = "bg-green-200 dark:bg-green-700";
    } else {
      cellBackgroundColor = "bg-blue-100 dark:bg-sky-900";
    }
  } else if (isChanged) {
    cellBackgroundColor = "bg-yellow-100 dark:bg-orange-700";
  } else if (isNew) {
    cellBackgroundColor = "bg-green-100 dark:bg-green-900";
  } else if (isRemoved) {
    cellBackgroundColor = "bg-red-100 dark:bg-red-900";
  }

  const cellClassName = cn(
    "box-border",
    isSelected && "border-blue-300 dark:border-blue-500",
    isBorderBottom && "border-b border-b-blue-500",
    isBorderRight && "border-r border-r-blue-500",
    isFocus && "shadow-[0_0_0_1px_rgba(0,0,255,0.5)_inset]",
    isSticky && "sticky",
    cellBackgroundColor
  );

  const className = cn("libsql-table-cell");

  return (
    <td
      className={cellClassName}
      style={additionalStyles}
      onMouseDown={(e) => {
        // const ctrlKey = e.ctrlKey || e.metaKey;
        const shiftKey = e.shiftKey;
        const focusedCell = state.getFocus();

        if (shiftKey && focusedCell) {
          state.selectCellRange(
            focusedCell.y,
            focusedCell.x,
            rowIndex,
            colIndex
          );
        } else {
          state.selectCell(rowIndex, colIndex);
        }
      }}
    >
      <div className={className}>
        {tableResultCellRenderer({
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
