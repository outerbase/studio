import OpacityLoading from "@/components/gui/loading-opacity";
import SchemaEditor, {
  DatabaseTableSchemaChange,
} from "@/components/gui/schema-editor";
import generateSqlSchemaChange from "@/components/lib/sql-generate.schema";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDatabaseDriver } from "@/context/driver-provider";
import SchemaSaveDialog from "../schema-editor/schema-save-dialog";

interface SchemaEditorTabProps {
  tableName?: string;
}

const EMPTY_SCHEMA: DatabaseTableSchemaChange = {
  name: {
    old: "",
    new: "",
  },
  columns: [],
  constraints: [],
  createScript: "",
};

export default function SchemaEditorTab({
  tableName,
}: Readonly<SchemaEditorTabProps>) {
  const { databaseDriver } = useDatabaseDriver();
  const [schema, setSchema] = useState<DatabaseTableSchemaChange>(EMPTY_SCHEMA);
  const [loading, setLoading] = useState(!!tableName);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTable = useCallback(
    async (name: string) => {
      databaseDriver
        .tableSchema(name)
        .then((schema) => {
          setSchema({
            name: {
              old: schema.tableName,
              new: schema.tableName,
            },
            columns: schema.columns.map((col) => ({
              old: col,
              new: structuredClone(col),
            })),
            constraints: (schema.constraints ?? []).map((con) => ({
              id: window.crypto.randomUUID(),
              old: con,
              new: structuredClone(con),
            })),
            createScript: schema.createScript,
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    },
    [databaseDriver, setSchema]
  );

  useEffect(() => {
    if (tableName) {
      fetchTable(tableName).then().catch(console.error);
    }
  }, [fetchTable, tableName]);

  const previewScript = useMemo(() => {
    return generateSqlSchemaChange(schema);
  }, [schema]);

  const onSaveToggle = useCallback(
    () => setIsSaving((prev) => !prev),
    [setIsSaving]
  );

  const onDiscard = useCallback(() => {
    setSchema((prev) => {
      return {
        name: { ...prev.name, new: prev.name.old },
        columns: prev.columns
          .map((col) => ({
            old: col.old,
            new: structuredClone(col.old),
          }))
          .filter((col) => col.old),
        constraints: prev.constraints.map((con) => ({
          id: window.crypto.randomUUID(),
          old: con.old,
          new: structuredClone(con.old),
        })),
      };
    });
  }, [setSchema]);

  if (loading) {
    return (
      <div>
        <OpacityLoading />
      </div>
    );
  }
  return (
    <>
      {isSaving && (
        <SchemaSaveDialog
          fetchTable={fetchTable}
          onClose={onSaveToggle}
          schema={schema}
          previewScript={previewScript}
        />
      )}

      <SchemaEditor
        value={schema}
        onChange={setSchema}
        onSave={onSaveToggle}
        onDiscard={onDiscard}
      />
    </>
  );
}
