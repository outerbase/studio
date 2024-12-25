import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LucideAlertCircle, LucideLoader, LucideSave } from "lucide-react";
import { useState } from "react";
import CodePreview from "../code-preview";
import { Button } from "@/components/ui/button";
import { useDatabaseDriver } from "@/context/driver-provider";
import { TriggerEditorProps } from ".";
import { DatabaseTriggerSchemaChange } from "@/drivers/base-driver";

interface Props {
  onClose: () => void;
  previewScript: string[];
  onSave: (trigger: TriggerEditorProps) => void;
  trigger: DatabaseTriggerSchemaChange;
  schemaName: string;
  tableName?: string;
}

export function TriggerSaveDialog(props: Props) {
  const { databaseDriver } = useDatabaseDriver();
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSave = () => {
    setIsExecuting(true);
    const isCreated = !props.trigger.name.old
    databaseDriver
    databaseDriver.transaction(
      isCreated ? props.previewScript : [`DROP TRIGGER IF EXISTS \`${props.schemaName}\`.\`${props.trigger.name.old}\``, ...props.previewScript],
    ).then(() => {
      props.onSave({
        tableName: props.tableName,
        schemaName: props.schemaName,
        name: props.trigger.name.new ?? ""
      })
    }).catch((err) => setErrorMessage((err as Error).message))
      .finally(() => {
        setIsExecuting(false);
      });
  }

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
  )
}