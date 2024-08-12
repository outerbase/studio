import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import ConnectingDialog from "@/components/gui/connection-dialog";
import { DatabaseSchemaItem, DatabaseSchemas } from "@/drivers/base-driver";
import { useDatabaseDriver } from "./driver-provider";
import { useAutoComplete } from "./auto-complete-provider";

const SchemaContext = createContext<{
  schema: DatabaseSchemas;
  currentSchema: DatabaseSchemaItem[];
  currentSchemaName: string;
  refresh: () => void;
}>({
  schema: {},
  currentSchema: [],
  currentSchemaName: "",
  refresh: () => {
    throw new Error("Not implemented");
  },
});

export function useSchema() {
  return useContext(SchemaContext);
}

export function SchemaProvider({ children }: Readonly<PropsWithChildren>) {
  const { updateTableList, updateTableSchema } = useAutoComplete();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { databaseDriver } = useDatabaseDriver();

  const [schema, setSchema] = useState<DatabaseSchemas>({});
  const [currentSchema, setCurrentSchema] = useState<DatabaseSchemaItem[]>([]);
  const currentSchemaName = databaseDriver.getFlags().defaultSchema;

  const fetchSchema = useCallback(
    (refresh?: boolean) => {
      if (refresh) {
        setLoading(true);
      }

      databaseDriver
        .schemas()
        .then((result) => {
          setSchema(result);
          setError(undefined);
          setLoading(false);
        })
        .catch((e) => {
          setError(e.message);
          setLoading(false);
        });
    },
    [databaseDriver, setError]
  );

  useEffect(() => {
    if (schema[currentSchemaName]) {
      setCurrentSchema(schema[currentSchemaName]);
    }
  }, [currentSchemaName, schema, setCurrentSchema]);

  useEffect(() => {
    const sortedTableList = [...currentSchema];
    sortedTableList.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    updateTableList(currentSchema.map((table) => table.name));

    for (const table of currentSchema) {
      if (table.tableSchema) {
        updateTableSchema(table.name, table.tableSchema.columns);
      }
    }
  }, [currentSchema, updateTableList, updateTableSchema]);

  useEffect(() => {
    fetchSchema(true);
  }, [fetchSchema]);

  const props = useMemo(() => {
    return { schema, currentSchema, currentSchemaName, refresh: fetchSchema };
  }, [schema, fetchSchema, currentSchema, currentSchemaName]);

  if (error || loading) {
    return <ConnectingDialog message={error} loading={loading} />;
  }

  return (
    <SchemaContext.Provider value={props}>{children}</SchemaContext.Provider>
  );
}
