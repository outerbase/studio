import GenericCell from "@/app/(components)/Cells/GenericCell";
import NumberCell from "@/app/(components)/Cells/NumberCell";
import TextCell from "@/app/(components)/Cells/TextCell";
import OptimizeTable, {
  OptimizeTableCellRenderProps,
  OptimizeTableHeaderWithIndexProps,
  TableColumnDataType,
} from "@/app/(components)/OptimizeTable";
import OptimizeTableState from "@/app/(components)/OptimizeTable/OptimizeTableState";
import { DatabaseValue } from "@/drivers/DatabaseDriver";
import { exportRowsToExcel, exportRowsToSqlInsert } from "@/lib/export-helper";
import { KEY_BINDING } from "@/lib/key-matcher";
import { openContextMenuFromEvent } from "@/messages/openContextMenu";
import { LucidePlus, LucideTrash2 } from "lucide-react";
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
            readOnly={!tableName}
            value={state.getValue(y, x) as DatabaseValue<string>}
            focus={isFocus}
            isChanged={state.hasCellChange(y, x)}
            onChange={(newValue) => {
              state.changeValue(y, x, newValue);
            }}
          />
        );
      } else if (
        header.dataType === TableColumnDataType.INTEGER ||
        header.dataType === TableColumnDataType.REAL
      ) {
        return (
          <NumberCell
            readOnly={!tableName}
            value={state.getValue(y, x) as DatabaseValue<number>}
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
    [tableName]
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
      const randomUUID = crypto.randomUUID();
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const hasFocus = !!state.getFocus();

      function setFocusValue(newValue: unknown) {
        const focusCell = state.getFocus();
        if (focusCell) {
          state.changeValue(focusCell.y, focusCell.x, newValue);
        }
      }

      openContextMenuFromEvent([
        {
          title: "Insert Value",
          disabled: !hasFocus,
          subWidth: 200,
          sub: [
            {
              title: <pre>NULL</pre>,
              onClick: () => {
                setFocusValue(null);
              },
            },
            {
              title: <pre>DEFAULT</pre>,
              onClick: () => {
                setFocusValue(undefined);
              },
            },
            { separator: true },
            {
              title: (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Unix Timestamp</span>
                  <span>{timestamp}</span>
                </div>
              ),
              onClick: () => {
                setFocusValue(timestamp);
              },
            },
            { separator: true },
            {
              title: (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">UUID </span>
                  <span>{randomUUID}</span>
                </div>
              ),
              onClick: () => {
                setFocusValue(randomUUID);
              },
            },
          ],
        },
        {
          separator: true,
        },
        {
          title: "Copy Cell Value",
          shortcut: KEY_BINDING.copy.toString(),
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
        { separator: true },
        {
          title: "Insert row",
          icon: LucidePlus,
          onClick: () => {
            data.insertNewRow();
          },
        },
        {
          title: "Delete selected row(s)",
          icon: LucideTrash2,
          onClick: () => {
            data.removeRow();
          },
        },
      ])(event);
    },
    [data, tableName]
  );

  const onKeyDown = useCallback(
    (state: OptimizeTableState, e: React.KeyboardEvent) => {
      if (KEY_BINDING.copy.match(e as React.KeyboardEvent<HTMLDivElement>)) {
        const focus = state.getFocus();
        if (focus) {
          const y = focus.y;
          const x = focus.x;
          window.navigator.clipboard.writeText(state.getValue(y, x) as string);
        }
      }
    },
    []
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
      onKeyDown={onKeyDown}
    />
  );
}
