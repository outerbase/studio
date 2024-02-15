import OpacityLoading from "@/app/(components)/OpacityLoading";
import SchemaEditor, {
  DatabaseTableSchemaChange,
} from "@/components/custom/SchemaEditor";
import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
import { DatabaseTableSchema } from "@/drivers/DatabaseDriver";
import { useEffect, useState } from "react";

interface SchemaEditorTabProps {
  tableName: string;
}

export default function SchemaEditorTab({
  tableName,
}: Readonly<SchemaEditorTabProps>) {
  const { databaseDriver } = useDatabaseDriver();
  const [schema, setSchema] = useState<DatabaseTableSchemaChange>();

  useEffect(() => {
    databaseDriver
      .getTableSchema(tableName)
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
        });
      })
      .catch(console.error);
  }, [databaseDriver, setSchema, tableName]);

  if (!schema) {
    return (
      <div>
        <OpacityLoading />
      </div>
    );
  }

  return <SchemaEditor value={schema} onChange={setSchema} />;
}
