import TextCell from "@/app/(components)/Cells/TextCell";
import OptimizeTable from "@/app/(components)/OptimizeTable";
import * as hrana from "@libsql/hrana-client";
import { LucideKey } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

interface ResultTableProps {
  data: hrana.RowsResult;
  primaryKey?: string[];
}

export default function ResultTable({ data, primaryKey }: ResultTableProps) {
  const [selectedRowsIndex, setSelectedRowsIndex] = useState<number[]>([]);

  const handleSelectedRowsChange = (selectedRows: number[]) => {
    setSelectedRowsIndex(selectedRows);
  };

  const headerMemo = useMemo(() => {
    return data.columnNames.map((header, idx) => ({
      name: header || "",
      resizable: true,
      initialSize: Math.max((header ?? "").length * 10, 150),
      icon: (primaryKey ?? []).includes(header ?? "") ? (
        <LucideKey className="w-4 h-4 text-red-500" />
      ) : undefined,
    }));
  }, [data, primaryKey]);

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
      return <TextCell value={""} />;
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
