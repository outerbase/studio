"use client";

import React, {
  useState,
  ReactElement,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import useTableVisibilityRecalculation from "./useTableVisibilityRecalculation";
import TableFakeBodyPadding from "./TableFakeBodyPadding";
import TableFakeRowPadding from "./TableFakeRowPadding";
import TableHeaderList from "./TableHeaderList";
import OptimizeTableState from "./OptimizeTableState";
import {
  DatabaseForeignKeyClause,
  DatabaseTableColumn,
  TableColumnDataType,
} from "@/drivers/base-driver";
import OptimizeTableCell from "./table-cell";

export interface OptimizeTableHeaderProps {
  name: string;
  displayName: string;
  initialSize: number;
  resizable?: boolean;
  dataType?: TableColumnDataType;
  originalDataType?: string | null;
  headerData?: DatabaseTableColumn;
  foreignKey?: DatabaseForeignKeyClause;
  icon?: ReactElement;
  rightIcon?: ReactElement;
  tooltip?: string;
  isPrimaryKey?: boolean;
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
  isFocus: boolean;
}

interface TableCellListCommonProps {
  internalState: OptimizeTableState;
  renderHeader: (
    props: OptimizeTableHeaderWithIndexProps,
    idx: number
  ) => ReactElement;
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
  arrangeHeaderIndex: number[];
  stickyHeaderIndex?: number;
  renderAhead: number;
}

interface RenderCellListProps extends TableCellListCommonProps {
  hasSticky: boolean;
  onHeaderResize: (idx: number, newWidth: number) => void;
  customStyles?: React.CSSProperties;
  headers: OptimizeTableHeaderWithIndexProps[];
  rowEnd: number;
  rowStart: number;
  colEnd: number;
  colStart: number;
}

function renderCellList({
  hasSticky,
  customStyles,
  headers,
  rowEnd,
  rowStart,
  colEnd,
  colStart,
  rowHeight,
  onHeaderResize,
  renderHeader,
  internalState,
  onHeaderContextMenu,
}: RenderCellListProps) {
  const headerSizes = internalState.getHeaderWidth();

  const templateSizes =
    `${internalState.gutterColumnWidth}px ` +
    headers.map((header) => headerSizes[header.index] + "px").join(" ");

  const onHeaderSizeWithRemap = (idx: number, newWidth: number) => {
    onHeaderResize(headerSizes[headers[idx]?.index ?? 0] ?? 150, newWidth);
  };

  const windowArray = new Array(rowEnd - rowStart)
    .fill(false)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    .map(() => new Array(headers.length).fill(false));

  const cells = windowArray.map((row, rowIndex) => {
    const absoluteRowIndex = rowIndex + rowStart;

    let rowClass = undefined;

    return (
      <tr
        key={absoluteRowIndex}
        data-row={absoluteRowIndex}
        className={rowClass}
      >
        <td
          className="sticky left-0 bg-zinc-100 dark:bg-zinc-900"
          style={{ zIndex: 15 }}
          onMouseDown={() => {
            internalState.selectRow(absoluteRowIndex);
          }}
        >
          <div className="libsql-table-cell flex items-center justify-end h-full pr-2 font-mono">
            {absoluteRowIndex + 1}
          </div>
        </td>

        {hasSticky && (
          <OptimizeTableCell
            key={-1}
            state={internalState}
            colIndex={headers[0].index}
            rowIndex={absoluteRowIndex}
            header={headers[0]}
          />
        )}

        <TableFakeRowPadding
          colEnd={colStart}
          colStart={0 + (hasSticky ? 1 : 0)}
        />

        {row.slice(colStart, colEnd + 1).map((_, cellIndex) => {
          const actualIndex = cellIndex + colStart;
          const header = headers[actualIndex];

          if (!header) return null;

          // Ignore the sticky column.
          // It is already rendered at the left-most side
          if (header.sticky) return null;

          return (
            <OptimizeTableCell
              key={actualIndex}
              state={internalState}
              colIndex={header.index}
              rowIndex={absoluteRowIndex}
              header={header}
            />
          );
        })}
        <TableFakeRowPadding colStart={colEnd} colEnd={headers.length - 1} />
      </tr>
    );
  });

  return (
    <table style={{ ...customStyles, gridTemplateColumns: templateSizes }}>
      <TableHeaderList
        state={internalState}
        renderHeader={renderHeader}
        sticky={hasSticky}
        headers={headers}
        onHeaderResize={onHeaderSizeWithRemap}
        onHeaderContextMenu={onHeaderContextMenu}
      />

      <TableFakeBodyPadding
        colCount={headers.length}
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
  renderHeader,
  rowHeight,
  renderAhead,
  onContextMenu,
  onHeaderContextMenu,
  onKeyDown,
  arrangeHeaderIndex,
}: OptimizeTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // This is our trigger re-render the whole table
  const [revision, setRevision] = useState(1);

  const rerender = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, [setRevision]);

  useEffect(() => {
    internalState.setContainer(containerRef.current);
  }, [internalState, containerRef]);

  useEffect(() => {
    const changeCallback = () => {
      rerender();
    };

    internalState.addChangeListener(changeCallback);
    return () => internalState.removeChangeListener(changeCallback);
  }, [internalState, rerender]);

  const headerWithIndex = useMemo(() => {
    // Attach the actual index
    const headers = internalState.getHeaders().map((header, idx) => ({
      ...header,
      index: idx,
      sticky: idx === stickyHeaderIndex,
    }));

    // We will rearrange the index based on specified index
    const headerAfterArranged = arrangeHeaderIndex.map((arrangedIndex) => {
      return headers[arrangedIndex];
    });

    // Sticky will also alter the specified index
    return [
      ...(stickyHeaderIndex !== undefined ? [headers[stickyHeaderIndex]] : []),
      ...headerAfterArranged.filter((x) => x.index !== stickyHeaderIndex),
    ];
  }, [internalState, arrangeHeaderIndex, stickyHeaderIndex]);

  const { visibileRange, onHeaderResize } = useTableVisibilityRecalculation({
    containerRef,
    headers: headerWithIndex,
    renderAhead,
    rowHeight,
    totalRowCount: internalState.getRowsCount(),
    state: internalState,
  });

  const { rowStart, rowEnd, colEnd, colStart } = visibileRange;

  return useMemo(() => {
    const common = {
      headers: headerWithIndex,
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
      renderHeader,
    };

    return (
      <div
        tabIndex={-1}
        onKeyDown={(e) => {
          if (onKeyDown) onKeyDown(internalState, e);
        }}
        ref={containerRef}
        style={{
          outline: "none",
        }}
        className={"libsql-table"}
        onContextMenu={(e) => {
          if (onContextMenu) onContextMenu({ state: internalState, event: e });
          e.preventDefault();
        }}
      >
        <div
          style={{
            height: (internalState.getRowsCount() + 1) * rowHeight + 10,
          }}
        >
          {renderCellList(common)}
        </div>
      </div>
    );
  }, [
    rowEnd,
    rowStart,
    colEnd,
    colStart,
    rowHeight,
    headerWithIndex,
    onHeaderResize,
    stickyHeaderIndex,
    internalState,
    onContextMenu,
    onHeaderContextMenu,
    onKeyDown,
    revision,
    renderHeader,
  ]);
}
