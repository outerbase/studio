import OpacityLoading from "@/components/loading-opacity";
import { useTabsContext } from "@/components/windows-tab";
import SqlEditor from "@/components/sql-editor";
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
import generateSqlSchemaChange from "@/lib/sql-generate.schema";
import { LucideLoader, LucideSave, LucideTableProperties } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDatabaseDriver } from "@/contexts/driver-provider";
import CodePreview from "../code-preview";
import { useSchema } from "@/contexts/schema-provider";

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

  const onSave = useCallback(() => {
    setIsExecuting(true);
    databaseDriver
      .transaction(previewScript)
      .then(() => {
        if (schema.name.new !== schema.name.old) {
          refreshSchema();
          replaceCurrentTab({
            component: <SchemaEditorTab tableName={schema.name.new} />,
            key: "_schema_" + schema.name.new,
            title: "Edit " + schema.name.new,
            icon: LucideTableProperties,
          });
        } else if (schema.name.old) {
          fetchTable(schema.name?.new || schema.name?.old || "").then(() =>
            setIsSaving(false)
          );
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
      <AlertDialog open={isSaving} onOpenChange={onSaveToggle}>
        <AlertDialogContent>
          Are you sure you want to run this change?
          <CodePreview code={previewScript.join(";\n")} />
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
            onDiscard={onDiscard}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel collapsible>
          <div className="flex flex-col h-full">
            <div className="px-3 py-2 text-xs font-semibold">Preview</div>
            <Separator />
            <div className="grow overflow-hidden">
              <SqlEditor value={previewScript.join(";\n")} readOnly />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
