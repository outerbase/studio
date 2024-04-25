import { PropsWithChildren, createContext, useContext } from "react";
import { DatabaseTableColumnChange } from ".";

const ColumnContext = createContext<{ columns: DatabaseTableColumnChange[] }>({
  columns: [],
});

export function useColumnList() {
  return useContext(ColumnContext);
}

export function ColumnsProvider({
  children,
  value,
}: PropsWithChildren<{ value: DatabaseTableColumnChange[] }>) {
  return (
    <ColumnContext.Provider value={{ columns: value }}>
      {children}
    </ColumnContext.Provider>
  );
}
