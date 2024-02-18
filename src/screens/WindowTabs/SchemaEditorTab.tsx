import OpacityLoading from "@/app/(components)/OpacityLoading";
import SqlEditor from "@/components/SqlEditor";
import SchemaEditor, {
  DatabaseTableSchemaChange,
} from "@/components/schema-editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
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
          createScript: schema.createScript,
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

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel>
        <SchemaEditor value={schema} onChange={setSchema} />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        <SqlEditor value={schema.createScript ?? ""} readOnly />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
