import { DatabaseTableColumn } from "@/drivers/base-driver";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const AutoCompleteContext = createContext<{
  updateTableList: (tables: string[]) => void;
  updateTableSchema: (
    tableName: string,
    columns: DatabaseTableColumn[]
  ) => void;
  schema: Record<string, string[]>;
}>({
  schema: {},
  updateTableList: () => {
    throw new Error("Not implemented");
  },
  updateTableSchema: () => {
    throw new Error("Not implemented");
  },
});

export function useAutoComplete() {
  return useContext(AutoCompleteContext);
}

export function AutoCompleteProvider({ children }: PropsWithChildren) {
  const [internalSchema, setInternalSchema] = useState<
    Record<string, DatabaseTableColumn[]>
  >({});

  const updateTableSchema = useCallback(
    (tableName: string, columns: DatabaseTableColumn[]) => {
      setInternalSchema((prev) => {
        return {
          ...prev,
          [tableName]: columns,
        };
      });
    },
    [setInternalSchema]
  );

  const updateTableList = useCallback(
    (tableName: string[]) => {
      setInternalSchema(
        tableName.reduce<Record<string, DatabaseTableColumn[]>>((acc, name) => {
          acc[name] = [];
          return acc;
        }, {})
      );
    },
    [setInternalSchema]
  );

  const schema = useMemo(() => {
    return Object.entries(internalSchema).reduce<Record<string, string[]>>(
      (acc, [key, columns]) => {
        acc[key] = columns.map((col) => col.name);
        return acc;
      },
      {}
    );
  }, [internalSchema]);

  return (
    <AutoCompleteContext.Provider
      value={{ schema, updateTableList, updateTableSchema }}
    >
      {children}
    </AutoCompleteContext.Provider>
  );
}
