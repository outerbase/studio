import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useStudioContext } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import { DatabaseTableSchemaChange } from "@/drivers/base-driver";
import {
  LucideAlertCircle,
  LucideLoader,
  LucideSave,
  LucideTableProperties,
} from "lucide-react";
import { useCallback, useState } from "react";
import CodePreview from "../code-preview";
import SchemaEditorTab from "../tabs/schema-editor-tab";
import { useTabsContext } from "../windows-tab";

export default function SchemaSaveDialog({
  schema,
  previewScript,
  onClose,
  fetchTable,
}: {
  schema: DatabaseTableSchemaChange;
  previewScript: string[];
  onClose: () => void;
  fetchTable: (schemeName: string, tableName: string) => Promise<void>;
}) {
  const { databaseDriver } = useStudioContext();
  const { refresh: refreshSchema } = useSchema();
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { replaceCurrentTab } = useTabsContext();

  const onSave = useCallback(() => {
    setIsExecuting(true);
    databaseDriver
      .transaction(previewScript)
      .then(() => {
        refreshSchema();

        if (schema.name.new !== schema.name.old) {
          replaceCurrentTab({
            component: (
              <SchemaEditorTab
                tableName={schema.name.new}
                schemaName={schema.schemaName}
              />
            ),
            key: "_schema_" + schema.name.new,
            identifier: "_schema_" + schema.name.new,
            title: "Edit " + schema.name.new,
            icon: LucideTableProperties,
          });
        } else if (schema.name.old && schema.schemaName) {
          fetchTable(
            schema.schemaName,
            schema.name?.new || schema.name?.old || ""
          ).then(onClose);
        }
      })
      .catch((err) => setErrorMessage((err as Error).message))
      .finally(() => {
        setIsExecuting(false);
      });
  }, [
    onClose,
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
        <AlertDialogTitle>Preview</AlertDialogTitle>

        {errorMessage && (
          <div className="flex items-end justify-end gap-4 font-mono text-sm text-red-500">
            <LucideAlertCircle className="h-12 w-12" />
            <p>{errorMessage}</p>
          </div>
        )}

        <p>Are you sure you want to run this change?</p>
        <CodePreview code={previewScript.join(";\n")} />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={onSave}>
            {isExecuting ? (
              <LucideLoader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LucideSave className="mr-2 h-4 w-4" />
            )}
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
