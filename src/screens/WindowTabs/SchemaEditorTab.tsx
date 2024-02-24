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
import { Separator } from "@/components/ui/separator";
import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
import generateSqlSchemaChange from "@/lib/sql-generate.schema";
import { useEffect, useMemo, useState } from "react";

interface SchemaEditorTabProps {
  tableName?: string;
}

const EMPTY_SCHEMA: DatabaseTableSchemaChange = {
  name: {
    old: "",
    new: "",
  },
  columns: [],
  createScript: "",
};

export default function SchemaEditorTab({
  tableName,
}: Readonly<SchemaEditorTabProps>) {
  const { databaseDriver } = useDatabaseDriver();
  const [schema, setSchema] = useState<DatabaseTableSchemaChange>(EMPTY_SCHEMA);
  const [loading, setLoading] = useState(!!tableName);

  useEffect(() => {
    if (tableName) {
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
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [databaseDriver, setSchema, tableName]);

  const previewScript = useMemo(() => {
    return generateSqlSchemaChange(schema);
  }, [schema]);

  if (loading) {
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
      <ResizablePanel collapsible>
        <div className="flex flex-col h-full">
          <div className="px-3 py-2 text-xs font-semibold">Preview</div>
          <Separator />
          <div className="flex-grow overflow-hidden">
            <SqlEditor value={previewScript} readOnly />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
