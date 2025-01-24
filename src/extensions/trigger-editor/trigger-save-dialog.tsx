import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LucideAlertCircle, LucideLoader, LucideSave } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDatabaseDriver } from "@/context/driver-provider";
import { useSchema } from "@/context/schema-provider";
import { DatabaseTriggerSchema } from "@/drivers/base-driver";
import CodePreview from "@/components/gui/code-preview";
import { triggerEditorExtensionTab } from ".";

interface Props {
  onClose: () => void;
  previewScript: string[];
  trigger: DatabaseTriggerSchema;
}

export function TriggerSaveDialog(props: Props) {
  const { refresh: refreshSchema } = useSchema();
  const { databaseDriver } = useDatabaseDriver();
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSave = useCallback(() => {
    setIsExecuting(true);
    databaseDriver
      .transaction(
        props.previewScript
      )
      .then(() => {
        refreshSchema();
        triggerEditorExtensionTab.replace({
          schemaName: props.trigger.schemaName,
          name: props.trigger.name ?? '',
          tableName: props.trigger.tableName
        })
        props.onClose();
      })
      .catch((err) => setErrorMessage((err as Error).message))
      .finally(() => {
        setIsExecuting(false);
      });
  }, [databaseDriver, props, refreshSchema])

  return (
    <AlertDialog open onOpenChange={props.onClose}>
      <AlertDialogContent>
        <AlertDialogTitle>Preview</AlertDialogTitle>

        {errorMessage && (
          <div className="text-sm text-red-500 font-mono flex gap-4 justify-end items-end">
            <LucideAlertCircle className="w-12 h-12" />
            <p>{errorMessage}</p>
          </div>
        )}

        <p>Are you sure you want to run this change?</p>
        <CodePreview code={props.previewScript.join(";\n")} />
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
