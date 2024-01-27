import { useState, ReactElement, useRef, useMemo, useCallback } from "react";
import styles from "./styles.module.css";
import useTableVisibilityRecalculation from "./useTableVisibilityRecalculation";
import TableFakeBodyPadding from "./TableFakeBodyPadding";
import TableFakeRowPadding from "./TableFakeRowPadding";
import TableHeaderList from "./TableHeaderList";
import OptimizeTableState from "./OptimizeTableState";

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
  state: OptimizeTableState;
}

interface TableCellListCommonProps {
  internalState: OptimizeTableState;
  renderCell: (props: OptimizeTableCellRenderProps) => ReactElement;
  rowHeight: number;
  onHeaderContextMenu?: (header: OptimizeTableHeaderWithIndexProps) => void;
  onContextMenu?: (props: {
    state: OptimizeTableState;
    event: React.MouseEvent;
  }) => void;
}

export interface OptimizeTableProps extends TableCellListCommonProps {
  stickyHeaderIndex?: number;
  renderAhead: number;
}

interface RenderCellListProps extends TableCellListCommonProps {
  hasSticky: boolean;
  onHeaderResize: (idx: number, newWidth: number) => void;
  headerIndex: number[];
  customStyles?: React.CSSProperties;
  headers: OptimizeTableHeaderWithIndexProps[];
  rowEnd: number;
  rowStart: number;
  headerSizes: number[];
  colEnd: number;
  colStart: number;
  rerender: () => void;
}

function handleTableCellMouseDown({
  internalState,
  y,
  x,
  ctrl,
  shift,
  rerender,
}: {
  y: number;
  x: number;
  ctrl?: boolean;
  shift?: boolean;
  internalState: OptimizeTableState;
  rerender: () => void;
}) {
  if (ctrl) {
    internalState.selectRow(y, true);
  } else {
    // Single select
    internalState.clearSelect();
    internalState.selectRow(y);
  }

  internalState.setFocus(y, x);
  rerender();
}

function renderCellList({
  hasSticky,
  headerIndex,
  customStyles,
  headerSizes,
  headers,
  renderCell,
  rowEnd,
  rowStart,
  colEnd,
  colStart,
  rowHeight,
  onHeaderResize,
  internalState,
  rerender,
}: RenderCellListProps) {
  const headersWithIndex = headerIndex.map((idx) => headers[idx]);

  const templateSizes = headersWithIndex
    .map((header) => headerSizes[header.index] + "px")
    .join(" ");

  const onHeaderSizeWithRemap = (idx: number, newWidth: number) => {
    onHeaderResize(headerSizes[headersWithIndex[idx].index], newWidth);
  };

  const handleCellClicked = (y: number, x: number) => {
    return (e: React.MouseEvent) => {
      if (e.button !== 2) {
        handleTableCellMouseDown({
          y,
          x,
          internalState,
          ctrl: e.ctrlKey || e.metaKey,
          shift: e.shiftKey,
          rerender,
        });
      }
    };
  };

  const windowArray = new Array(rowEnd - rowStart)
    .fill(false)
    .map(() => new Array(headers.length).fill(false));

  const cells = windowArray.map((row, rowIndex) => {
    const absoluteRowIndex = rowIndex + rowStart;

    let rowClass = undefined;

    // if (internalState.newRows.has(absoluteRowIndex)) {
    //   rowClass = styles.newRow;
    // } else if (internalState.removedRows.has(absoluteRowIndex)) {
    //   rowClass = styles.removedRow;
    if (internalState.isRowSelected(absoluteRowIndex)) {
      rowClass = styles.selectedRow;
    }

    return (
      <tr
        key={absoluteRowIndex}
        data-row={absoluteRowIndex}
        className={rowClass}
      >
        {hasSticky && (
          <td
            className={styles.stickyColumn}
            onMouseDown={handleCellClicked(
              absoluteRowIndex,
              headersWithIndex[0].index
            )}
          >
            <div className={styles.tableCellContent}>
              {renderCell({
                y: absoluteRowIndex,
                x: headersWithIndex[0].index,
                state: internalState,
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
            <td
              key={cellIndex + colStart}
              onMouseDown={handleCellClicked(absoluteRowIndex, header.index)}
            >
              <div className={styles.tableCellContent}>
                {renderCell({
                  y: absoluteRowIndex,
                  x: header.index,
                  state: internalState,
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
        rowCount={internalState.getRowsCount()}
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
  stickyHeaderIndex,
  internalState,
  renderCell,
  rowHeight,
  renderAhead,
  onContextMenu,
  onHeaderContextMenu,
}: OptimizeTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // This is our trigger re-render the whole table
  const [revision, setRevision] = useState(1);

  const rerender = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, [setRevision]);

  const headers = useMemo(() => {
    return internalState.getHeaders();
  }, [internalState]);

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
    totalRowCount: internalState.getRowsCount(),
  });

  const { rowStart, rowEnd, colEnd, colStart } = visibileRange;

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
      rowEnd,
      rowStart,
      colEnd,
      colStart,
      rowHeight,
      onHeaderResize,
      hasSticky: stickyHeaderIndex !== undefined,
      internalState,
      rerender,
      revision,
      onContextMenu,
      onHeaderContextMenu,
    };

    return (
      <div
        ref={containerRef}
        className={styles.tableContainer}
        onContextMenu={(e) => {
          if (onContextMenu) onContextMenu({ state: internalState, event: e });
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div
          style={{
            height: (internalState.getRowsCount() + 1) * rowHeight + 10,
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
    renderCell,
    headerSizes,
    rowHeight,
    headerWithIndex,
    onHeaderResize,
    stickyHeaderIndex,
    allHeaderIndex,
    internalState,
    onContextMenu,
    onHeaderContextMenu,
    rerender,
    revision,
  ]);
}
