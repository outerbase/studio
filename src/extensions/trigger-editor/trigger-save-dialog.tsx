import CodePreview from "@/components/gui/code-preview";
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
import { DatabaseTriggerSchema } from "@/drivers/base-driver";
import { LucideAlertCircle, LucideLoader, LucideSave } from "lucide-react";
import { useCallback, useState } from "react";
import { triggerEditorExtensionTab } from ".";

interface Props {
  onClose: () => void;
  previewScript: string[];
  trigger: DatabaseTriggerSchema;
}

export function TriggerSaveDialog(props: Props) {
  const { refresh: refreshSchema } = useSchema();
  const { databaseDriver } = useStudioContext();
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSave = useCallback(() => {
    setIsExecuting(true);
    databaseDriver
      .transaction(props.previewScript)
      .then(() => {
        refreshSchema();
        triggerEditorExtensionTab.replace({
          schemaName: props.trigger.schemaName,
          name: props.trigger.name ?? "",
          tableName: props.trigger.tableName,
        });
        props.onClose();
      })
      .catch((err) => setErrorMessage((err as Error).message))
      .finally(() => {
        setIsExecuting(false);
      });
  }, [databaseDriver, props, refreshSchema]);

  return (
    <AlertDialog open onOpenChange={props.onClose}>
      <AlertDialogContent>
        <AlertDialogTitle>Preview</AlertDialogTitle>

        {errorMessage && (
          <div className="flex items-end justify-end gap-4 font-mono text-sm text-red-500">
            <LucideAlertCircle className="h-12 w-12" />
            <p>{errorMessage}</p>
          </div>
        )}

        <p>Are you sure you want to run this change?</p>
        <CodePreview code={props.previewScript.join(";\n")} />
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
