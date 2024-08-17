import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import CodePreview from "../code-preview";
import { Button } from "@/components/ui/button";
import {
  LucideAlertCircle,
  LucideLoader,
  LucideSave,
  LucideTableProperties,
} from "lucide-react";
import { DatabaseTableSchemaChange } from ".";
import { useTabsContext } from "../windows-tab";
import { useDatabaseDriver } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import { useCallback, useState } from "react";
import SchemaEditorTab from "../tabs/schema-editor-tab";

export default function SchemaSaveDialog({
  schemaName,
  schema,
  previewScript,
  onClose,
  fetchTable,
}: {
  schemaName: string;
  schema: DatabaseTableSchemaChange;
  previewScript: string[];
  onClose: () => void;
  fetchTable: (tableName: string) => Promise<void>;
}) {
  const { databaseDriver } = useDatabaseDriver();
  const { refresh: refreshSchema } = useSchema();
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { replaceCurrentTab } = useTabsContext();

  const onSave = useCallback(() => {
    setIsExecuting(true);
    databaseDriver
      .transaction(previewScript)
      .then(() => {
        if (schema.name.new !== schema.name.old) {
          refreshSchema();
          replaceCurrentTab({
            component: (
              <SchemaEditorTab
                tableName={schema.name.new}
                schemaName={schemaName}
              />
            ),
            key: "_schema_" + schema.name.new,
            identifier: "_schema_" + schema.name.new,
            title: "Edit " + schema.name.new,
            icon: LucideTableProperties,
          });
        } else if (schema.name.old) {
          fetchTable(schema.name?.new || schema.name?.old || "").then(onClose);
        }
      })
      .catch((err) => setErrorMessage((err as Error).message))
      .finally(() => {
        setIsExecuting(false);
      });
  }, [
    onClose,
    schemaName,
    databaseDriver,
    schema,
    fetchTable,
    previewScript,
    replaceCurrentTab,
    refreshSchema,
  ]);

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        {errorMessage && (
          <div className="text-sm text-red-500 font-mono flex gap-4 justify-end items-end">
            <LucideAlertCircle className="w-12 h-12" />
            <p>{errorMessage}</p>
          </div>
        )}

        <p>Are you sure you want to run this change?</p>
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
  );
}
