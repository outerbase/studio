import ConnectingDialog from "@/components/gui/connection-dialog";
import { DatabaseSchemaItem, DatabaseSchemas } from "@/drivers/base-driver";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAutoComplete } from "./auto-complete-provider";
import { useStudioContext } from "./driver-provider";

type AutoCompletionSchema = Record<string, Record<string, string[]> | string[]>;

const SchemaContext = createContext<{
  schema: DatabaseSchemas;
  currentSchema: DatabaseSchemaItem[];
  autoCompleteSchema: AutoCompletionSchema;
  currentSchemaName: string;
  refresh: () => void;
}>({
  schema: {},
  autoCompleteSchema: {},
  currentSchema: [],
  currentSchemaName: "",
  refresh: () => {
    throw new Error("Not implemented");
  },
});

function generateAutoCompleteFromSchemaItems(
  items?: DatabaseSchemaItem[]
): Record<string, string[]> {
  if (!items) return {};

  return items
    .filter((x) => x.type === "table" || x.type === "view")
    .reduce(
      (a, b) => {
        a[b.name] = (b.tableSchema?.columns ?? []).map((c) => c.name);
        return a;
      },
      {} as Record<string, string[]>
    );
}

export function generateAutoComplete(
  currentSchemaName: string,
  schema: DatabaseSchemas
) {
  return {
    ...generateAutoCompleteFromSchemaItems(schema[currentSchemaName]),
    ...Object.entries(schema).reduce((a, [schemaName, tableList]) => {
      a[schemaName] = generateAutoCompleteFromSchemaItems(tableList);
      return a;
    }, {} as AutoCompletionSchema),
  };
}

export function useSchema() {
  return useContext(SchemaContext);
}

export function SchemaProvider({ children }: Readonly<PropsWithChildren>) {
  const { updateTableList, updateTableSchema } = useAutoComplete();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const { databaseDriver, extensions } = useStudioContext();

  const [schema, setSchema] = useState<DatabaseSchemas>({});
  const [currentSchema, setCurrentSchema] = useState<DatabaseSchemaItem[]>([]);
  const [currentSchemaName, setCurrentSchemaName] = useState(
    () => databaseDriver.getFlags().defaultSchema
  );

  const fetchSchema = useCallback(
    (refresh?: boolean) => {
      if (refresh) {
        setLoading(true);
      }

      const getSchema = async () => {
        const schemaResult = await databaseDriver.schemas();
        let selectedSchema = null;

        // If databasse driver support get current schema,
        // We will use it to override the default schema
        if (databaseDriver.getFlags().supportUseStatement) {
          selectedSchema = await databaseDriver.getCurrentSchema();
        }

        return { schemaResult, selectedSchema };
      };

      getSchema()
        .then((result) => {
          setSchema(result.schemaResult);

          if (result.selectedSchema) {
            setCurrentSchemaName(result.selectedSchema);
          }

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

  /**
   * Triggered when re-fetching the database schema.
   * This is particularly useful for Outerbase Cloud,
   * which needs to update its data catalog to provide
   * the schema to the AI.
   */
  useEffect(() => {
    if (schema && Object.entries(schema).length > 0) {
      extensions.triggerAfterFetchSchemaCallback(schema);
    }
  }, [schema, extensions]);

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
    return {
      schema,
      currentSchema,
      currentSchemaName,
      refresh: fetchSchema,
      autoCompleteSchema: generateAutoComplete(currentSchemaName, schema),
    };
  }, [schema, fetchSchema, currentSchema, currentSchemaName]);

  if (error || loading) {
    return <ConnectingDialog message={error} loading={loading} />;
  }

  return (
    <SchemaContext.Provider value={props}>{children}</SchemaContext.Provider>
  );
}
