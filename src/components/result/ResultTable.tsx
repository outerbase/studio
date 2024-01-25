import GenericCell from "@/app/(components)/Cells/GenericCell";
import TextCell from "@/app/(components)/Cells/TextCell";
import OptimizeTable, {
  OptimizeTableCellRenderProps,
  OptimizeTableHeaderProps,
  OptimizeTableInternalState,
} from "@/app/(components)/OptimizeTable";
import {
  exportRowsToExcel,
  exportRowsToSqlInsert,
  selectArrayFromIndexList,
  transformResultToArray,
} from "@/lib/export-helper";
import { openContextMenuFromEvent } from "@/messages/openContextMenu";
import * as hrana from "@libsql/hrana-client";
import { LucideKey } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

interface ResultTableProps {
  data: hrana.RowsResult;
  primaryKey?: string[];
  tableName?: string;
}

export default function ResultTable({
  data,
  primaryKey,
  tableName,
}: ResultTableProps) {
  const [stickyHeaderIndex, setStickHeaderIndex] = useState<number>();

  const headerMemo = useMemo(() => {
    return data.columnNames.map(
      (header, idx) =>
        ({
          name: header || "",
          resizable: true,
          initialSize: Math.max((header ?? "").length * 10, 150),
          icon: (primaryKey ?? []).includes(header ?? "") ? (
            <LucideKey className="w-4 h-4 text-red-500" />
          ) : undefined,
          onContextMenu: openContextMenuFromEvent([
            {
              title: "Pin Header",
              type: "check",
              checked: stickyHeaderIndex === idx,
              onClick: () => {
                setStickHeaderIndex(
                  idx === stickyHeaderIndex ? undefined : idx
                );
              },
            },
          ]),
        } as OptimizeTableHeaderProps)
    );
  }, [data, primaryKey, stickyHeaderIndex]);

  const renderCell = useCallback(
    ({ y, x, state }: OptimizeTableCellRenderProps) => {
      const isFocus =
        !!state.focus && state.focus.x === x && state.focus.y === y;

      if (data.rows[y]) {
        return (
          <GenericCell value={data.rows[y][x] as string} focus={isFocus} />
        );
      }
      return <GenericCell value={""} />;
    },
    [data]
  );

  const onCellContextMenu = useCallback(
    ({
      state,
      event,
    }: {
      state: OptimizeTableInternalState;
      event: React.MouseEvent;
    }) => {
      openContextMenuFromEvent([
        {
          title: "Copy Cell Value",
          onClick: () => {
            if (state.focus) {
              const y = state.focus.y;
              const x = state.focus.x;
              window.navigator.clipboard.writeText(data.rows[y][x] as string);
            }
          },
        },
        {
          title: "Copy Row As",
          sub: [
            {
              title: "Copy as Excel",
              onClick: () => {
                const selectedRowsIndex = Array.from(
                  state.selectedRows.values()
                );

                const headers = data.columnNames.map((column) => column ?? "");

                if (selectedRowsIndex.length > 0) {
                  const rows = transformResultToArray(
                    headers,
                    selectArrayFromIndexList(data.rows, selectedRowsIndex)
                  );

                  window.navigator.clipboard.writeText(exportRowsToExcel(rows));
                }
              },
            },
            {
              title: "Copy as INSERT SQL",
              onClick: () => {
                const selectedRowsIndex = Array.from(
                  state.selectedRows.values()
                );

                const headers = data.columnNames.map((column) => column ?? "");

                if (selectedRowsIndex.length > 0) {
                  const rows = transformResultToArray(
                    headers,
                    selectArrayFromIndexList(data.rows, selectedRowsIndex)
                  );

                  window.navigator.clipboard.writeText(
                    exportRowsToSqlInsert(
                      tableName ?? "UnknownTable",
                      headers,
                      rows
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
      onContextMenu={onCellContextMenu}
      stickyHeaderIndex={stickyHeaderIndex}
      headers={headerMemo}
      data={data.rows}
      renderAhead={20}
      renderCell={renderCell}
      rowHeight={35}
    />
  );
}
