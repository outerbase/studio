import OpacityLoading from "@/components/gui/loading-opacity";
import { useStudioContext } from "@/context/driver-provider";
import { DatabaseTriggerSchema } from "@/drivers/base-driver";
import { produce } from "immer";
import { isEqual } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TriggerController } from "./trigger-controller";
import TriggerEditor from "./trigger-editor";
import { TriggerSaveDialog } from "./trigger-save-dialog";

export interface TriggerTabProps {
  name: string;
  tableName?: string;
  schemaName: string;
}

const EMPTY_DEFAULT_TRIGGER: DatabaseTriggerSchema = {
  name: "",
  operation: "INSERT",
  when: "BEFORE",
  tableName: "",
  whenExpression: "",
  statement: "",
  schemaName: "",
};

export default function TriggerTab({
  name,
  schemaName,
  tableName,
}: TriggerTabProps) {
  const { databaseDriver } = useStudioContext();
  const [isSaving, setIsSaving] = useState(false);

  // If name is specified, it means the trigger is already exist
  const [loading, setLoading] = useState(!!name);

  // Loading the inital value
  const [initialValue, setInitialValue] = useState<DatabaseTriggerSchema>(
    () => {
      return produce(EMPTY_DEFAULT_TRIGGER, (draft) => {
        draft.tableName = tableName ?? "";
        draft.schemaName = schemaName ?? "";
      });
    }
  );
  const [value, setValue] = useState<DatabaseTriggerSchema>(initialValue);

  const hasChanged = !isEqual(initialValue, value);

  const previewScript = useMemo(() => {
    const drop = databaseDriver.dropTrigger(value.schemaName, name);
    const create = databaseDriver.createTrigger(value);
    return name ? [drop, create] : [create];
  }, [value, databaseDriver, name]);

  // Loading the trigger
  useEffect(() => {
    if (name && schemaName) {
      databaseDriver
        .trigger(schemaName, name)
        .then((triggerValue) => {
          setValue(triggerValue);
          setInitialValue(triggerValue);
        })
        .finally(() => setLoading(false));
    }
  }, [name, schemaName, databaseDriver]);

  const toggleSaving = useCallback(() => {
    setIsSaving(!isSaving);
  }, [isSaving]);

  if (loading) {
    return <OpacityLoading />;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {isSaving && (
        <TriggerSaveDialog
          onClose={toggleSaving}
          previewScript={previewScript}
          trigger={value}
        />
      )}
      <TriggerController
        onSave={toggleSaving}
        onDiscard={() => {
          setValue(initialValue);
        }}
        disabled={!hasChanged}
        previewScript={previewScript.join(";\n")}
      />

      <TriggerEditor value={value} onChange={setValue} />
    </div>
  );
}
