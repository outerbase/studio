import GenericCell from "@/app/(components)/Cells/GenericCell";
import TextCell from "@/app/(components)/Cells/TextCell";
import OptimizeTable, {
  OptimizeTableCellRenderProps,
  OptimizeTableHeaderWithIndexProps,
  TableColumnDataType,
} from "@/app/(components)/OptimizeTable";
import OptimizeTableState from "@/app/(components)/OptimizeTable/OptimizeTableState";
import { exportRowsToExcel, exportRowsToSqlInsert } from "@/lib/export-helper";
import { openContextMenuFromEvent } from "@/messages/openContextMenu";
import React, { useCallback, useState } from "react";

interface ResultTableProps {
  data: OptimizeTableState;
  tableName?: string;
}

export default function ResultTable({ data, tableName }: ResultTableProps) {
  const [stickyHeaderIndex, setStickHeaderIndex] = useState<number>();

  const renderCell = useCallback(
    ({ y, x, state, header }: OptimizeTableCellRenderProps) => {
      const isFocus = state.hasFocus(y, x);

      if (header.dataType === TableColumnDataType.TEXT) {
        return (
          <TextCell
            value={state.getValue(y, x) as string}
            focus={isFocus}
            isChanged={state.hasCellChange(y, x)}
            onChange={(newValue) => {
              state.changeValue(y, x, newValue);
            }}
          />
        );
      }

      return <GenericCell value={state.getValue(y, x) as string} />;
    },
    []
  );

  const onHeaderContextMenu = useCallback(
    (e: React.MouseEvent, header: OptimizeTableHeaderWithIndexProps) => {
      openContextMenuFromEvent([
        {
          title: "Pin Header",
          type: "check",
          checked: stickyHeaderIndex === header.index,
          onClick: () => {
            setStickHeaderIndex(
              header.index === stickyHeaderIndex ? undefined : header.index
            );
          },
        },
      ])(e);
    },
    [stickyHeaderIndex]
  );

  const onCellContextMenu = useCallback(
    ({
      state,
      event,
    }: {
      state: OptimizeTableState;
      event: React.MouseEvent;
    }) => {
      openContextMenuFromEvent([
        {
          title: "Copy Cell Value",
          onClick: () => {
            const focus = state.getFocus();
            if (focus) {
              const y = focus.y;
              const x = focus.x;
              window.navigator.clipboard.writeText(
                data.getValue(y, x) as string
              );
            }
          },
        },
        {
          title: "Copy Row As",
          sub: [
            {
              title: "Copy as Excel",
              onClick: () => {
                if (state.getSelectedRowCount() > 0) {
                  window.navigator.clipboard.writeText(
                    exportRowsToExcel(state.getSelectedRowsArray())
                  );
                }
              },
            },
            {
              title: "Copy as INSERT SQL",
              onClick: () => {
                const headers = state
                  .getHeaders()
                  .map((column) => column?.name ?? "");

                if (state.getSelectedRowCount() > 0) {
                  window.navigator.clipboard.writeText(
                    exportRowsToSqlInsert(
                      tableName ?? "UnknownTable",
                      headers,
                      state.getSelectedRowsArray()
                    )
                  );
                }
              },
            },
          ],
        },
      ])(event);
    },
    [data, tableName]
  );

  return (
    <OptimizeTable
      internalState={data}
      onContextMenu={onCellContextMenu}
      onHeaderContextMenu={onHeaderContextMenu}
      stickyHeaderIndex={stickyHeaderIndex}
      renderAhead={20}
      renderCell={renderCell}
      rowHeight={35}
    />
  );
}
