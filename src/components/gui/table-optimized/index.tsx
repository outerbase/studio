"use client";

import { DatabaseTableColumn } from "@/drivers/base-driver";
import { cn } from "@/lib/utils";
import { ColumnType } from "@outerbase/sdk-transform";
import { Icon } from "@phosphor-icons/react";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import OptimizeTableState from "./OptimizeTableState";
import OptimizeTableCell from "./table-cell";
import TableFakeBodyPadding from "./table-fake-body-padding";
import TableFakeRowPadding from "./table-fake-row-padding";
import TableHeaderList from "./table-header-list";
import useTableVisibilityRecalculation from "./useTableVisibilityRecalculation";

export interface TableHeaderMetadata {
  from?: {
    schema: string;
    table: string;
    column: string;
  };

  // Primary key
  isPrimaryKey: boolean;

  // Foreign key reference
  referenceTo?: {
    schema: string;
    table: string;
    column: string;
  };

  type?: ColumnType;
  originalType?: string;

  columnSchema?: DatabaseTableColumn;
}
export interface OptimizeTableHeaderProps {
  name: string;

  display: {
    text: string;
    initialSize: number;
    icon?: Icon;
    iconClassName?: string;
    tooltip?: string;
  };

  setting: {
    resizable: boolean;
    readonly: boolean;
  };

  onContextMenu?: (e: React.MouseEvent, headerIndex: number) => void;

  metadata: TableHeaderMetadata;
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

    let textClass =
      "libsql-table-cell flex items-center justify-end h-full pr-2 font-mono";
    let tdClass = "sticky left-0 bg-neutral-50 dark:bg-neutral-950";

    if (internalState.getSelectedRowIndex().includes(absoluteRowIndex)) {
      if (internalState.isFullSelectionRow(absoluteRowIndex)) {
        textClass = cn(
          "libsql-table-cell flex items-center justify-end h-full pr-2 font-mono",
          "bg-neutral-100 dark:bg-neutral-900 border-red-900 text-black dark:text-white font-bold"
        );
        tdClass = "sticky left-0 bg-neutral-100 dark:bg-blue-800";
      } else {
        textClass =
          "libsql-table-cell flex items-center justify-end h-full pr-2 font-mono dark:text-white font-bold";
        tdClass = "sticky left-0 bg-neutral-100 dark:bg-neutral-900";
      }
    }

    return (
      <tr key={absoluteRowIndex} data-row={absoluteRowIndex}>
        <td
          className={tdClass}
          style={{ zIndex: 15 }}
          onMouseDown={(e) => {
            const focusCell = internalState.getFocus();
            if (e.shiftKey && focusCell) {
              internalState.selectRowRange(focusCell.y, absoluteRowIndex);
            } else if (e.ctrlKey && focusCell) {
              internalState.addSelectionRow(absoluteRowIndex);
              internalState.setFocus(absoluteRowIndex, 0);
            } else {
              internalState.selectRow(absoluteRowIndex);
              internalState.setFocus(absoluteRowIndex, 0);
            }
          }}
        >
          <div className={textClass}>{absoluteRowIndex + 1}</div>
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
