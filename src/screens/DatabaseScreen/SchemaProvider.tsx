import { useAutoComplete } from "@/context/AutoCompleteProvider";
import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
import { DatabaseSchemaItem } from "@/drivers/DatabaseDriver";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const SchemaContext = createContext<{
  schema: DatabaseSchemaItem[];
  refresh: () => void;
  loading: boolean;
}>({
  schema: [],
  loading: false,
  refresh: () => {
    throw new Error("Not implemented");
  },
});

export function useSchema() {
  return useContext(SchemaContext);
}

export function SchemaProvider({ children }: PropsWithChildren) {
  const { updateTableList } = useAutoComplete();
  const [schemaItems, setSchemaItems] = useState<DatabaseSchemaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { databaseDriver } = useDatabaseDriver();

  const fetchSchema = useCallback(() => {
    setLoading(true);

    databaseDriver.getTableList().then((tableList) => {
      const sortedTableList = [...tableList];
      sortedTableList.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });

      setSchemaItems(sortedTableList);
      updateTableList(tableList.map((table) => table.name));
      setLoading(false);
    });
  }, [databaseDriver, updateTableList]);

  if (loading) {
    return <div>Loading</div>;
  }

  return (
    <SchemaContext.Provider
      value={{ schema: schemaItems, refresh: fetchSchema, loading }}
    >
      {children}
    </SchemaContext.Provider>
  );
}
