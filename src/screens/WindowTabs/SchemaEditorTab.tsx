import OpacityLoading from "@/app/(components)/OpacityLoading";
import SchemaEditor from "@/components/custom/SchemaEditor";
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
  const [schema, setSchema] = useState<DatabaseTableSchema>();

  useEffect(() => {
    databaseDriver
      .getTableSchema(tableName)
      .then(setSchema)
      .catch(console.error);
  }, [databaseDriver, tableName]);

  if (!schema) {
    return (
      <div>
        <OpacityLoading />
      </div>
    );
  }

  return <SchemaEditor initialSchema={schema} />;
}
