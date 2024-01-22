import { useState, ReactElement, useRef, useMemo } from "react";
import styles from "./styles.module.css";
import useTableVisibilityRecalculation from "./useTableVisibilityRecalculation";
import useTableSelectionHandler from "./useTableSelectionHandler";
import TableFakeBodyPadding from "./TableFakeBodyPadding";
import TableFakeRowPadding from "./TableFakeRowPadding";
import TableHeaderList from "./TableHeaderList";

export interface OptimizeTableHeaderProps {
  name: string;
  initialSize: number;
  resizable?: boolean;
  icon?: ReactElement;
  rightIcon?: ReactElement;
  tooltip?: string;
  onContextMenu?: (e: React.MouseEvent, headerIndex: number) => void;
}

export interface OptimizeTableHeaderWithIndexProps
  extends OptimizeTableHeaderProps {
  index: number;
  sticky: boolean;
}

export interface OptimizeTableCellRenderProps {
  y: number;
  x: number;
  isFocus: boolean;
}

interface TableCellListCommonProps {
  renderCell: (props: OptimizeTableCellRenderProps) => ReactElement;
  rowHeight: number;
  data: unknown[];
  focusIndex?: [number, number];
  onFocusIndexChange?: (cellIndex: [number, number]) => void;

  selectedRowsIndex: number[]; // Array of selected row indices
}

export interface OptimizeTableProps extends TableCellListCommonProps {
  stickyHeaderIndex?: number;
  headers: OptimizeTableHeaderProps[];
  renderAhead: number;
  newRowsIndex?: number[];
  removedRowsIndex?: number[];
  onSelectedRowsIndexChanged: (selectedRows: number[]) => void; // Callback for row selection changes
}

interface RenderCellListProps extends TableCellListCommonProps {
  hasSticky: boolean;
  onHeaderResize: (idx: number, newWidth: number) => void;
  headerIndex: number[];
  customStyles?: React.CSSProperties;
  headers: OptimizeTableHeaderWithIndexProps[];
  removedRowsIndexSet: Set<number>;
  newRowsIndexSet: Set<number>;
  rowEnd: number;
  rowStart: number;
  headerSizes: number[];
  colEnd: number;
  colStart: number;
}

function hasFocus(y: number, x: number, focus?: [number, number]) {
  return !!focus && focus[0] === y && focus[1] === x;
}

function renderCellList({
  hasSticky,
  headerIndex,
  customStyles,
  headerSizes,
  headers,
  renderCell,
  newRowsIndexSet,
  removedRowsIndexSet,
  rowEnd,
  rowStart,
  selectedRowsIndex,
  colEnd,
  colStart,
  rowHeight,
  onHeaderResize,
  data,
  focusIndex,
  onFocusIndexChange,
}: RenderCellListProps) {
  const headersWithIndex = headerIndex.map((idx) => headers[idx]);

  const templateSizes = headersWithIndex
    .map((header) => headerSizes[header.index] + "px")
    .join(" ");

  const onHeaderSizeWithRemap = (idx: number, newWidth: number) => {
    onHeaderResize(headerSizes[headersWithIndex[idx].index], newWidth);
  };

  const windowArray = new Array(rowEnd - rowStart)
    .fill(false)
    .map(() => new Array(headers.length).fill(false));

  const cells = windowArray.map((row, rowIndex) => {
    const absoluteRowIndex = rowIndex + rowStart;

    let rowClass = undefined;

    if (newRowsIndexSet.has(absoluteRowIndex)) {
      rowClass = styles.newRow;
    } else if (removedRowsIndexSet.has(absoluteRowIndex)) {
      rowClass = styles.removedRow;
    } else if (selectedRowsIndex.includes(absoluteRowIndex)) {
      rowClass = styles.selectedRow;
    }

    return (
      <tr
        key={absoluteRowIndex}
        data-row={absoluteRowIndex}
        className={rowClass}
      >
        {hasSticky && (
          <td className={styles.stickyColumn}>
            <div
              className={styles.tableCellContent}
              onMouseDown={() => {
                if (onFocusIndexChange)
                  onFocusIndexChange([
                    absoluteRowIndex,
                    headersWithIndex[0].index,
                  ]);
              }}
            >
              {renderCell({
                y: absoluteRowIndex,
                x: headersWithIndex[0].index,
                isFocus: hasFocus(
                  absoluteRowIndex,
                  headersWithIndex[0].index,
                  focusIndex
                ),
              })}
            </div>
          </td>
        )}

        <TableFakeRowPadding
          colEnd={colStart}
          colStart={0 + (hasSticky ? 1 : 0)}
        />

        {row.slice(colStart, colEnd + 1).map((_, cellIndex) => {
          const actualIndex = cellIndex + colStart;
          const header = headersWithIndex[actualIndex];

          if (header.sticky) return null;

          return (
            <td key={cellIndex + colStart}>
              <div
                className={styles.tableCellContent}
                onMouseDown={() => {
                  if (onFocusIndexChange)
                    onFocusIndexChange([absoluteRowIndex, header.index]);
                }}
              >
                {renderCell({
                  y: absoluteRowIndex,
                  x: header.index,
                  isFocus: hasFocus(absoluteRowIndex, header.index, focusIndex),
                })}
              </div>
            </td>
          );
        })}
        <TableFakeRowPadding
          colStart={colEnd}
          colEnd={headersWithIndex.length - 1}
        />
      </tr>
    );
  });

  return (
    <table style={{ ...customStyles, gridTemplateColumns: templateSizes }}>
      <TableHeaderList
        sticky={hasSticky}
        headers={headersWithIndex}
        onHeaderResize={onHeaderSizeWithRemap}
      />

      <TableFakeBodyPadding
        colCount={headerIndex.length}
        rowCount={data.length}
        rowEnd={rowEnd}
        rowStart={rowStart}
        rowHeight={rowHeight}
      >
        {cells}
      </TableFakeBodyPadding>
    </table>
  );
}

