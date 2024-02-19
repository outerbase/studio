import React, {
  useState,
  ReactElement,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import styles from "./styles.module.css";
import useTableVisibilityRecalculation from "./useTableVisibilityRecalculation";
import TableFakeBodyPadding from "./TableFakeBodyPadding";
import TableFakeRowPadding from "./TableFakeRowPadding";
import TableHeaderList from "./TableHeaderList";
import OptimizeTableState from "./OptimizeTableState";

export enum TableColumnDataType {
  TEXT = 1,
  INTEGER = 2,
  REAL = 3,
  BLOB = 4,
}

export interface OptimizeTableHeaderProps {
  name: string;
  initialSize: number;
  resizable?: boolean;
  dataType?: TableColumnDataType;
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
  header: OptimizeTableHeaderWithIndexProps;
}

interface TableCellListCommonProps {
  internalState: OptimizeTableState;
  renderCell: (props: OptimizeTableCellRenderProps) => ReactElement;
  rowHeight: number;
  onHeaderContextMenu?: (
    e: React.MouseEvent,
    header: OptimizeTableHeaderWithIndexProps
  ) => void;
  onContextMenu?: (props: {
    state: OptimizeTableState;
    event: React.MouseEvent;
  }) => void;
  onKeyDown?: (state: OptimizeTableState, event: React.KeyboardEvent) => void;
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
}

function handleTableCellMouseDown({
  internalState,
  y,
  x,
  ctrl,
}: {
  y: number;
  x: number;
  ctrl?: boolean;
  shift?: boolean;
  internalState: OptimizeTableState;
}) {
  if (ctrl) {
    internalState.selectRow(y, true);
  } else {
    // Single select
    internalState.clearSelect();
    internalState.selectRow(y);
  }

  internalState.setFocus(y, x);
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
  onHeaderContextMenu,
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

    if (internalState.isRemovedRow(absoluteRowIndex)) {
      rowClass = styles.removedRow;
    } else if (internalState.isNewRow(absoluteRowIndex)) {
      rowClass = styles.newRow;
    } else if (internalState.isRowSelected(absoluteRowIndex)) {
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
                header: headers[headersWithIndex[0].index],
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
                  header: headers[header.index],
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
        onHeaderContextMenu={onHeaderContextMenu}
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
  onKeyDown,
}: OptimizeTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // This is our trigger re-render the whole table
  const [revision, setRevision] = useState(1);

  const rerender = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, [setRevision]);

  useEffect(() => {
    const changeCallback = () => {
      rerender();
    };

    internalState.addChangeListener(changeCallback);
    return () => internalState.removeChangeListener(changeCallback);
  }, [internalState, rerender]);

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
      revision,
      onContextMenu,
      onHeaderContextMenu,
    };

    return (
      <div
        tabIndex={10}
        onKeyDown={(e) => {
          if (onKeyDown) onKeyDown(internalState, e);
        }}
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
    onKeyDown,
    revision,
  ]);
}
