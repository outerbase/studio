import {
  useState,
  ReactElement,
  useRef,
  useMemo,
  SetStateAction,
  Dispatch,
  useCallback,
} from "react";
import styles from "./styles.module.css";
import useTableVisibilityRecalculation from "./useTableVisibilityRecalculation";
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
  state: OptimizeTableInternalState;
}

interface TableCellListCommonProps {
  renderCell: (props: OptimizeTableCellRenderProps) => ReactElement;
  rowHeight: number;
  data: unknown[];
  onContextMenu?: (props: {
    state: OptimizeTableInternalState;
    event: React.MouseEvent;
  }) => void;
}

export interface OptimizeTableProps extends TableCellListCommonProps {
  stickyHeaderIndex?: number;
  headers: OptimizeTableHeaderProps[];
  renderAhead: number;
}

export interface OptimizeTableInternalState {
  selectedRows: Set<number>;
  removedRows: Set<number>;
  newRows: Set<number>;
  focus: { y: number; x: number } | null;
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
  internalState: OptimizeTableInternalState;
  rerender: () => void;
}

function handleTableCellMouseDown({
  internalState,
  y,
  x,
  rerender,
}: {
  y: number;
  x: number;
  ctrl?: boolean;
  shift?: boolean;
  internalState: OptimizeTableInternalState;
  rerender: () => void;
}) {
  internalState.selectedRows.clear();
  internalState.selectedRows.add(y);
  internalState.focus = { y, x };
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
  data,
  onContextMenu,
  rerender,
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

    if (internalState.newRows.has(absoluteRowIndex)) {
      rowClass = styles.newRow;
    } else if (internalState.removedRows.has(absoluteRowIndex)) {
      rowClass = styles.removedRow;
    } else if (internalState.selectedRows.has(absoluteRowIndex)) {
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
            onContextMenu={() => {
              handleTableCellMouseDown({
                y: absoluteRowIndex,
                x: headersWithIndex[0].index,
                internalState,
                rerender,
              });
            }}
            onMouseDown={() => {
              handleTableCellMouseDown({
                y: absoluteRowIndex,
                x: headersWithIndex[0].index,
                internalState,
                rerender,
              });
            }}
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
              onContextMenu={() => {
                handleTableCellMouseDown({
                  y: absoluteRowIndex,
                  x: header.index,
                  internalState,
                  rerender,
                });
              }}
              onMouseDown={() => {
                handleTableCellMouseDown({
                  y: absoluteRowIndex,
                  x: header.index,
                  internalState,
                  rerender,
                });
              }}
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
  onContextMenu,
}: OptimizeTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const internalState = useMemo<OptimizeTableInternalState>(() => {
    return {
      selectedRows: new Set(),
      removedRows: new Set(),
      newRows: new Set(),
      focus: null,
    };
  }, []);

  // This is our trigger re-render the whole table
  const [revision, setRevision] = useState(1);

  const rerender = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, [setRevision]);

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
      data,
      hasSticky: stickyHeaderIndex !== undefined,
      internalState,
      rerender,
      revision,
      onContextMenu,
    };

    return (
      <div
        ref={containerRef}
        className={styles.tableContainer}
        onContextMenu={(e) => {
          if (onContextMenu) onContextMenu({ state: internalState, event: e });
          console.log("context menu");
          e.preventDefault();
          e.stopPropagation();
        }}
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
    stickyHeaderIndex,
    allHeaderIndex,
    internalState,
    onContextMenu,
    rerender,
    revision,
  ]);
}
