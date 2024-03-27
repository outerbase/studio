import { useAutoComplete } from "@/context/AutoCompleteProvider";
import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import ConnectingDialog from "../components/connection-dialog";
import { DatabaseSchemaItem } from "@/drivers/base-driver";

const SchemaContext = createContext<{
  schema: DatabaseSchemaItem[];
  refresh: () => void;
}>({
  schema: [],
  refresh: () => {
    throw new Error("Not implemented");
  },
});

export function useSchema() {
  return useContext(SchemaContext);
}

export function SchemaProvider({ children }: Readonly<PropsWithChildren>) {
  const { updateTableList } = useAutoComplete();
  const [error, setError] = useState<string>();
  const [schemaItems, setSchemaItems] = useState<DatabaseSchemaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { databaseDriver } = useDatabaseDriver();

  const fetchSchema = useCallback(
    (refresh?: boolean) => {
      if (refresh) {
        setLoading(true);
      }

      databaseDriver
        .schemas()
        .then((tableList) => {
          const sortedTableList = [...tableList];
          sortedTableList.sort((a, b) => {
            return a.name.localeCompare(b.name);
          });

          setSchemaItems(sortedTableList);
          updateTableList(tableList.map((table) => table.name));

          setError(undefined);
          setLoading(false);
        })
        .catch((e) => {
          setError(e.message);
          setLoading(false);
        });
    },
    [databaseDriver, updateTableList, setError]
  );

  useEffect(() => {
    fetchSchema(true);
  }, [fetchSchema]);

  const props = useMemo(() => {
    return { schema: schemaItems, refresh: fetchSchema };
  }, [schemaItems, fetchSchema]);

  if (error || loading) {
    return <ConnectingDialog message={error} loading={loading} />;
  }

  return (
    <SchemaContext.Provider value={props}>{children}</SchemaContext.Provider>
  );
}
