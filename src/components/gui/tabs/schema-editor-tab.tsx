import OpacityLoading from "@/components/gui/loading-opacity";
import { useTabsContext } from "@/components/gui/windows-tab";
import SchemaEditor, {
  DatabaseTableSchemaChange,
} from "@/components/gui/schema-editor";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import generateSqlSchemaChange from "@/components/lib/sql-generate.schema";
import { LucideLoader, LucideSave, LucideTableProperties } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDatabaseDriver } from "@/context/driver-provider";
import CodePreview from "../code-preview";
import { useSchema } from "@/context/schema-provider";

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
            identifier: "_schema_" + schema.name.new,
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

      <SchemaEditor
        value={schema}
        onChange={setSchema}
        onSave={onSaveToggle}
        onDiscard={onDiscard}
      />
    </>
  );
}
