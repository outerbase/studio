import { useSchema } from "@/context/schema-provider";
import TriggerEditor from "../trigger-editor";
import { useTabsContext } from "../windows-tab";
import { LucideTableProperties } from "lucide-react";
import { useEffect, useState } from "react";
import { DatabaseTriggerSchema } from "@/drivers/base-driver";
import { useDatabaseDriver } from "@/context/driver-provider";
import OpacityLoading from "../loading-opacity";
import { produce } from "immer";
import { TriggerController } from "../trigger-editor/trigger-controller";

import { isEqual } from "lodash";

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
  const { databaseDriver } = useDatabaseDriver();
  const { refresh: refreshSchema } = useSchema();
  const { replaceCurrentTab } = useTabsContext();

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

  const onSave = () => {
    refreshSchema();
    replaceCurrentTab({
      component: (
        <TriggerTab
          tableName={value.tableName}
          schemaName={value.schemaName}
          name={value.name ?? ""}
        />
      ),
      key: "trigger-" + value.name || "",
      identifier: "trigger-" + value.name || "",
      title: value.name || "",
      icon: LucideTableProperties,
    });
  };

  if (loading) {
    return <OpacityLoading />;
  }

  return (
    <div className="flex flex-col overflow-hidden w-full h-full">
      <TriggerController
        onSave={() => {
          // @adam do something here
        }}
        onDiscard={() => {
          setValue(initialValue);
        }}
      />

      <TriggerEditor value={value} onChange={setValue} />
    </div>
  );
}
