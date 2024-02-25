import OpacityLoading from "@/app/(components)/OpacityLoading";
import { useTabsContext } from "@/app/(components)/WindowTabs";
import SqlEditor from "@/components/SqlEditor";
import SchemaEditor, {
  DatabaseTableSchemaChange,
} from "@/components/schema-editor";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { useDatabaseDriver } from "@/context/DatabaseDriverProvider";
import { executeQuries } from "@/lib/multiple-query";
import generateSqlSchemaChange from "@/lib/sql-generate.schema";
import { LucideLoader, LucideSave } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSchema } from "../DatabaseScreen/SchemaProvider";

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
  const { refresh: refreshSchema } = useSchema();
  const [schema, setSchema] = useState<DatabaseTableSchemaChange>(EMPTY_SCHEMA);
  const [loading, setLoading] = useState(!!tableName);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { replaceCurrentTab } = useTabsContext();

  const fetchTable = useCallback(
    async (name: string) => {
      databaseDriver
        .getTableSchema(name)
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

  const onSave = useCallback(() => {
    setIsExecuting(true);
    executeQuries(databaseDriver, previewScript)
      .then(() => {
        if (schema.name.old) {
          fetchTable(schema.name?.new || schema.name?.old || "").then(() =>
            setIsSaving(false)
          );
        } else if (schema.name.new) {
          refreshSchema();
          replaceCurrentTab({
            component: <SchemaEditorTab tableName={schema.name.new} />,
            key: "_schema_" + schema.name.new,
            title: "Edit " + schema.name.new,
          });
        }
      })
      .catch((err) => alert((err as Error).message))
      .finally(() => {
        setIsExecuting(false);
      });
  }, [
    databaseDriver,
    schema,
    fetchTable,
    previewScript,
    replaceCurrentTab,
    refreshSchema,
  ]);

  if (loading) {
    return (
      <div>
        <OpacityLoading />
      </div>
    );
  }

  return (
    <>
      <AlertDialog open={isSaving} onOpenChange={onSaveToggle}>
        <AlertDialogContent>
          Are you sure you want to run this change?
          <pre className="p-2 bg-secondary text-sm">
            {previewScript.join(";\n")}
          </pre>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={onSave}>
              {isExecuting ? (
                <LucideLoader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LucideSave className="w-4 h-4 mr-2" />
              )}
              Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ResizablePanelGroup direction="vertical">
        <ResizablePanel>
          <SchemaEditor
            value={schema}
            onChange={setSchema}
            onSave={onSaveToggle}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel collapsible>
          <div className="flex flex-col h-full">
            <div className="px-3 py-2 text-xs font-semibold">Preview</div>
            <Separator />
            <div className="flex-grow overflow-hidden">
              <SqlEditor value={previewScript.join(";\n")} readOnly />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
