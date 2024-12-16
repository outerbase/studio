import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useDatabaseDriver } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import { LucideAlertCircle, LucideLoader, LucideSave } from "lucide-react";
import { useCallback, useState } from "react";
import CodePreview from "../../code-preview";
import { Button } from "@/components/ui/button";
import { useTabsContext } from "../../windows-tab";
import { DatabaseSchemaChange } from "@/drivers/base-driver";
import SchemaDatabase from ".";
import { Database } from "@phosphor-icons/react";

interface Props {
  schema: DatabaseSchemaChange;
  previewScript: string;
  onClose: () => void;
}

export function SchemaDatabaseDialog({ previewScript, onClose, schema }: Props) {
  const { databaseDriver } = useDatabaseDriver();
  const { refresh: refreshSchema } = useSchema();
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { replaceCurrentTab } = useTabsContext();

  const onSave = useCallback(() => {
    {
      setIsExecuting(true);
      databaseDriver.transaction([previewScript]).then(() => {
        refreshSchema();
        replaceCurrentTab({
          component: (
            <SchemaDatabase schemaName={schema.name.new} />
          ),
          key: "_database_" + schema.name.new,
          identifier: "_database_" + schema.name.new,
          title: "Edit " + schema.name.new,
          icon: Database,
        });
        onClose();
      }).catch((err) => setErrorMessage((err as Error).message)).finally(() => {
        setIsExecuting(false);
      })
    }
  }, [databaseDriver, onClose, previewScript, refreshSchema, replaceCurrentTab, schema.name.new])

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogTitle>Preview</AlertDialogTitle>
        {errorMessage && (
          <div className="text-sm text-red-500 font-mono flex gap-4 justify-end items-end">
            <LucideAlertCircle className="w-12 h-12" />
            <p>{errorMessage}</p>
          </div>
        )}
        <CodePreview code={previewScript} />
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
  )
}