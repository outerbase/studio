import OpacityLoading from "@/components/gui/loading-opacity";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDatabaseDriver } from "@/context/driver-provider";
import SchemaSaveDialog from "../schema-editor/schema-save-dialog";
import { DatabaseTableSchemaChange } from "@/drivers/base-driver";
import SchemaEditor from "../schema-editor";
import { createTableSchemaDraft } from "@/lib/sql/sql-generate.schema";
import { cloneDeep } from "lodash";

interface SchemaEditorTabProps {
  tableName?: string;
  schemaName?: string;
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
  schemaName,
  tableName,
}: Readonly<SchemaEditorTabProps>) {
  const { databaseDriver } = useDatabaseDriver();
  const [schema, setSchema] = useState<DatabaseTableSchemaChange>({
    ...EMPTY_SCHEMA,
    schemaName,
  });
  const [loading, setLoading] = useState(!!tableName);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTable = useCallback(
    async (schemaName: string, name: string) => {
      databaseDriver
        .tableSchema(schemaName, name)
        .then((schema) => {
          setSchema(createTableSchemaDraft(schemaName, schema));
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    },
    [databaseDriver, setSchema]
  );

  useEffect(() => {
    if (tableName && schemaName) {
      fetchTable(schemaName, tableName).then().catch(console.error);
    }
  }, [fetchTable, schemaName, tableName]);

  const previewScript = useMemo(() => {
    return databaseDriver.createUpdateTableSchema(schema);
  }, [schema, databaseDriver]);

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
            key: col.key,
            old: col.old,
            new: cloneDeep(col.old),
          }))
          .filter((col) => col.old),
        constraints: prev.constraints.map((con) => ({
          id: window.crypto.randomUUID(),
          old: con.old,
          new: cloneDeep(con.old),
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
