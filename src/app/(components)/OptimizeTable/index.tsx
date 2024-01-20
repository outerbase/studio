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

interface OptimizeTableProps {
  data: unknown[];
  stickyHeaderIndex?: number;
  headers: OptimizeTableHeaderProps[];
  renderCell: (y: number, x: number) => ReactElement;
  rowHeight: number;
  renderAhead: number;

  newRowsIndex?: number[];
  removedRowsIndex?: number[];

  selectedRowsIndex: number[]; // Array of selected row indices
  onSelectedRowsIndexChanged: (selectedRows: number[]) => void; // Callback for row selection changes
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
}: {
  hasSticky: boolean;
  onHeaderResize: (idx: number, newWidth: number) => void;
  headerIndex: number[];
  customStyles?: React.CSSProperties;
  headers: OptimizeTableHeaderWithIndexProps[];
  renderCell: (y: number, x: number) => ReactElement;
  removedRowsIndexSet: Set<number>;
  newRowsIndexSet: Set<number>;
  rowEnd: number;
  rowStart: number;
  selectedRowsIndex: number[];
  headerSizes: number[];
  colEnd: number;
  colStart: number;
  rowHeight: number;
  data: unknown[];
}) {
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
            <div className={styles.tableCellContent}>
              {renderCell(absoluteRowIndex, headersWithIndex[0].index)}
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
              <div className={styles.tableCellContent}>
                {renderCell(absoluteRowIndex, header.index)}
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

  const allHeaderIndex = [
    ...(stickyHeaderIndex !== undefined ? [stickyHeaderIndex] : []),
    ...new Array(headers.length)
      .fill(false)
      .map((_, idx) => idx)
      .filter((idx) => idx !== stickyHeaderIndex),
  ];

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
  ]);
}
