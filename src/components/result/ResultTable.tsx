import TextCell from "@/app/(components)/Cells/TextCell";
import OptimizeTable from "@/app/(components)/OptimizeTable";
import * as hrana from "@libsql/hrana-client";
import { useCallback, useMemo, useState } from "react";

interface ResultTableProps {
  data: hrana.RowsResult;
}

export default function ResultTable({ data }: ResultTableProps) {
  const [selectedRowsIndex, setSelectedRowsIndex] = useState<number[]>([]);

  const handleSelectedRowsChange = (selectedRows: number[]) => {
    setSelectedRowsIndex(selectedRows);
  };

  const headerMemo = useMemo(() => {
    return data.columnNames.map((header, idx) => ({
      name: header || "",
      resizable: true,
      initialSize: Math.max((header ?? "").length * 10, 150),
    }));
  }, [data]);

  const renderCell = useCallback(
    (y: number, x: number) => {
      if (data.rows[y]) {
        return (
          <TextCell value={data.rows[y][x] as string} />
          // <TableCell
          //   key={data[y].rowIndex + '_' + x + '_' + revision}
          //   value={data[y].data[headers[x].name]}
          //   header={headers[x]}
          //   col={x}
          //   row={data[y].rowIndex}
          //   readOnly={!updatableTables[headers[x]?.schema?.table || '']}
          // />
        );
      }
      return <></>;
    },
    [data]
  );

  return (
    <OptimizeTable
      headers={headerMemo}
      data={data.rows}
      renderAhead={20}
      renderCell={renderCell}
      rowHeight={35}
      selectedRowsIndex={selectedRowsIndex}
      onSelectedRowsIndexChanged={handleSelectedRowsChange}
    />
  );
}
