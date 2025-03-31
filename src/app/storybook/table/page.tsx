"use client";

import OptimizeTable, {
  OptimizeTableCellRenderProps,
  OptimizeTableHeaderWithIndexProps,
} from "@/components/gui/table-optimized";
import { createSimpleTableState } from "@/components/gui/table-optimized/helper";
import { useCallback, useMemo } from "react";

export default function TableStorybookPage() {
  const state = useMemo(() => {
    return createSimpleTableState(
      ["id", "name", "age"],
      [
        { id: 1, name: "John", age: 25 },
        { id: 2, name: "Jane", age: 30 },
        { id: 3, name: "Doe", age: 22 },
        { id: 4, name: "Alice", age: 28 },
        { id: 5, name: "Bob", age: 35 },
        { id: 6, name: "Charlie", age: 27 },
        { id: 7, name: "David", age: 32 },
        { id: 8, name: "Eve", age: 29 },
        { id: 9, name: "Frank", age: 31 },
        { id: 10, name: "Grace", age: 26 },
      ]
    );
  }, []);

  const renderCell = useCallback(
    ({ state, x, y }: OptimizeTableCellRenderProps) => {
      const value = (state.getValue(y, x) as string).toString();
      return <div className="flex h-[36px] items-center p-1">{value}</div>;
    },
    []
  );

  const renderHeader = useCallback(
    (header: OptimizeTableHeaderWithIndexProps) => {
      return (
        <div className="flex h-[36px] items-center p-1">
          {header.display.text}
        </div>
      );
    },
    []
  );

  return (
    <div className="h-[400px] w-[800px] overflow-hidden border">
      <OptimizeTable
        internalState={state}
        renderAhead={3}
        rowHeight={36}
        arrangeHeaderIndex={[0, 1, 2]}
        renderCell={renderCell}
        renderHeader={renderHeader}
      />
    </div>
  );
}
