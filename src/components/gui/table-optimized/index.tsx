"use client";
import { cn } from "@/lib/utils";
import { Icon } from "@phosphor-icons/react";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import OptimizeTableState from "./optimize-table-state";
import OptimizeTableCell from "./table-cell";
import TableFakeBodyPadding from "./table-fake-body-padding";
import TableFakeRowPadding from "./table-fake-row-padding";
import TableHeaderList from "./table-header-list";
import useTableVisibilityRecalculation from "./use-visibility-calculation";

export type TableCellDecorator = (value: unknown) => ReactElement | null;
export interface OptimizeTableHeaderProps<MetadataType = unknown> {
  name: string;

  display: {
    text: string;
    initialSize: number;
    icon?: Icon;
    iconClassName?: string;
    tooltip?: string;
  };

  decorator?: TableCellDecorator;

  setting: {
    resizable: boolean;
    readonly: boolean;
  };

  onContextMenu?: (e: React.MouseEvent, headerIndex: number) => void;

  metadata: MetadataType;
  store: Map<string, unknown>;
}

export interface OptimizeTableHeaderWithIndexProps<MetadataType = unknown>
  extends OptimizeTableHeaderProps<MetadataType> {
  index: number;
  sticky: boolean;
}

export interface OptimizeTableCellRenderProps<MetadataType = unknown> {
  y: number;
  x: number;
  state: OptimizeTableState;
  header: OptimizeTableHeaderWithIndexProps<MetadataType>;
  isFocus: boolean;
}

interface TableCellListCommonProps<MetadataType = unknown> {
  internalState: OptimizeTableState<MetadataType>;
  renderHeader: (
    props: OptimizeTableHeaderWithIndexProps<MetadataType>
  ) => ReactElement;
  renderCell: (
    props: OptimizeTableCellRenderProps<MetadataType>
  ) => ReactElement;
  rowHeight: number;
  onHeaderContextMenu?: (
    e: React.MouseEvent,
    header: OptimizeTableHeaderWithIndexProps<MetadataType>
  ) => void;
  onContextMenu?: (props: {
    state: OptimizeTableState<MetadataType>;
    event: React.MouseEvent;
  }) => void;
  onKeyDown?: (state: OptimizeTableState, event: React.KeyboardEvent) => void;
}

export interface OptimizeTableProps<HeaderMetadata = unknown>
  extends TableCellListCommonProps<HeaderMetadata> {
  arrangeHeaderIndex: number[];
  stickyHeaderIndex?: number;
  renderAhead: number;
}

interface RenderCellListProps<HeaderMetadata = unknown>
  extends TableCellListCommonProps<HeaderMetadata> {
  hasSticky: boolean;
  onHeaderResize: (idx: number, newWidth: number) => void;
  customStyles?: React.CSSProperties;
  headers: OptimizeTableHeaderWithIndexProps<HeaderMetadata>[];
  rowEnd: number;
  rowStart: number;
  colEnd: number;
  colStart: number;
}

function renderCellList<HeaderMetadata = unknown>({
  hasSticky,
  customStyles,
  renderCell,
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
}: RenderCellListProps<HeaderMetadata>) {
  const headerSizes = internalState.getHeaderWidth();

  const templateSizes =
    `${internalState.gutterColumnWidth}px ` +
    headers.map((header) => headerSizes[header.index] + "px").join(" ");

  const onHeaderSizeWithRemap = (idx: number, newWidth: number) => {
    onHeaderResize(headers[idx]?.index ?? 0, newWidth);
  };

  const windowArray = new Array(rowEnd - rowStart)
    .fill(false)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    .map(() => new Array(headers.length).fill(false));

  const cells = windowArray.map((row, rowIndex) => {
    const absoluteRowIndex = rowIndex + rowStart;

    let textClass = "flex items-center justify-end h-full pr-2 font-mono";
    let tdClass =
      "sticky left-0 bg-neutral-50 dark:bg-neutral-950 border-r border-b";

    if (internalState.getSelectedRowIndex().includes(absoluteRowIndex)) {
      if (internalState.isFullSelectionRow(absoluteRowIndex)) {
        textClass = cn(
          "flex items-center justify-end h-full pr-2 font-mono",
          "bg-neutral-100 dark:bg-neutral-900 border-red-900 text-black dark:text-white font-bold"
        );
        tdClass =
          "sticky left-0 bg-neutral-100 dark:bg-blue-800 border-r border-b";
      } else {
        textClass =
          "flex items-center justify-end h-full pr-2 font-mono dark:text-white font-bold";
        tdClass =
          "sticky left-0 bg-neutral-100 dark:bg-neutral-900 border-r border-b";
      }
    }

    return (
      <tr
        key={absoluteRowIndex}
        data-row={absoluteRowIndex}
        className="contents"
      >
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
            renderCell={renderCell}
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
              renderCell={renderCell}
            />
          );
        })}
        <TableFakeRowPadding colStart={colEnd} colEnd={headers.length - 1} />
      </tr>
    );
  });

  return (
    <table
      className="absolute top-0 left-0 box-border grid"
      style={{ ...customStyles, gridTemplateColumns: templateSizes }}
    >
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

export default function OptimizeTable<HeaderMetadata = unknown>({
  stickyHeaderIndex,
  internalState,
  renderHeader,
  renderCell,
  rowHeight,
  renderAhead,
  onContextMenu,
  onHeaderContextMenu,
  onKeyDown,
  arrangeHeaderIndex,
}: OptimizeTableProps<HeaderMetadata>) {
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

  const headerRevision = internalState.headerRevision;
  const headerWithIndex = useMemo(() => {
    // Attach the actual index
    const headers = internalState.getHeaders().map((header, idx) => ({
      ...header,
      index: idx,
      sticky: idx === stickyHeaderIndex,
      headerRevision, // this is basically useless, but we do it to ignore deps warning
    }));

    // We will rearrange the index based on specified index
    const headerAfterArranged = arrangeHeaderIndex.map((arrangedIndex) => {
      return headers[arrangedIndex];
    });

    // Sticky will also alter the specified index
    return [
      ...(stickyHeaderIndex !== undefined ? [headers[stickyHeaderIndex]] : []),
      ...headerAfterArranged.filter((x) => x.index !== stickyHeaderIndex),
    ] as OptimizeTableHeaderWithIndexProps<HeaderMetadata>[];
  }, [internalState, arrangeHeaderIndex, stickyHeaderIndex, headerRevision]);

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
        className={
          "relative h-full w-full overflow-auto text-[12px] select-none"
        }
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
    renderCell,
  ]);
}
