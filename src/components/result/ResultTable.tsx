import * as hrana from "@libsql/hrana-client";
import { Column, ReactGrid } from "@silevis/reactgrid";
import { useEffect, useMemo, useState } from "react";

interface ResultTableProps {
  data: hrana.RowsResult;
}

export default function ResultTable({ data }: ResultTableProps) {
  const [resultHeaders, setResultHeaders] = useState<
    { type: string; name: string; index: number }[]
  >([]);
  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
    setResultHeaders(
      data.columnNames.map((columnName, columnIndex) => {
        return {
          index: columnIndex,
          type: data.columnDecltypes[columnIndex] ?? "TEXT",
          name: columnName ?? "",
        };
      })
    );

    setColumns(
      data.columnNames.map((columnName) => {
        return {
          columnId: columnName ?? "",
          width: 150,
        };
      })
    );
  }, [data]);

  const rows = useMemo(() => {
    const headerRow = {
      rowId: "header",
      cells: resultHeaders.map((header) => ({
        type: "header",
        text: header.name,
      })),
    };

    const dataRows = data.rows.map((row, rowIdx) => {
      return {
        rowId: rowIdx,
        cells: resultHeaders.map((header) => {
          if (
            header.type.indexOf("INTEGER") === 0 ||
            header.type.indexOf("NUMBER") === 0
          ) {
            return {
              type: "number",
              value: row[header.name] as number,
            };
          }

          return {
            type: "text",
            text: row[header.name] as string,
          };
        }),
      };
    });
    return [headerRow, ...dataRows];
  }, [data, resultHeaders]);

  return <ReactGrid rows={rows} columns={columns} />;
}