export default function OptimizeTable({
  data,
  headers,
  stickyHeaderIndex,
  renderCell,
  rowHeight,
  renderAhead,
  newRowsIndex,
  removedRowsIndex,
  selectedRowsIndex,
  onSelectedRowsIndexChanged,
  focusIndex,
  onFocusIndexChange,
}: OptimizeTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [headerSizes] = useState(() => {
    return headers.map((header) => header.initialSize);
  });

  const headerWithIndex = useMemo(() => {
    return headers.map((header, idx) => ({
      ...header,
      index: idx,
      sticky: idx === stickyHeaderIndex,
    }));
  }, [headers, stickyHeaderIndex]);

  const { visibileRange, onHeaderResize } = useTableVisibilityRecalculation({
    containerRef,
    headerSizes,
    headers: headerWithIndex,
    renderAhead,
    rowHeight,
    totalRowCount: data.length,
  });

  const { rowStart, rowEnd, colEnd, colStart } = visibileRange;

  const { handleRowClick, newRowsIndexSet, removedRowsIndexSet } =
    useTableSelectionHandler({
      onSelectedRowsIndexChanged,
      selectedRowsIndex,
      newRowsIndex,
      removedRowsIndex,
    });

  const allHeaderIndex = useMemo(() => {
    return [
      ...(stickyHeaderIndex !== undefined ? [stickyHeaderIndex] : []),
      ...new Array(headers.length)
        .fill(false)
        .map((_, idx) => idx)
        .filter((idx) => idx !== stickyHeaderIndex),
    ];
  }, [headers.length, stickyHeaderIndex]);

  return useMemo(() => {
    const common = {
      headerSizes,
      headers: headerWithIndex,
      renderCell,
      newRowsIndexSet,
      removedRowsIndexSet,
      rowEnd,
      rowStart,
      colEnd,
      colStart,
      handleRowClick,
      selectedRowsIndex,
      rowHeight,
      onHeaderResize,
      data,
      hasSticky: stickyHeaderIndex !== undefined,
      focusIndex,
      onFocusIndexChange,
    };

    return (
      <div
        ref={containerRef}
        className={styles.tableContainer}
        onMouseDown={handleRowClick}
      >
        <div
          style={{
            height: (data.length + 1) * rowHeight + 10,
          }}
        >
          {renderCellList({ headerIndex: allHeaderIndex, ...common })}
        </div>
      </div>
    );
  }, [
    rowEnd,
    rowStart,
    colEnd,
    colStart,
    data,
    renderCell,
    headerSizes,
    rowHeight,
    headerWithIndex,
    onHeaderResize,
    selectedRowsIndex,
    newRowsIndexSet,
    removedRowsIndexSet,
    stickyHeaderIndex,
    focusIndex,
    onFocusIndexChange,
    allHeaderIndex,
    handleRowClick,
  ]);
}
